import { Fragment, useState } from 'react';
import { ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Header } from '../components/app/Header';
import { SectionHead } from '../components/app/SectionHead';
import { Screen } from '../components/app/Screen';
import { BottomActionBar } from '../components/app/BottomActionBar';
import { ReservedSlot } from '../components/app/ReservedSlot';
import { FeedbackReportBody } from '../components/interview/FeedbackReportBody';
import { AnalysisStatusCard } from '../components/reports/AnalysisStatusCard';
import { CompetencySection } from '../components/reports/CompetencySection';
import { GamesSection } from '../components/reports/GamesSection';
import { ProIntroSheet } from '../components/reports/ProIntroSheet';
import { ReportPaywall } from '../components/reports/ReportPaywall';
import { ResponsePatternRows, StressResilienceChart } from '../components/reports/ReportCharts';
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
import type { GameResultRecord } from '../data/local/gameResults';
import { useMockExamRecord, useMockExamRecords } from '../data/local/useMockExamResults';
import { useIsPro, useProfile } from '../data/server/useProfile';
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
import type { GameId, MockExamRecord, ReportSectionKey } from '../domain/types';
import type { ReportSectionStates } from '../data/server/useMockExamReport';
import { useSQLiteContext } from 'expo-sqlite';

const COMPETENCY_LABELS: Record<ReportCompetencyScore['key'], string> = {
  trust: '신뢰',
  strategy: '전략',
  relationship: '관계',
  value: '가치',
  fit: '조직적합',
};

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

type MockExamGameResults = Partial<Record<GameId, GameResultRecord>> | undefined;

function rankedGamesForResults(results: MockExamGameResults) {
  return games
    .map((game) => ({ game, result: results?.[game.id] }))
    .filter((item) => item.result != null)
    .sort((a, b) => (b.result?.score ?? 0) - (a.result?.score ?? 0));
}

function weakestGameForResults(results: MockExamGameResults) {
  const rankedGames = rankedGamesForResults(results);
  return rankedGames[rankedGames.length - 1] ?? null;
}

export function ReportDetailScreen() {
  const router = useRouter();
  const [proIntroVisible, setProIntroVisible] = useState(false);
  const { id } = useLocalSearchParams<{ id: string }>();
  const recordId = typeof id === 'string' ? id : null;
  const { data: record, isLoading } = useMockExamRecord(recordId);
  const isPro = useIsPro();
  const { isLoading: profileLoading } = useProfile();
  const gateLoading = isLoading || profileLoading;

  return (
    <Screen>
      <Header
        title="종합 리포트"
        subtitle={`모의고사 · ${record?.round ?? '-'}회차 리포트`}
        showBack
        onBack={() => router.back()}
      />
      {gateLoading ? <LoadingBody /> : null}
      {!gateLoading && !record ? <MissingReportBody onBack={() => router.back()} /> : null}
      {!gateLoading && record && !isPro ? (
        <ReportPaywall record={record} onUpgrade={() => setProIntroVisible(true)} />
      ) : null}
      {!gateLoading && record && isPro ? <ReportContent record={record} /> : null}
      <ProIntroSheet visible={proIntroVisible} onClose={() => setProIntroVisible(false)} />
    </Screen>
  );
}

function LoadingBody() {
  const { theme } = useDesignSystemTheme();

  return (
    <>
      <Box flex={1} bleedX="spacingX.globalGutter">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: theme.dimension.spacingX.globalGutter }}
          showsVerticalScrollIndicator={false}
        >
          <Box px="spacingX.globalGutter" py="x3">
            <ReportDetailSkeleton />
          </Box>
        </ScrollView>
      </Box>
      <BottomActionBar primary={{ label: '리포트 준비 중', disabled: true }} />
    </>
  );
}

function MissingReportBody({ onBack }: { onBack: () => void }) {
  const { theme } = useDesignSystemTheme();

  return (
    <Box flex={1} bleedX="spacingX.globalGutter">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: theme.dimension.spacingX.globalGutter }}
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
  const { theme } = useDesignSystemTheme();
  const { data: records = [] } = useMockExamRecords();
  const reportQuery = useMockExamReport(record.id, record.createdAt);
  const row = reportQuery.data ?? null;
  const states = getReportSectionStates(row);
  const report = row?.status === 'done' ? row.report : null;
  const previousRecord = previousRecordFor(record, records);
  const localResults = useGameResultsForMockExam(record.id);
  const onRetryReport = () => void reportQuery.refetch();

  const cta = resolveBottomCta(report, localResults.data);

  return (
    <>
      <Box flex={1} bleedX="spacingX.globalGutter">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: theme.dimension.spacingX.globalGutter }}
          showsVerticalScrollIndicator={false}
        >
          <Box px="spacingX.globalGutter" py="x3">
            <VStack gap="x8">
              {reportDetailSections.map((section) => (
                <VStack key={section.key} gap="x3">
                  {section.key !== 'cover' ? <SectionHead title={section.title} /> : null}
                  <ReportSectionBody
                    sectionKey={section.key}
                    record={record}
                    records={records}
                    previousRecord={previousRecord}
                    report={report}
                    states={states}
                    onRetryReport={onRetryReport}
                  />
                </VStack>
              ))}
            </VStack>
          </Box>
        </ScrollView>
      </Box>
      <BottomActionBar
        primary={{
          label: cta.label,
          iconRight: 'ArrowRight',
          onPress: () => router.push({ pathname: '/games/[id]', params: { id: cta.gameId } } as never),
        }}
      />
    </>
  );
}

function resolveBottomCta(report: MockExamReport | null, results: MockExamGameResults): { label: string; gameId: string } {
  const growth = report?.highlights?.growth_areas?.[0];
  if (growth) {
    return {
      label: `${gameNameFor(growth.action.game_id)} ${growth.action.minutes}분 훈련하기`,
      gameId: growth.action.game_id,
    };
  }
  const weakest = weakestGameForResults(results);
  const fallback = weakest?.game ?? games[0];
  return { label: `${fallback.name} ${fallback.minutes}분 훈련하기`, gameId: fallback.id };
}

function ReportDetailSkeleton() {
  return (
    <VStack gap="x8">
      <VStack gap="x1">
        <Skeleton height="x3" width="x23" />
        <Skeleton height="x8" width="x60" maxWidth="full" />
        <Skeleton height="x4" width="x34" maxWidth="full" />
      </VStack>
      <Card p="spacingX.globalGutter">
        <HStack align="center" gap="x4">
          <Skeleton borderRadius="full" height="x27_5" width="x27_5" />
          <VStack flex={1} gap="x2">
            <Skeleton height="x3" width="x16" />
            <Skeleton height="x8" width="x23" maxWidth="full" />
            <Skeleton height="x4" width="x29" maxWidth="full" />
            <Skeleton height="x6" width="x23" maxWidth="full" />
          </VStack>
        </HStack>
      </Card>
      <Card p="spacingX.globalGutter">
        <VStack gap="x3">
          {games.map((game) => (
            <VStack key={game.id} gap="x1_5" minHeight="x10">
              <HStack align="center" gap="x3">
                <Skeleton height="x4" width="x16" />
                <Skeleton flex={1} height="x2" />
                <Skeleton height="x4" width="x8" />
              </HStack>
              <Skeleton height="x3" width="x23" />
            </VStack>
          ))}
        </VStack>
      </Card>
      {reportDetailSections.slice(2).map((section) => (
        <VStack key={section.key} gap="x3">
          <Skeleton height="x5" width="x34" maxWidth="full" />
          <Card p="spacingX.globalGutter">
            <VStack gap="x3">
              <Skeleton height="x4" width="full" />
              <Skeleton height="x4" width="x60" maxWidth="full" />
              <Skeleton height="x4" width="x42_5" maxWidth="full" />
            </VStack>
          </Card>
        </VStack>
      ))}
    </VStack>
  );
}

type MissingReportProps = {
  onBack: () => void;
};

function MissingReport({ onBack }: MissingReportProps) {
  return (
    <Card p="spacingX.globalGutter">
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
  const rankedGames = rankedGamesForResults(results.data);
  const strongest = rankedGames[0];
  const weakest = weakestGameForResults(results.data);

  const score = overall?.score ?? record.score;
  const range = overall?.score_range ?? null;
  const showRange = range != null && range[0] !== range[1];
  const showStatusBadge = overall == null || record.round !== 1;
  const statusBadgeLabel = overall ? `첫 회차 대비 ${formatScoreDelta(firstDelta)}` : '분석 중';
  const statusBadgeTone = overall ? (firstDelta >= 0 ? 'positive' : 'critical') : 'neutral';
  const summaryVisible = Boolean(overall?.summary);

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

      <Card bg="bg.brandWeak" borderColor="stroke.brandWeak" p="spacingX.globalGutter">
        <HStack align="center" gap="x4">
          <ReadinessGauge score={score} size="x27_5" unit="none" />
          <VStack flex={1} gap="x2">
            <Text color="fg.neutralMuted" textStyle="t2Regular">
              종합 준비도
            </Text>
            <HStack align="center" gap="x1_5">
              <Text textStyle="t10Bold">{score}</Text>
              <Text color="fg.neutralSubtle" textStyle="t3Regular">/ 100</Text>
            </HStack>
            <ReservedSlot visible={showRange}>
              <Text color="fg.neutralSubtle" textStyle="t3Regular">
                {range ? `${range[0]}~${range[1]} 범위` : '0~0 범위'}
              </Text>
            </ReservedSlot>
            <ReservedSlot height="x6" visible={showStatusBadge}>
              <Badge label={statusBadgeLabel} tone={statusBadgeTone} size="small" />
            </ReservedSlot>
          </VStack>
        </HStack>
      </Card>

      <Card p="spacingX.globalGutter">
        <ReservedSlot minHeight="x8" visible={summaryVisible}>
          <Text color="fg.neutralMuted" textStyle="t3Regular">
            {overall?.summary ?? '결과를 분석하고 있어요. 곧 요약을 확인할 수 있어요.'}
          </Text>
        </ReservedSlot>
      </Card>

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

      <ReservedSlot height="x6" visible={state === 'pending'}>
        <Badge label="분석 중" tone="neutral" size="small" />
      </ReservedSlot>
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
  const isPositive = tone === 'positive';
  const iconName = isPositive ? 'TrendingUp' : 'CircleDot';
  const toneColor = isPositive ? 'fg.positive' : 'mannerTemp.l4Text';

  return (
    <Card
      bg={isPositive ? 'bg.brandWeak' : 'mannerTemp.l4Bg'}
      borderColor={isPositive ? 'stroke.brandWeak' : 'stroke.neutralWeak'}
      borderRadius="r3"
      p="x3"
    >
      <VStack gap="x0_5">
        <HStack align="center" gap="x1">
          <Icon name={iconName} color={toneColor} size="small" />
          <Text color="fg.neutralMuted" textStyle="t1Regular">
            {label}
          </Text>
        </HStack>
        <Text color={toneColor} textStyle="t5Bold" maxLines={2}>
          {title}
        </Text>
        <Text color="fg.neutralSubtle" textStyle="t2Regular" lineHeight="t3" maxLines={2}>
          {description}
        </Text>
      </VStack>
    </Card>
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
      <Card p="spacingX.globalGutter">
        <VStack gap="x2">
          <StressResilienceChart values={resilience.curve.map((point) => point.value)} />
          <HStack>
            {resilience.curve.map((point, index) => (
              <Box key={`${point.game_id}-${index}`} flex={1}>
                <Text align="center" color="fg.neutralSubtle" textStyle="t1Regular" maxLines={1}>
                  {gameNameFor(point.game_id)}
                </Text>
              </Box>
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
    <Card p="spacingX.globalGutter">
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
    <VStack gap="x4">
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
    <VStack gap="x4">
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
      <Card bg="bg.brandWeak" borderColor="stroke.brandWeak" p="spacingX.globalGutter">
        <VStack gap="x2">
          <Text textStyle="t5Bold">{coach.insight.title}</Text>
          <Text color="fg.neutralMuted" textStyle="t3Regular">
            {coach.insight.body}
          </Text>
        </VStack>
      </Card>
      <Card p="spacingX.globalGutter">
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
