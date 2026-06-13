import { Fragment, type ReactNode } from 'react';
import { Alert, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Header } from '../components/app/Header';
import { SectionHead } from '../components/app/SectionHead';
import { Screen } from '../components/app/Screen';
import { BottomActionBar } from '../components/app/BottomActionBar';
import { FeedbackReportBody } from '../components/interview/FeedbackReportBody';
import { AnalysisStatusCard } from '../components/reports/AnalysisStatusCard';
import { CompetencySection } from '../components/reports/CompetencySection';
import { GamesSection } from '../components/reports/GamesSection';
import { GrowthTrendChart, PercentileBar, ResponsePatternRows, StressResilienceChart } from '../components/reports/ReportCharts';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Icon } from '../components/ui/Icon';
import { List } from '../components/ui/List';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { ReadinessGauge } from '../components/readiness/ReadinessGauge';
import { gameContent } from '../data/gameContent';
import { games } from '../data/games';
import { reportDetailSections } from '../data/reports';
import { useInterviewSessionForMockExam } from '../data/local/useInterviewSessions';
import { useInterviewAnswers } from '../data/local/useInterviewAnswers';
import { useGameResultsForMockExam } from '../data/local/useGameResults';
import { useMockExamRecord, useMockExamRecords } from '../data/local/useMockExamResults';
import { useMockExamReport, getReportSectionStates } from '../data/server/useMockExamReport';
import { retryInterviewMediaUpload } from '../data/media/interviewMediaUpload';
import { useAuth } from '../providers/AuthProvider';
import { Box } from '../design-system/components/Box';
import { Grid } from '../design-system/components/Grid';
import { HStack, VStack } from '../design-system/components/Stack';
import { Text } from '../design-system/components/Text';
import { useDesignSystemTheme } from '../design-system/provider';
import type {
  MockExamReport,
  ReportCoach,
  ReportCompetencyScore,
  ReportHighlights,
  ReportOverall,
  ReportResilience,
  ReportResponsePattern,
} from '../domain/report';
import type { MockExamRecord, ReportSectionKey } from '../domain/types';
import type { ReportSectionStates } from '../data/server/useMockExamReport';
import { useSQLiteContext } from 'expo-sqlite';

const coverFeatureSections = reportDetailSections.slice(1);
const COMPETENCY_LABELS: Record<ReportCompetencyScore['key'], string> = {
  trust: '신뢰',
  strategy: '전략',
  relationship: '관계',
  value: '가치',
  fit: '조직적합',
};

function showShareNotice() {
  Alert.alert('공유 준비 중', '공유 카드는 다음 업데이트에서 저장할 수 있어요.');
}

function showProNotice() {
  Alert.alert('Pro 준비 중', '구독 화면은 다음 업데이트에서 연결할 예정이에요.');
}

function formatFullDate(sqliteUtcDatetime: string) {
  const date = new Date(`${sqliteUtcDatetime.replace(' ', 'T')}Z`);
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

function formatDurationLabel(durationMs: number) {
  const totalMinutes = Math.max(1, Math.round(durationMs / 60000));
  return `${totalMinutes}분 소요`;
}

function formatScoreDelta(delta: number) {
  return delta >= 0 ? `+${delta}` : String(delta);
}

function totalGameRounds() {
  return games.reduce((sum, game) => sum + gameContent[game.id].totalRounds, 0);
}

function previousRecordFor(record: MockExamRecord, records: MockExamRecord[]) {
  return records.find((item) => item.round === record.round - 1) ?? null;
}

function gameNameFor(gameId: string) {
  return games.find((game) => game.id === gameId)?.name ?? gameId;
}

export function ReportDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const recordId = typeof id === 'string' ? id : null;
  const { data: record, isLoading } = useMockExamRecord(recordId);
  const canUseReportActions = !isLoading && Boolean(record);

  return (
    <Screen safeEdges={['top', 'left', 'right']}>
      <Header
        title="종합 리포트"
        subtitle={`모의고사 · ${record?.round ?? '-'}회차 리포트`}
        showBack
        onBack={() => router.back()}
        rightAction={canUseReportActions ? {
          icon: 'Share',
          label: '공유',
          onPress: showShareNotice,
        } : undefined}
      />
      {isLoading ? <LoadingBody /> : null}
      {!isLoading && !record ? <MissingReportBody onBack={() => router.back()} /> : null}
      {!isLoading && record ? <ReportContent record={record} /> : null}
    </Screen>
  );
}

function LoadingBody() {
  const insets = useSafeAreaInsets();
  const { theme } = useDesignSystemTheme();

  return (
    <Box flex={1} bleedBottom="spacingY.componentDefault" bleedX="spacingX.globalGutter">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + theme.dimension.spacingX.globalGutter }}
        showsVerticalScrollIndicator={false}
      >
        <Box px="spacingX.globalGutter" py="x3">
          <ReportDetailSkeleton />
        </Box>
      </ScrollView>
    </Box>
  );
}

function MissingReportBody({ onBack }: { onBack: () => void }) {
  const insets = useSafeAreaInsets();
  const { theme } = useDesignSystemTheme();

  return (
    <Box flex={1} bleedBottom="spacingY.componentDefault" bleedX="spacingX.globalGutter">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + theme.dimension.spacingX.globalGutter }}
        showsVerticalScrollIndicator={false}
      >
        <Box px="spacingX.globalGutter" py="x3">
          <MissingReport onBack={onBack} />
        </Box>
      </ScrollView>
    </Box>
  );
}

function ReportContent({ record }: { record: MockExamRecord }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useDesignSystemTheme();
  const { data: records = [] } = useMockExamRecords();
  const reportQuery = useMockExamReport(record.id, record.createdAt);
  const row = reportQuery.data ?? null;
  const states = getReportSectionStates(row);
  const report = row?.status === 'done' ? row.report : null;
  const previousRecord = previousRecordFor(record, records);
  const onRetryReport = () => void reportQuery.refetch();

  const cta = resolveBottomCta(report, record);

  return (
    <>
      <Box flex={1} bleedBottom="spacingY.componentDefault" bleedX="spacingX.globalGutter">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + theme.dimension.spacingX.globalGutter }}
          showsVerticalScrollIndicator={false}
        >
          <Box px="spacingX.globalGutter" py="x3">
            <VStack gap="x8">
              {reportDetailSections.map((section) => (
                <VStack key={section.key} gap="x3">
                  {section.key !== 'cover' ? <SectionHead title={section.title} /> : null}
                  <LockedReportSection locked={Boolean(section.locked && !record.pro)}>
                    <ReportSectionBody
                      sectionKey={section.key}
                      record={record}
                      records={records}
                      previousRecord={previousRecord}
                      report={report}
                      states={states}
                      onRetryReport={onRetryReport}
                    />
                  </LockedReportSection>
                </VStack>
              ))}
            </VStack>
          </Box>
        </ScrollView>
      </Box>
      <Box px="spacingX.globalGutter" style={{ paddingBottom: insets.bottom }}>
        <BottomActionBar
          primary={{
            label: cta.label,
            iconRight: 'ArrowRight',
            onPress: () => router.push({ pathname: '/games/[id]', params: { id: cta.gameId } } as never),
          }}
        />
      </Box>
    </>
  );
}

function resolveBottomCta(report: MockExamReport | null, record: MockExamRecord): { label: string; gameId: string } {
  const growth = report?.highlights?.growth_areas?.[0];
  if (growth) {
    return {
      label: `보완 게임 ${growth.action.minutes}분 훈련하기`,
      gameId: growth.action.game_id,
    };
  }
  return { label: '보완 게임 5분 훈련하기', gameId: weakestLocalGameId(record) };
}

function weakestLocalGameId(_record: MockExamRecord): string {
  // Local fallback resolves the actual weakest game inside CoverSection via game
  // results; without that data the first game route is a safe default.
  return games[0].id;
}

function ReportDetailSkeleton() {
  return (
    <VStack gap="x3">
      <Skeleton height="x4" width="x16" />
      <Skeleton height="x8" width="full" />
      <Skeleton borderRadius="r4" height={140} width="full" />
      <Skeleton borderRadius="r4" height={90} width="full" />
    </VStack>
  );
}

type MissingReportProps = {
  onBack: () => void;
};

function MissingReport({ onBack }: MissingReportProps) {
  return (
    <Card>
      <VStack align="center" gap="x2">
        <Text align="center" textStyle="t5Bold">
          리포트를 찾지 못했어요
        </Text>
        <Text align="center" color="fg.neutralMuted" textStyle="t3Regular">
          기록 목록에서 다시 열어주세요.
        </Text>
        <Button label="기록으로 돌아가기" variant="weak" onPress={onBack} />
      </VStack>
    </Card>
  );
}

type LockedReportSectionProps = {
  locked: boolean;
  children: ReactNode;
};

function LockedReportSection({ locked, children }: LockedReportSectionProps) {
  if (!locked) {
    return <>{children}</>;
  }

  return (
    <Box minHeight="x60" position="relative">
      <Box style={{ opacity: 0.18 }}>
        {children}
      </Box>
      <Box
        alignItems="center"
        bottom={0}
        justifyContent="center"
        left={0}
        position="absolute"
        right={0}
        top={0}
      >
        <VStack align="center" gap="x3">
          <Box
            alignItems="center"
            bg="bg.layerFloating"
            borderRadius="full"
            boxShadow="surface"
            height="x14"
            justifyContent="center"
            width="x14"
          >
            <Icon name="Lock" color="fg.brand" size="large" />
          </Box>
          <VStack align="center" gap="x1">
            <Text align="center" textStyle="t5Bold">
              프리미엄 전용 섹션
            </Text>
            <Text align="center" color="fg.neutralMuted" textStyle="t3Regular">
              복원력·응답 패턴·AI 코치는 Pro에서 열려요.
            </Text>
          </VStack>
          <Button
            label="Pro로 잠금 해제"
            iconLeft="Zap"
            onPress={showProNotice}
          />
        </VStack>
      </Box>
    </Box>
  );
}

type ReportSectionBodyProps = {
  sectionKey: ReportSectionKey;
  record: MockExamRecord;
  records: MockExamRecord[];
  previousRecord: MockExamRecord | null;
  report: MockExamReport | null;
  states: ReportSectionStates;
  onRetryReport: () => void;
};

function ReportSectionBody({
  sectionKey,
  record,
  records,
  previousRecord,
  report,
  states,
  onRetryReport,
}: ReportSectionBodyProps) {
  switch (sectionKey) {
    case 'cover':
      return <CoverSection record={record} records={records} overall={report?.overall ?? null} competencies={report?.competencies ?? null} state={states.overall} />;
    case 'games':
      return <GamesSection record={record} previousRecord={previousRecord} />;
    case 'competencies':
      return <CompetenciesSection competencies={report?.competencies ?? null} state={states.competencies} onRetry={onRetryReport} />;
    case 'highlights':
      return <HighlightsSection record={record} highlights={report?.highlights ?? null} state={states.highlights} />;
    case 'interview':
      return <InterviewFeedbackSection mockExamId={record.id} report={report} state={states.interview} />;
    case 'resilience':
      return <ResilienceSection resilience={report?.resilience ?? null} state={states.resilience} onRetry={onRetryReport} />;
    case 'pattern':
      return <ResponsePatternSection pattern={report?.response_pattern ?? null} state={states.pattern} onRetry={onRetryReport} />;
    case 'peer':
      return <GrowthSection record={record} records={records} overall={report?.overall ?? null} />;
    case 'coach':
      return <CoachSection coach={report?.coach ?? null} state={states.coach} onRetry={onRetryReport} />;
  }
}

type CoverSectionProps = {
  record: MockExamRecord;
  records: MockExamRecord[];
  overall: ReportOverall | null;
  competencies: ReportCompetencyScore[] | null;
  state: ReportSectionStates['overall'];
};

function CoverSection({ record, records, overall, competencies, state }: CoverSectionProps) {
  const results = useGameResultsForMockExam(record.id);
  const firstRecord = records.find((item) => item.round === 1);
  const firstDelta = firstRecord ? record.score - firstRecord.score : 0;
  const rankedGames = games
    .map((game) => ({ game, result: results.data?.[game.id] }))
    .filter((item) => item.result != null)
    .sort((a, b) => (b.result?.score ?? 0) - (a.result?.score ?? 0));
  const strongest = rankedGames[0];
  const weakest = rankedGames[rankedGames.length - 1];

  const score = overall?.score ?? record.score;
  const range = overall?.score_range ?? null;
  const showRange = range != null && range[0] !== range[1];

  const competencyTiles = resolveCompetencyTiles(competencies);

  return (
    <VStack gap="x3">
      <VStack gap="x0_5">
        <Text color="fg.neutralSubtle" textStyle="t2Regular">
          {formatFullDate(record.createdAt)} · {formatDurationLabel(record.durationMs)}
        </Text>
        <Text textStyle="t9Bold">오늘의 역량 지도</Text>
        <Text color="fg.neutralMuted" textStyle="t3Regular">
          9개 게임 · {totalGameRounds()}문항 · 5대 역량 분석
        </Text>
      </VStack>

      <Card bg="bg.brandWeak" borderColor="stroke.brandWeak">
        <HStack align="center" gap="x4">
          <ReadinessGauge score={score} size={108} />
          <VStack flex={1} gap="x1">
            <Text color="fg.neutralMuted" textStyle="t2Regular">
              종합 준비도
            </Text>
            <HStack align="center" gap="x1_5">
              <Text textStyle="t10Bold">{score}</Text>
              <Text color="fg.neutralSubtle" textStyle="t3Regular">/ 100</Text>
            </HStack>
            {/* Range slot: reserved so server arrival doesn't shift layout. */}
            <Box style={{ opacity: showRange ? 1 : 0 }}>
              <Text color="fg.neutralSubtle" textStyle="t3Regular">
                {range ? `${range[0]}~${range[1]} 범위` : '0~0 범위'}
              </Text>
            </Box>
            {overall ? (
              <Box style={{ opacity: record.round === 1 ? 0 : 1 }}>
                <Badge
                  label={`첫 회차 대비 ${formatScoreDelta(firstDelta)}`}
                  tone={firstDelta >= 0 ? 'positive' : 'critical'}
                />
              </Box>
            ) : (
              <Badge label="분석 중" tone="neutral" size="small" />
            )}
          </VStack>
        </HStack>
      </Card>

      {overall?.summary ? (
        <Card>
          <Text color="fg.neutralMuted" textStyle="t3Regular">
            {overall.summary}
          </Text>
        </Card>
      ) : null}

      <Grid columns={2} gap="x2">
        {competencyTiles ? (
          <>
            <InsightTile
              label="강한 영역"
              title={`${COMPETENCY_LABELS[competencyTiles.max.key]} · ${competencyTiles.max.score}`}
              description={competencyTiles.max.note}
              tone="positive"
            />
            <InsightTile
              label="보완 영역"
              title={`${COMPETENCY_LABELS[competencyTiles.min.key]} · ${competencyTiles.min.score}`}
              description={competencyTiles.min.note}
              tone="warning"
            />
          </>
        ) : (
          <>
            <InsightTile
              label="강한 영역"
              title={strongest ? `${strongest.game.name} · ${strongest.result?.score}` : '확인 중'}
              description={strongest?.game.description ?? '게임 기록을 확인하고 있어요.'}
              tone="positive"
            />
            <InsightTile
              label="보완 영역"
              title={weakest ? `${weakest.game.name} · ${weakest.result?.score}` : '확인 중'}
              description={weakest?.game.description ?? '게임 기록을 확인하고 있어요.'}
              tone="warning"
            />
          </>
        )}
      </Grid>

      {state === 'pending' ? (
        <Badge label="분석 중" tone="neutral" size="small" />
      ) : null}

      <SectionHead title="이 리포트에는" />
      <Card py="x1">
        <List.Root>
          {coverFeatureSections.map((section, index) => (
            <ReportFeatureRow key={section.key} index={index + 1} title={section.title} locked={section.locked} />
          ))}
        </List.Root>
      </Card>
    </VStack>
  );
}

function resolveCompetencyTiles(competencies: ReportCompetencyScore[] | null) {
  if (competencies == null || competencies.length === 0) {
    return null;
  }
  let max = competencies[0];
  let min = competencies[0];
  for (const item of competencies) {
    if (item.score > max.score) max = item;
    if (item.score < min.score) min = item;
  }
  return { max, min };
}

type InsightTileProps = {
  label: string;
  title: string;
  description: string;
  tone: 'positive' | 'warning';
};

function InsightTile({ label, title, description, tone }: InsightTileProps) {
  return (
    <Card bg={tone === 'positive' ? 'palette.green100' : 'mannerTemp.l4Bg'} borderColor="stroke.neutralWeak" p="x3">
      <VStack gap="x0_5">
        <Text color="fg.neutralMuted" textStyle="t1Regular">
          {label}
        </Text>
        <Text color={tone === 'positive' ? 'fg.positive' : 'mannerTemp.l4Text'} textStyle="t5Bold" maxLines={1}>
          {title}
        </Text>
        <Text color="fg.neutralSubtle" textStyle="t1Regular" maxLines={2}>
          {description}
        </Text>
      </VStack>
    </Card>
  );
}

type ReportFeatureRowProps = {
  index: number;
  title: string;
  locked: boolean;
};

function ReportFeatureRow({ index, title, locked }: ReportFeatureRowProps) {
  return (
    <List.Item>
      <List.Prefix>
        <Text color="fg.neutralSubtle" textStyle="t3Bold">
          {index}
        </Text>
      </List.Prefix>
      <List.Content>
        <List.Title>
          {title}
        </List.Title>
      </List.Content>
      <List.Suffix>
        {locked ? (
          <Badge label="Pro" tone="brand" size="small" />
        ) : (
          <Text color="fg.neutralSubtle" textStyle="t2Regular">Free</Text>
        )}
      </List.Suffix>
    </List.Item>
  );
}

type CompetenciesSectionProps = {
  competencies: ReportCompetencyScore[] | null;
  state: ReportSectionStates['competencies'];
  onRetry: () => void;
};

function CompetenciesSection({ competencies, state, onRetry }: CompetenciesSectionProps) {
  if (state === 'failed') {
    return <AnalysisStatusCard variant="failed" minHeight="x60" onRetry={onRetry} />;
  }
  if (competencies == null || state !== 'ready') {
    return <AnalysisStatusCard variant="pending" minHeight="x60" />;
  }
  return <CompetencySection competencies={competencies} />;
}

type ResilienceSectionProps = {
  resilience: ReportResilience;
  state: ReportSectionStates['resilience'];
  onRetry: () => void;
};

function ResilienceSection({ resilience, state, onRetry }: ResilienceSectionProps) {
  if (state === 'failed') {
    return <AnalysisStatusCard variant="failed" minHeight="x60" onRetry={onRetry} />;
  }
  if (resilience == null || state !== 'ready') {
    return <AnalysisStatusCard variant="pending" minHeight="x60" />;
  }

  const insights = resilience.insights.slice(0, 2);

  return (
    <VStack gap="x3">
      <Card>
        <VStack gap="x2">
          <StressResilienceChart values={resilience.curve.map((point) => point.value)} />
          <HStack justify="spaceBetween">
            {resilience.curve.map((point, index) => (
              <Text
                key={`${point.game_id}-${index}`}
                color="fg.neutralSubtle"
                textStyle="t1Regular"
                maxLines={1}
              >
                {gameNameFor(point.game_id)}
              </Text>
            ))}
          </HStack>
        </VStack>
      </Card>
      <Grid columns={2} gap="x2">
        {insights.map((insight, index) => (
          <InsightTile
            key={`${insight.label}-${index}`}
            label={insight.label}
            title={insight.title}
            description={insight.body}
            tone={insight.tone === 'positive' ? 'positive' : 'warning'}
          />
        ))}
      </Grid>
    </VStack>
  );
}

type ResponsePatternSectionProps = {
  pattern: ReportResponsePattern;
  state: ReportSectionStates['pattern'];
  onRetry: () => void;
};

function ResponsePatternSection({ pattern, state, onRetry }: ResponsePatternSectionProps) {
  if (state === 'failed') {
    return <AnalysisStatusCard variant="failed" minHeight="x60" onRetry={onRetry} />;
  }
  if (pattern == null || pattern.scales.length === 0 || state !== 'ready') {
    return <AnalysisStatusCard variant="pending" minHeight="x60" />;
  }
  return (
    <Card>
      <ResponsePatternRows scales={pattern.scales} />
    </Card>
  );
}

type HighlightsSectionProps = {
  record: MockExamRecord;
  highlights: ReportHighlights | null;
  state: ReportSectionStates['highlights'];
};

function HighlightsSection({ record, highlights }: HighlightsSectionProps) {
  if (highlights) {
    return <ServerHighlights highlights={highlights} />;
  }
  return <LocalHighlights record={record} />;
}

function ServerHighlights({ highlights }: { highlights: ReportHighlights }) {
  const router = useRouter();

  return (
    <VStack gap="x3">
      <Text textStyle="t8Bold">뭘 잘하고, 뭘 보완할까</Text>
      <VStack gap="x2">
        <HStack align="center" gap="x1_5">
          <Icon name="TrendingUp" color="fg.positive" size="small" />
          <Text textStyle="t4Bold">강점 Top 3</Text>
        </HStack>
        <List.Root>
          {highlights.strengths.map((item, index) => (
            <Fragment key={`${item.game_id}-${index}`}>
              {index > 0 ? <List.Divider /> : null}
              <HighlightRow
                gameName={gameNameFor(item.game_id)}
                skill={item.skill}
                note={item.note}
                score={item.score}
                index={index}
                tone="positive"
              />
            </Fragment>
          ))}
        </List.Root>
      </VStack>
      <VStack gap="x2">
        <HStack align="center" gap="x1_5">
          <Icon name="CircleDot" color="mannerTemp.l4Text" size="small" />
          <Text textStyle="t4Bold">보완 Top 3</Text>
        </HStack>
        <List.Root>
          {highlights.growth_areas.map((item, index) => (
            <Fragment key={`${item.game_id}-${index}`}>
              {index > 0 ? <List.Divider /> : null}
              <HighlightRow
                gameName={gameNameFor(item.game_id)}
                skill={item.skill}
                note={item.note}
                score={item.score}
                index={index}
                tone="warning"
                action={{
                  label: `이 게임 ${item.action.minutes}분 훈련하기`,
                  onPress: () =>
                    router.push({ pathname: '/games/[id]', params: { id: item.action.game_id } } as never),
                }}
              />
            </Fragment>
          ))}
        </List.Root>
      </VStack>
    </VStack>
  );
}

function LocalHighlights({ record }: { record: MockExamRecord }) {
  const router = useRouter();
  const results = useGameResultsForMockExam(record.id);
  const rankedGames = games
    .map((game) => ({ game, result: results.data?.[game.id] }))
    .filter((item) => item.result != null)
    .sort((a, b) => (b.result?.score ?? 0) - (a.result?.score ?? 0));
  const strengths = rankedGames.slice(0, 3);
  const growthAreas = [...rankedGames].reverse().slice(0, 3);

  if (results.isLoading) {
    return (
      <VStack gap="x3">
        <Skeleton borderRadius="r4" height="x16" width="full" />
        <Skeleton borderRadius="r4" height="x16" width="full" />
      </VStack>
    );
  }

  return (
    <VStack gap="x3">
      <Text textStyle="t8Bold">뭘 잘하고, 뭘 보완할까</Text>
      <VStack gap="x2">
        <HStack align="center" gap="x1_5">
          <Icon name="TrendingUp" color="fg.positive" size="small" />
          <Text textStyle="t4Bold">강점 Top 3</Text>
        </HStack>
        <List.Root>
          {strengths.map((item, index) => (
            <Fragment key={item.game.id}>
              {index > 0 ? <List.Divider /> : null}
              <HighlightRow
                gameName={item.game.name}
                skill={item.game.skill}
                score={item.result?.score ?? 0}
                index={index}
                tone="positive"
              />
            </Fragment>
          ))}
        </List.Root>
      </VStack>
      <VStack gap="x2">
        <HStack align="center" gap="x1_5">
          <Icon name="CircleDot" color="mannerTemp.l4Text" size="small" />
          <Text textStyle="t4Bold">보완 Top 3</Text>
        </HStack>
        <List.Root>
          {growthAreas.map((item, index) => (
            <Fragment key={item.game.id}>
              {index > 0 ? <List.Divider /> : null}
              <HighlightRow
                gameName={item.game.name}
                skill={item.game.skill}
                score={item.result?.score ?? 0}
                index={index}
                tone="warning"
                action={{
                  label: `이 게임 ${item.game.minutes}분 훈련하기`,
                  onPress: () =>
                    router.push({ pathname: '/games/[id]', params: { id: item.game.id } } as never),
                }}
              />
            </Fragment>
          ))}
        </List.Root>
      </VStack>
    </VStack>
  );
}

type HighlightRowProps = {
  gameName: string;
  skill: string;
  note?: string;
  score: number;
  index: number;
  tone: 'positive' | 'warning';
  action?: { label: string; onPress: () => void };
};

function HighlightRow({ gameName, skill, note, score, index, tone, action }: HighlightRowProps) {
  return (
    <List.Item>
      <List.Prefix>
        <Text color="fg.neutralSubtle" textStyle="t3Bold">{index + 1}</Text>
      </List.Prefix>
      <List.Content>
        <List.Title>{gameName}</List.Title>
        <List.Detail>{note ?? skill}</List.Detail>
        {action ? (
          <Button label={action.label} size="small" variant="weak" onPress={action.onPress} />
        ) : null}
      </List.Content>
      <List.Suffix>
        <Text color={tone === 'positive' ? 'fg.positive' : 'mannerTemp.l4Text'} textStyle="t5Bold">
          {score}
        </Text>
      </List.Suffix>
    </List.Item>
  );
}

type InterviewFeedbackSectionProps = {
  mockExamId: string;
  report: MockExamReport | null;
  state: ReportSectionStates['interview'];
};

function InterviewFeedbackSection({ mockExamId, report }: InterviewFeedbackSectionProps) {
  const db = useSQLiteContext();
  const { userId } = useAuth();
  const { data: session, isLoading } = useInterviewSessionForMockExam(mockExamId);
  const {
    data: answers = [],
    isLoading: answersLoading,
    isFetching: answersFetching,
  } = useInterviewAnswers(session?.id ?? null);

  if (isLoading) {
    return (
      <VStack gap="x4" minHeight="x16">
        <Skeleton borderRadius="r4" height="x16" width="full" />
        <Skeleton borderRadius="r4" height="x16" width="full" />
      </VStack>
    );
  }

  return (
    <FeedbackReportBody
      session={session ?? null}
      answers={answers}
      answersLoading={answersLoading || answersFetching}
      interview={report?.interview ?? null}
      uploads={{
        retry: (answerId: string) => {
          if (userId) {
            void retryInterviewMediaUpload(db, userId, answerId);
          }
        },
      }}
    />
  );
}

type GrowthSectionProps = {
  record: MockExamRecord;
  records: MockExamRecord[];
  overall: ReportOverall | null;
};

function GrowthSection({ record, records, overall }: GrowthSectionProps) {
  const chronologicalRecords = records
    .filter((item) => item.round <= record.round)
    .reverse();
  const scores = chronologicalRecords.map((item) => item.score);
  const delta = record.score - (scores[0] ?? record.score);
  const showPeer = overall?.percentile != null && overall.cohort != null;

  return (
    <VStack gap="x3">
      <Text textStyle="t8Bold">어디쯤 와 있을까</Text>
      <Card>
        {scores.length >= 2 ? (
          <>
            <GrowthTrendChart scores={scores} />
            <HStack bg="bg.brandWeak" borderRadius="r3" gap="x2" px="x3" py="x2">
              <Icon name="TrendingUp" color="fg.brand" size="small" />
              <Text color="fg.brand" textStyle="t3Medium">
                첫 회차 대비 {formatScoreDelta(delta)}점 성장했어요
              </Text>
            </HStack>
          </>
        ) : (
          <VStack align="center" justify="center" minHeight="x16">
            <Text align="center" color="fg.neutralMuted" textStyle="t3Regular">
              다음 회차를 완료하면 성장 추이를 볼 수 있어요.
            </Text>
          </VStack>
        )}
      </Card>
      {showPeer && overall ? (
        <Card>
          <VStack gap="x2">
            <Text color="fg.neutralMuted" textStyle="t2Regular">
              {overall.cohort?.label} {overall.cohort?.n.toLocaleString()}명 기준 · 상위 {overall.percentile}%
            </Text>
            <PercentileBar percentile={overall.percentile ?? 50} />
          </VStack>
        </Card>
      ) : null}
    </VStack>
  );
}

type CoachSectionProps = {
  coach: ReportCoach | null;
  state: ReportSectionStates['coach'];
  onRetry: () => void;
};

function CoachSection({ coach, state, onRetry }: CoachSectionProps) {
  const router = useRouter();

  if (state === 'failed') {
    return <AnalysisStatusCard variant="failed" minHeight="x60" onRetry={onRetry} />;
  }
  if (coach == null || state !== 'ready') {
    return <AnalysisStatusCard variant="pending" minHeight="x60" />;
  }

  return (
    <VStack gap="x3">
      <Card bg="bg.brandWeak" borderColor="stroke.brandWeak">
        <VStack gap="x1">
          <Text textStyle="t5Bold">{coach.insight.title}</Text>
          <Text color="fg.neutralMuted" textStyle="t3Regular">
            {coach.insight.body}
          </Text>
        </VStack>
      </Card>
      <Card py="x1">
        <List.Root>
          {coach.plan.map((item, index) => (
            <Fragment key={`${item.day_range}-${index}`}>
              {index > 0 ? <List.Divider /> : null}
              <List.Item
                onPress={() =>
                  router.push(
                    item.game_id === 'mock-exam'
                      ? ({ pathname: '/mock-exam' } as never)
                      : ({ pathname: '/games/[id]', params: { id: item.game_id } } as never),
                  )
                }
              >
                <List.Prefix>
                  <Badge label={item.day_range} tone="brand" size="small" />
                </List.Prefix>
                <List.Content>
                  <List.Title>
                    {item.game_id === 'mock-exam' ? '모의고사 재도전' : gameNameFor(item.game_id)}
                  </List.Title>
                  <List.Detail>
                    {item.level_label} · {item.minutes_per_day}분/일
                  </List.Detail>
                </List.Content>
                <List.Suffix>
                  <Icon name="ChevronRight" color="fg.neutralSubtle" size="small" />
                </List.Suffix>
              </List.Item>
            </Fragment>
          ))}
        </List.Root>
      </Card>
    </VStack>
  );
}
