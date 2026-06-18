import { Fragment, useState, type ReactNode } from 'react';
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
import { ResponsePatternRows } from '../components/reports/ReportCharts';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Icon } from '../components/ui/Icon';
import { List } from '../components/ui/List';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { ReadinessGauge } from '../components/readiness/ReadinessGauge';
import { games } from '../data/games';
import { reportDetailSections } from '../data/reports';
import { useInterviewSessionForMockExam } from '../data/local/useInterviewSessions';
import { useInterviewAnswers } from '../data/local/useInterviewAnswers';
import { useGameResultsForMockExam } from '../data/local/useGameResults';
import type { GameResultRecord } from '../data/local/gameResults';
import { useMockExamRecord } from '../data/local/useMockExamResults';
import { useIsPro, useProfile } from '../data/server/useProfile';
import { useMockExamReport, getReportSectionStates } from '../data/server/useMockExamReport';
import { retryInterviewMediaUpload } from '../data/media/interviewMediaUpload';
import { useAuth } from '../providers/AuthProvider';
import { Box } from '../design-system/components/Box';
import { HStack, VStack } from '../design-system/components/Stack';
import { Text } from '../design-system/components/Text';
import { useDesignSystemTheme } from '../design-system/provider';
import type {
  MockExamReport,
  ReportCoach,
  ReportCompetencyScore,
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

const NCS_COMPETENCY_LINKS: Record<ReportCompetencyScore['key'], { label: string; basis: string }> = {
  trust: {
    label: '직업윤리',
    basis: '일관된 선택과 책임 있는 판단을 함께 봤어요.',
  },
  strategy: {
    label: '문제해결능력',
    basis: '제한된 정보에서 원인을 찾고 대안을 고르는 흐름을 봤어요.',
  },
  relationship: {
    label: '대인관계능력',
    basis: '협업 신호를 읽고 갈등을 조율하는 방식을 봤어요.',
  },
  value: {
    label: '자기관리능력',
    basis: '본인의 기준과 우선순위를 유지하는 흐름을 봤어요.',
  },
  fit: {
    label: '대인관계능력',
    basis: '조직 안에서 역할을 맞추고 협업하는 태도를 봤어요.',
  },
};

function formatFullDate(sqliteUtcDatetime: string) {
  const date = new Date(`${sqliteUtcDatetime.replace(' ', 'T')}Z`);
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

function formatDurationLabel(durationMs: number) {
  const totalMinutes = Math.max(1, Math.round(durationMs / 60000));
  return `${totalMinutes}분 소요`;
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
  const reportQuery = useMockExamReport(record.id, record.createdAt);
  const row = reportQuery.data ?? null;
  const states = getReportSectionStates(row);
  const report = row?.status === 'done' ? row.report : null;
  const readyReport = report?.overall != null && report.interview?.status === 'done' ? report : null;
  const localResults = useGameResultsForMockExam(record.id);
  const onRetryReport = () => void reportQuery.refetch();

  if (!readyReport) {
    return (
      <ReportAnalysisPending
        failed={row?.status === 'failed'}
        onRetry={onRetryReport}
      />
    );
  }

  const cta = resolveBottomCta(readyReport, localResults.data);

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
                  {section.key === 'summary' ? null : <SectionHead title={section.title} />}
                  <ReportSectionBody
                    sectionKey={section.key}
                    record={record}
                    report={readyReport}
                    gameResults={localResults.data}
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

function ReportAnalysisPending({ failed, onRetry }: { failed: boolean; onRetry: () => void }) {
  return (
    <>
      <Box flex={1} bleedX="spacingX.globalGutter">
        <Box px="spacingX.globalGutter" py="x3">
          <AnalysisStatusCard
            variant={failed ? 'failed' : 'pending'}
            title={failed ? '리포트를 분석하지 못했어요' : '면접 답변을 분석하고 있어요'}
            body={
              failed
                ? '다시 시도하면 종합 리포트를 업데이트할 수 있어요.'
                : '분석이 끝나면 종합 리포트를 열 수 있어요.'
            }
            minHeight="x60"
            onRetry={onRetry}
          />
        </Box>
      </Box>
      <BottomActionBar primary={{ label: failed ? '다시 시도해주세요' : '리포트 분석 중', disabled: true }} />
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
  report: MockExamReport;
  gameResults: MockExamGameResults;
  states: ReportSectionStates;
  onRetryReport: () => void;
};

function ReportSectionBody({
  sectionKey,
  record,
  report,
  gameResults,
  states,
  onRetryReport,
}: ReportSectionBodyProps) {
  switch (sectionKey) {
    case 'summary':
      return <SummarySection record={record} gameResults={gameResults} report={report} states={states} />;
    case 'game':
      return (
        <GameDiagnosisSection
          record={record}
          report={report}
          states={states}
          onRetry={onRetryReport}
        />
      );
    case 'interview':
      return <InterviewFeedbackSection mockExamId={record.id} report={report} state={states.interview} />;
  }
}

type SummarySectionProps = {
  record: MockExamRecord;
  gameResults: MockExamGameResults;
  report: MockExamReport;
  states: ReportSectionStates;
};

function SummarySection({ record, gameResults, report, states }: SummarySectionProps) {
  const { overall } = report;
  const competencies = report.competencies;
  const factorScores = resolveFactorScores(report, gameResults);
  const score = totalFactorScore(factorScores);

  return (
    <VStack gap="x3">
      <VStack gap="x0_5">
        <Text textStyle="t9Bold">오늘의 역량 지도</Text>
        <Text color="fg.neutralSubtle" textStyle="t2Regular">
          {formatFullDate(record.createdAt)} · {formatDurationLabel(record.durationMs)}
        </Text>
      </VStack>

      <Card bg="bg.brandWeak" borderColor="stroke.brandWeak" p="spacingX.globalGutter">
        <VStack gap="x3">
          <HStack align="center" gap="x4">
            <ReadinessGauge score={score} size="x27_5" unit="none" />
            <ReflectedFactors scores={factorScores} />
          </HStack>
          <List.Divider />
          <VStack gap="x1">
            <Text textStyle="t4Bold">AI 종합 피드백</Text>
            <Text color="fg.neutralMuted" textStyle="t3Regular" lineHeight="t4">
              {overall.summary}
            </Text>
          </VStack>
        </VStack>
      </Card>

      <NcsConnectionSummary competencies={competencies} state={states.competencies} />
    </VStack>
  );
}

type FactorScores = {
  game: WeightedFactorScore | null;
  pattern: WeightedFactorScore | null;
  interview: WeightedFactorScore;
};

type WeightedFactorScore = {
  score: number;
  max: number;
};

const FACTOR_WEIGHTS = {
  game: 40,
  pattern: 20,
  interview: 40,
} as const;

function average(values: number[]) {
  if (values.length === 0) return null;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function toWeightedFactorScore(rawScore: number | null, max: number): WeightedFactorScore | null {
  if (rawScore == null) return null;
  return {
    score: Math.round((rawScore * max) / 100),
    max,
  };
}

function resolveFactorScores(report: MockExamReport, gameResults: MockExamGameResults): FactorScores {
  const gamesWithScores = Object.values(gameResults ?? {}).filter((result): result is GameResultRecord => result != null);
  const patternScores = report.response_pattern?.scales.map((scale) => scale.value) ?? [];

  return {
    game: toWeightedFactorScore(average(gamesWithScores.map((result) => result.score)), FACTOR_WEIGHTS.game),
    pattern: toWeightedFactorScore(average(patternScores), FACTOR_WEIGHTS.pattern),
    interview: toWeightedFactorScore(report.interview.overall_score, FACTOR_WEIGHTS.interview) ?? {
      score: 0,
      max: FACTOR_WEIGHTS.interview,
    },
  };
}

function formatFactorScore(score: WeightedFactorScore | null) {
  return score == null ? '- / -' : `${score.score} / ${score.max}`;
}

function totalFactorScore(scores: FactorScores) {
  return (scores.game?.score ?? 0) + (scores.pattern?.score ?? 0) + scores.interview.score;
}

function ReflectedFactors({ scores }: { scores: FactorScores }) {
  const rows = [
    {
      title: '게임 수행',
      score: scores.game,
    },
    {
      title: '응답 패턴',
      score: scores.pattern,
    },
    {
      title: 'AI 면접',
      score: scores.interview,
    },
  ];

  return (
    <VStack flex={1} gap="x2">
      <HStack align="center" gap="x1_5">
        <Icon name="CircleCheck" color="fg.brand" size="small" />
        <Text textStyle="t4Bold">반영 요소</Text>
      </HStack>
      <VStack gap="x1_5">
        {rows.map((row) => (
          <HStack key={row.title} align="center" justify="spaceBetween" gap="x2">
            <Text color="fg.neutralMuted" textStyle="t3Regular">
              {row.title}
            </Text>
            <Text textStyle="t4Bold">{formatFactorScore(row.score)}</Text>
          </HStack>
        ))}
      </VStack>
    </VStack>
  );
}

type GameDiagnosisSectionProps = {
  record: MockExamRecord;
  report: MockExamReport | null;
  states: ReportSectionStates;
  onRetry: () => void;
};

function GameDiagnosisSection({ record, report, states, onRetry }: GameDiagnosisSectionProps) {
  const hasFailedCore =
    states.resilience === 'failed' ||
    states.coach === 'failed';
  const hasPendingCore =
    states.resilience === 'pending' ||
    states.coach === 'pending';

  return (
    <VStack gap="x3">
      <ResilienceSummary
        resilience={report?.resilience ?? null}
        state={states.resilience}
      />

      <ReportSubsection title="게임별 결과" iconName="Gamepad2" iconColor="fg.brand">
        <GamesSection record={record} gameInsights={report?.games ?? null} />
      </ReportSubsection>

      <ReportSubsection
        title="앱 5대 역량 프로필"
        caption="NCS 공식 판정이 아니라, 게임 과제를 직업공통능력 관점으로 다시 묶은 참고 지표예요."
        iconName="ChartNoAxesColumnIncreasing"
        iconColor="fg.brand"
      >
        <CompetenciesSection competencies={report?.competencies ?? null} state={states.competencies} onRetry={onRetry} />
      </ReportSubsection>

      <ReportSubsection title="응답 패턴 프로필" iconName="Timeline" iconColor="fg.brand">
        <ResponsePatternSection pattern={report?.response_pattern ?? null} state={states.pattern} onRetry={onRetry} />
      </ReportSubsection>

      <ImprovementPlan coach={report?.coach ?? null} state={states.coach} />

      {hasFailedCore ? (
        <AnalysisStatusCard
          variant="failed"
          title="일부 진단을 불러오지 못했어요"
          body="다시 시도하면 게임 진단과 개선 플랜을 업데이트할 수 있어요."
          onRetry={onRetry}
        />
      ) : null}

      <ReservedSlot height="x6" visible={hasPendingCore}>
        <Badge label="추가 분석 준비 중" tone="neutral" size="small" />
      </ReservedSlot>
    </VStack>
  );
}

type ReportSubsectionProps = {
  title: string;
  caption?: string;
  iconName: 'Gamepad2' | 'ChartNoAxesColumnIncreasing' | 'Timeline';
  iconColor: 'fg.brand';
  children: ReactNode;
};

function ReportSubsection({ title, caption, iconName, iconColor, children }: ReportSubsectionProps) {
  return (
    <VStack gap="x2">
      <VStack gap="x0_5">
        <HStack align="center" gap="x1_5">
          <Icon name={iconName} color={iconColor} size="small" />
          <Text textStyle="t4Bold">{title}</Text>
        </HStack>
        {caption ? (
          <Text color="fg.neutralMuted" textStyle="t2Regular" lineHeight="t3" maxLines={2}>
            {caption}
          </Text>
        ) : null}
      </VStack>
      {children}
    </VStack>
  );
}

type NcsConnectionSummaryProps = {
  competencies: ReportCompetencyScore[] | null;
  state: ReportSectionStates['competencies'];
};

function NcsConnectionSummary({ competencies, state }: NcsConnectionSummaryProps) {
  if (state === 'failed') {
    return null;
  }

  if (competencies == null || competencies.length === 0 || state !== 'ready') {
    return (
      <Card minHeight="x16" p="spacingX.globalGutter">
        <VStack gap="x1">
          <HStack align="center" gap="x1_5">
            <Icon name="BadgeCheck" color="fg.brand" size="small" />
            <Text textStyle="t4Bold">NCS 기반 피드백 요약</Text>
          </HStack>
        </VStack>
      </Card>
    );
  }

  const sorted = [...competencies].sort((a, b) => b.score - a.score);
  const rows = [
    { label: '강점', tone: 'positive' as const, competency: sorted[0] },
    { label: '보완', tone: 'warning' as const, competency: sorted[sorted.length - 1] },
  ];

  return (
    <Card p="spacingX.globalGutter">
      <VStack gap="x3">
        <HStack align="center" gap="x1_5">
          <Icon name="BadgeCheck" color="fg.brand" size="small" />
          <Text textStyle="t4Bold">NCS 기반 피드백 요약</Text>
        </HStack>
        <List.Root>
          {rows.map((row, index) => {
            const link = NCS_COMPETENCY_LINKS[row.competency.key];
            return (
              <Fragment key={`${row.label}-${row.competency.key}`}>
                {index > 0 ? <List.Divider /> : null}
                <List.Item>
                  <List.Prefix>
                    <Badge label={row.label} tone={row.tone} size="small" />
                  </List.Prefix>
                  <List.Content>
                    <List.Title>
                      {link.label} · {COMPETENCY_LABELS[row.competency.key]}
                    </List.Title>
                    <List.Detail>{link.basis}</List.Detail>
                  </List.Content>
                  <List.Suffix>
                    <Text textStyle="t5Bold">{row.competency.score}</Text>
                  </List.Suffix>
                </List.Item>
              </Fragment>
            );
          })}
        </List.Root>
      </VStack>
    </Card>
  );
}

type ResilienceFeedbackCardProps = {
  insights: NonNullable<ReportResilience>['insights'];
};

type ResilienceMetrics = {
  recovery: number;
  averageScore: number;
  lowScoreCount: number;
};

type ResilienceCurve = NonNullable<ReportResilience>['curve'];

const RESILIENCE_LOW_SCORE_GAP = 8;

function ResilienceFeedbackCard({ insights }: ResilienceFeedbackCardProps) {
  if (insights.length === 0) {
    return null;
  }

  return (
    <Card p="spacingX.globalGutter">
      <VStack gap="x3">
        <HStack align="center" gap="x1_5">
          <Icon name="Lightbulb" color="fg.brand" size="small" />
          <Text textStyle="t4Bold">종합 피드백</Text>
        </HStack>
        <List.Root>
          {insights.map((insight, index) => {
            const isPositive = insight.tone === 'positive';
            const label = isPositive ? '강점' : '주의';
            return (
              <Fragment key={`${label}-${insight.title}-${index}`}>
                {index > 0 ? <List.Divider /> : null}
                <List.Item>
                  <List.Prefix>
                    <Badge label={label} tone={isPositive ? 'positive' : 'warning'} size="small" />
                  </List.Prefix>
                  <List.Content>
                    <List.Title>{insight.title}</List.Title>
                    <List.Detail>{insight.body}</List.Detail>
                  </List.Content>
                </List.Item>
              </Fragment>
            );
          })}
        </List.Root>
      </VStack>
    </Card>
  );
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, value));
}

function resolveResilienceMetrics(curve: ResilienceCurve): ResilienceMetrics | null {
  const values = curve.map((point) => clampScore(point.value));

  if (values.length === 0) {
    return null;
  }

  const lowestValue = Math.min(...values);
  const lastValue = values[values.length - 1];
  const averageScore = Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
  const lowScoreCount = values.filter((value) => value <= averageScore - RESILIENCE_LOW_SCORE_GAP).length;

  return {
    recovery: Math.max(0, lastValue - lowestValue),
    averageScore,
    lowScoreCount,
  };
}

function resilienceBarHeight(score: number) {
  if (score >= 90) return 'full';
  if (score >= 80) return 'x24';
  if (score >= 70) return 'x21';
  if (score >= 60) return 'x18';
  if (score >= 50) return 'x15';
  if (score >= 40) return 'x12';
  if (score >= 30) return 'x9';
  if (score >= 20) return 'x6';
  return 'x4';
}

function resilienceAverageLineTop(score: number) {
  if (score >= 90) return 'x1';
  if (score >= 80) return 'x3';
  if (score >= 70) return 'x6';
  if (score >= 60) return 'x9';
  if (score >= 50) return 'x12';
  if (score >= 40) return 'x15';
  if (score >= 30) return 'x18';
  if (score >= 20) return 'x21';
  return 'x23';
}

function ResilienceStabilityBars({ curve, metrics }: { curve: ResilienceCurve; metrics: ResilienceMetrics }) {
  const points = curve.map((point, index) => {
    const score = clampScore(point.value);
    return {
      id: `${point.game_id}-${point.segment}-${index}`,
      score,
      label: `${index + 1}`,
      isLow: score <= metrics.averageScore - RESILIENCE_LOW_SCORE_GAP,
    };
  });

  return (
    <VStack gap="x2">
      <HStack align="center" justify="spaceBetween" gap="x2">
        <Text textStyle="t4Bold">9개 게임 안정성</Text>
        <Badge label={`평균 ${metrics.averageScore}점`} tone="neutral" size="small" />
      </HStack>
      <Box bg="bg.layerFloating" borderRadius="r3" p="x3">
        <VStack gap="x2">
          <Box height="x27_5" position="relative">
            <Box
              bg="stroke.neutralMuted"
              height="x0_5"
              left={0}
              position="absolute"
              right={0}
              top={resilienceAverageLineTop(metrics.averageScore)}
              zIndex={1}
            />
            <HStack align="flexEnd" gap="x1_5" height="full">
              {points.map((point) => (
                <VStack key={point.id} align="center" flex={1} gap="x1">
                  <Box flex={1} justifyContent="flexEnd" width="full">
                    <Box
                      accessibilityLabel={`${point.label}번째 게임 ${point.score}점`}
                      bg={point.isLow ? 'bg.warningSolid' : 'bg.brandSolid'}
                      borderRadius="r1_5"
                      height={resilienceBarHeight(point.score)}
                      width="full"
                    />
                  </Box>
                  <Text align="center" color={point.isLow ? 'fg.warning' : 'fg.neutralSubtle'} textStyle="t1Regular" maxLines={1}>
                    {point.label}
                  </Text>
                </VStack>
              ))}
            </HStack>
          </Box>
          <HStack align="center" columnGap="x2" rowGap="x1" wrap="wrap">
            <HStack align="center" gap="x1">
              <Box bg="stroke.neutralMuted" borderRadius="full" height="x0_5" width="x6" />
              <Text color="fg.neutralMuted" textStyle="t1Regular">
                평균선
              </Text>
            </HStack>
            <HStack align="center" gap="x1">
              <Box bg="bg.brandSolid" borderRadius="full" height="x2" width="x2" />
              <Text color="fg.neutralMuted" textStyle="t1Regular">
                평균권
              </Text>
            </HStack>
            <HStack align="center" gap="x1">
              <Box bg="bg.warningSolid" borderRadius="full" height="x2" width="x2" />
              <Text color="fg.neutralMuted" textStyle="t1Regular">
                평균보다 낮은 구간
              </Text>
            </HStack>
          </HStack>
        </VStack>
      </Box>
      <Text color="fg.neutralMuted" textStyle="t2Regular" lineHeight="t3">
        평균보다 낮은 구간 {metrics.lowScoreCount}개를 기준으로 스트레스 이후 하락 여부를 봤어요.
      </Text>
    </VStack>
  );
}

function ResilienceMetricSummary({ curve, metrics }: { curve: ResilienceCurve; metrics: ResilienceMetrics }) {
  const recoveryValue = metrics.recovery > 0 ? `+${metrics.recovery}점` : '0점';

  return (
    <Card bg="bg.brandWeak" borderColor="stroke.brandWeak" p="spacingX.globalGutter">
      <VStack gap="x4">
        <VStack gap="x1_5">
          <Text textStyle="t4Bold">스트레스 복원력</Text>
          <Text color="fg.neutralMuted" textStyle="t3Regular" lineHeight="t4">
            9개 게임의 점수 흐름에서 평균보다 낮아진 구간과 회복 흐름을 봤어요.
          </Text>
        </VStack>
        <ResilienceStabilityBars curve={curve} metrics={metrics} />
        <HStack gap="x2">
          <Box bg="bg.layerFloating" borderRadius="r3" flex={1} p="x3">
            <VStack gap="x0_5">
              <Text color="fg.neutralMuted" textStyle="t2Regular">
                낮은 구간
              </Text>
              <Text textStyle="t6Bold">{metrics.lowScoreCount}개</Text>
            </VStack>
          </Box>
          <Box bg="bg.layerFloating" borderRadius="r3" flex={1} p="x3">
            <VStack gap="x0_5">
              <Text color="fg.neutralMuted" textStyle="t2Regular">
                회복 폭
              </Text>
              <Text textStyle="t6Bold">{recoveryValue}</Text>
            </VStack>
          </Box>
        </HStack>
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

type ResilienceSummaryProps = {
  resilience: ReportResilience;
  state: ReportSectionStates['resilience'];
};

function ResilienceSummary({ resilience, state }: ResilienceSummaryProps) {
  if (resilience == null || state !== 'ready') {
    return null;
  }

  const insights = resilience.insights.slice(0, 2);
  const metrics = resolveResilienceMetrics(resilience.curve);

  return (
    <VStack gap="x2">
      {metrics ? <ResilienceMetricSummary curve={resilience.curve} metrics={metrics} /> : null}
      <ResilienceFeedbackCard insights={insights} />
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

type ImprovementPlanProps = {
  coach: ReportCoach | null;
  state: ReportSectionStates['coach'];
};

function ImprovementPlan({ coach, state }: ImprovementPlanProps) {
  const router = useRouter();

  if (coach == null || state !== 'ready') {
    return null;
  }

  return (
    <VStack gap="x2">
      <HStack align="center" gap="x1_5">
        <Icon name="Target" color="fg.brand" size="small" />
        <Text textStyle="t4Bold">다음 개선 플랜</Text>
      </HStack>
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
