import { Fragment, type ReactNode } from 'react';
import { Alert, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Header } from '../components/app/Header';
import { SectionHead } from '../components/app/SectionHead';
import { Screen } from '../components/app/Screen';
import { FeedbackReportBody } from '../components/interview/FeedbackReportBody';
import { GamesSection } from '../components/reports/GamesSection';
import { GrowthTrendChart } from '../components/reports/ReportCharts';
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
import { useGameResultsForMockExam } from '../data/local/useGameResults';
import { useMockExamRecord, useMockExamRecords } from '../data/local/useMockExamResults';
import { Box } from '../design-system/components/Box';
import { Grid } from '../design-system/components/Grid';
import { HStack, VStack } from '../design-system/components/Stack';
import { Text } from '../design-system/components/Text';
import type { MockExamRecord, ReportSectionKey } from '../domain/types';

const coverFeatureSections = reportDetailSections.slice(1);

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

export function ReportDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const recordId = typeof id === 'string' ? id : null;
  const { data: record, isLoading } = useMockExamRecord(recordId);
  const { data: records = [] } = useMockExamRecords();
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
      <Box flex={1} bleedBottom="spacingY.componentDefault" bleedX="spacingX.globalGutter">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 16 }}
          showsVerticalScrollIndicator={false}
        >
          <Box px="spacingX.globalGutter" py="x3">
            {isLoading ? <ReportDetailSkeleton /> : null}
            {!isLoading && !record ? <MissingReport onBack={() => router.back()} /> : null}
            {!isLoading && record ? (
              <VStack gap="x8">
                {reportDetailSections.map((section) => (
                  <VStack key={section.key} gap="x3">
                    {section.key !== 'cover' ? <SectionHead title={section.title} /> : null}
                    <LockedReportSection locked={Boolean(section.locked && !record.pro)}>
                      <ReportSectionBody
                        sectionKey={section.key}
                        record={record}
                        records={records}
                        previousRecord={previousRecordFor(record, records)}
                      />
                    </LockedReportSection>
                  </VStack>
                ))}
              </VStack>
            ) : null}
          </Box>
        </ScrollView>
      </Box>
    </Screen>
  );
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
    <Box minHeight={240} position="relative">
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

function AnalysisPendingCard() {
  return (
    <Card minHeight="x16">
      <HStack align="center" gap="x3">
        <Box
          alignItems="center"
          bg="bg.brandWeak"
          borderRadius="full"
          height="x10"
          justifyContent="center"
          width="x10"
        >
          <Icon name="Clock" color="fg.brand" />
        </Box>
        <VStack flex={1} gap="x1">
          <Text textStyle="t4Bold">결과를 분석하고 있어요</Text>
          <Text color="fg.neutralMuted" textStyle="t2Regular">
            게임 기록을 바탕으로 역량을 계산하는 중이에요. 잠시 후 다시 확인해주세요.
          </Text>
        </VStack>
      </HStack>
    </Card>
  );
}

type ReportSectionBodyProps = {
  sectionKey: ReportSectionKey;
  record: MockExamRecord;
  records: MockExamRecord[];
  previousRecord: MockExamRecord | null;
};

function ReportSectionBody({ sectionKey, record, records, previousRecord }: ReportSectionBodyProps) {
  switch (sectionKey) {
    case 'cover':
      return <CoverSection record={record} records={records} />;
    case 'games':
      return <GamesSection record={record} previousRecord={previousRecord} />;
    case 'radar':
      return <RadarSection />;
    case 'highlights':
      return <HighlightsSection record={record} />;
    case 'interview':
      return <InterviewFeedbackSection mockExamId={record.id} />;
    case 'resilience':
      return <ResilienceSection />;
    case 'pattern':
      return <PatternSection />;
    case 'peer':
      return <GrowthSection record={record} records={records} />;
    case 'coach':
      return <CoachSection />;
  }
}

type RecordSectionProps = {
  record: MockExamRecord;
  records?: MockExamRecord[];
};

function CoverSection({ record, records = [] }: RecordSectionProps) {
  const results = useGameResultsForMockExam(record.id);
  const firstRecord = records.find((item) => item.round === 1);
  const firstDelta = firstRecord ? record.score - firstRecord.score : 0;
  const rankedGames = games
    .map((game) => ({ game, result: results.data?.[game.id] }))
    .filter((item) => item.result != null)
    .sort((a, b) => (b.result?.score ?? 0) - (a.result?.score ?? 0));
  const strongest = rankedGames[0];
  const weakest = rankedGames[rankedGames.length - 1];

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
          <ReadinessGauge score={record.score} size={108} />
          <VStack flex={1} gap="x1">
            <Text color="fg.neutralMuted" textStyle="t2Regular">
              종합 준비도
            </Text>
            <HStack align="center" gap="x1_5">
              <Text textStyle="t10Bold">{record.score}</Text>
              <Text color="fg.neutralSubtle" textStyle="t3Regular">/ 100</Text>
            </HStack>
            <Box style={{ opacity: record.round === 1 ? 0 : 1 }}>
              <Badge
                label={`첫 회차 대비 ${formatScoreDelta(firstDelta)}`}
                tone={firstDelta >= 0 ? 'positive' : 'critical'}
              />
            </Box>
          </VStack>
        </HStack>
      </Card>

      <Grid columns={2} gap="x2">
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
      </Grid>

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

function RadarSection() {
  return <AnalysisPendingCard />;
}

function HighlightsSection({ record }: RecordSectionProps) {
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
                gameId={item.game.id}
                gameName={item.game.name}
                minutes={item.game.minutes}
                skill={item.game.skill}
                score={item.result?.score ?? 0}
                index={index}
                tone="warning"
              />
            </Fragment>
          ))}
        </List.Root>
      </VStack>
    </VStack>
  );
}

type HighlightRowProps = {
  gameId?: string;
  gameName: string;
  minutes?: number;
  skill: string;
  score: number;
  index: number;
  tone: 'positive' | 'warning';
};

function HighlightRow({ gameId, gameName, minutes, skill, score, index, tone }: HighlightRowProps) {
  const router = useRouter();

  return (
    <List.Item>
      <List.Prefix>
        <Text color="fg.neutralSubtle" textStyle="t3Bold">{index + 1}</Text>
      </List.Prefix>
      <List.Content>
        <List.Title>{gameName}</List.Title>
        <List.Detail>{skill}</List.Detail>
        {gameId && minutes ? (
          <Button
            label={`이 게임 ${minutes}분 훈련하기`}
            size="small"
            variant="weak"
            onPress={() => router.push({ pathname: '/games/[id]', params: { id: gameId } } as never)}
          />
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

function InterviewFeedbackSection({ mockExamId }: { mockExamId: string }) {
  const { data: session, isLoading } = useInterviewSessionForMockExam(mockExamId);

  if (isLoading) {
    return (
      <VStack gap="x4" minHeight="x16">
        <Skeleton borderRadius="r4" height="x16" width="full" />
        <Skeleton borderRadius="r4" height="x16" width="full" />
      </VStack>
    );
  }

  return <FeedbackReportBody session={session ?? null} />;
}

function ResilienceSection() {
  return <AnalysisPendingCard />;
}

function PatternSection() {
  return <AnalysisPendingCard />;
}

type GrowthSectionProps = {
  record: MockExamRecord;
  records: MockExamRecord[];
};

function GrowthSection({ record, records }: GrowthSectionProps) {
  const chronologicalRecords = records
    .filter((item) => item.round <= record.round)
    .reverse();
  const scores = chronologicalRecords.map((item) => item.score);
  const delta = record.score - (scores[0] ?? record.score);

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
    </VStack>
  );
}

function CoachSection() {
  return <AnalysisPendingCard />;
}
