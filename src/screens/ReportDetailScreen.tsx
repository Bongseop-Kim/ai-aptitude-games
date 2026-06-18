import { Fragment, useState, type ReactNode } from 'react';
import { ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Header } from '../components/app/Header';
import { SectionHead } from '../components/app/SectionHead';
import { Screen } from '../components/app/Screen';
import { ReservedSlot } from '../components/app/ReservedSlot';
import { FeedbackReportBody } from '../components/interview/FeedbackReportBody';
import { AnalysisStatusCard } from '../components/reports/AnalysisStatusCard';
import { CompetencySection } from '../components/reports/CompetencySection';
import { GamesSection } from '../components/reports/GamesSection';
import { ProIntroSheet } from '../components/reports/ProIntroSheet';
import { ReportPaywall } from '../components/reports/ReportPaywall';
import { ResponsePatternRows } from '../components/reports/ReportCharts';
import {
  ResilienceDifficultyChart,
  type ResilienceChartPoint,
} from '../components/reports/ResilienceDifficultyChart';
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
import {
  useGameResultRoundsForMockExam,
  useGameResultsForMockExam,
} from '../data/local/useGameResults';
import type { GameResultRecord, GameResultRoundRecord } from '../data/local/gameResults';
import { useMockExamRecord } from '../data/local/useMockExamResults';
import { useIsPro, useProfile } from '../data/server/useProfile';
import { useMockExamReport, getReportSectionStates } from '../data/server/useMockExamReport';
import { retryInterviewMediaUpload } from '../data/media/interviewMediaUpload';
import { useAuth } from '../providers/AuthProvider';
import { Box } from '../design-system/components/Box';
import { HStack, VStack } from '../design-system/components/Stack';
import { Text } from '../design-system/components/Text';
import type {
  MockExamReport,
  ReportCompetencyScore,
  ReportResilience,
  ReportResponsePattern,
} from '../domain/report';
import { buildPressureRecoveryCurve } from '../domain/reportResilience';
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

type MockExamGameResults = Partial<Record<GameId, GameResultRecord>> | undefined;

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
    <Screen contentPb="x0" safeEdges={['top', 'left', 'right']}>
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
  return (
    <Box flex={1} bleedX="spacingX.globalGutter">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <Box px="spacingX.globalGutter" pt="x3" pb="x8">
          <ReportDetailSkeleton />
        </Box>
      </ScrollView>
    </Box>
  );
}

function MissingReportBody({ onBack }: { onBack: () => void }) {
  return (
    <Box flex={1} bleedX="spacingX.globalGutter">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <Box px="spacingX.globalGutter" pt="x3" pb="x8">
          <MissingReport onBack={onBack} />
        </Box>
      </ScrollView>
    </Box>
  );
}

function ReportContent({ record }: { record: MockExamRecord }) {
  const reportQuery = useMockExamReport(record.id, record.createdAt);
  const row = reportQuery.data ?? null;
  const states = getReportSectionStates(row);
  const report = row?.status === 'done' ? row.report : null;
  const readyReport = report?.overall != null && report.interview?.status === 'done' ? report : null;
  const localResults = useGameResultsForMockExam(record.id);
  const localRounds = useGameResultRoundsForMockExam(record.id);
  const onRetryReport = () => void reportQuery.refetch();

  if (!readyReport) {
    return (
      <ReportAnalysisPending
        failed={row?.status === 'failed'}
        onRetry={onRetryReport}
      />
    );
  }

  return (
    <Box flex={1} bleedX="spacingX.globalGutter">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <Box px="spacingX.globalGutter" pt="x3" pb="x8">
          <VStack gap="x8">
            {reportDetailSections.map((section) => (
              <VStack key={section.key} gap="x3">
                {section.key === 'summary' ? null : <SectionHead title={section.title} />}
                <ReportSectionBody
                  sectionKey={section.key}
                  record={record}
                  report={readyReport}
                  gameResults={localResults.data}
                  gameRounds={localRounds.data}
                  states={states}
                  onRetryReport={onRetryReport}
                />
              </VStack>
            ))}
          </VStack>
        </Box>
      </ScrollView>
    </Box>
  );
}

function ReportAnalysisPending({ failed, onRetry }: { failed: boolean; onRetry: () => void }) {
  return (
    <Box flex={1} bleedX="spacingX.globalGutter">
      <Box px="spacingX.globalGutter" pt="x3" pb="x8">
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
  );
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
  gameRounds: GameResultRoundRecord[] | undefined;
  states: ReportSectionStates;
  onRetryReport: () => void;
};

function ReportSectionBody({
  sectionKey,
  record,
  report,
  gameResults,
  gameRounds,
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
          gameResults={gameResults}
          gameRounds={gameRounds}
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
  gameResults: MockExamGameResults;
  gameRounds: GameResultRoundRecord[] | undefined;
  report: MockExamReport | null;
  states: ReportSectionStates;
  onRetry: () => void;
};

function GameDiagnosisSection({
  record,
  gameResults,
  gameRounds,
  report,
  states,
  onRetry,
}: GameDiagnosisSectionProps) {
  const hasFailedCore =
    states.resilience === 'failed' ||
    states.coach === 'failed';
  const hasPendingCore =
    states.resilience === 'pending' ||
    states.coach === 'pending';

  return (
    <VStack gap="x3">
      <ResilienceSummary
        gameResults={gameResults}
        gameRounds={gameRounds}
        resilience={report?.resilience ?? null}
        state={states.resilience}
      />

      <ReportSubsection title="게임별 결과">
        <GamesSection record={record} gameInsights={report?.games ?? null} />
      </ReportSubsection>

      <ReportSubsection
        title="앱 5대 역량 프로필"
        caption="NCS 공식 판정이 아니라, 게임 과제를 직업공통능력 관점으로 다시 묶은 참고 지표예요."
      >
        <CompetenciesSection competencies={report?.competencies ?? null} state={states.competencies} onRetry={onRetry} />
      </ReportSubsection>

      <ReportSubsection title="응답 패턴 프로필">
        <ResponsePatternSection pattern={report?.response_pattern ?? null} state={states.pattern} onRetry={onRetry} />
      </ReportSubsection>

      {hasFailedCore ? (
        <AnalysisStatusCard
          variant="failed"
          title="일부 진단을 불러오지 못했어요"
          body="다시 시도하면 게임 진단을 업데이트할 수 있어요."
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
  children: ReactNode;
};

function ReportSubsection({ title, caption, children }: ReportSubsectionProps) {
  return (
    <VStack gap="x2">
      <VStack gap="x0_5">
        <Text textStyle="t4Bold">{title}</Text>
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

type ResilienceCurve = NonNullable<ReportResilience>['curve'];

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

function averageScore(values: readonly number[]) {
  if (values.length === 0) {
    return 0;
  }

  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function isPressureCurve(curve: ResilienceCurve) {
  return (
    curve.length > 0 &&
    curve.every(
      (point) =>
        point.actual_score != null &&
        point.difficulty != null &&
        point.expected_score != null &&
        point.score_gap != null,
    )
  );
}

function resolveLocalResilienceCurve(
  gameResults: MockExamGameResults,
  gameRounds: GameResultRoundRecord[] | undefined,
): ResilienceCurve | null {
  const inputs = games
    .map((game) => {
      const result = gameResults?.[game.id];
      if (!result) {
        return null;
      }

      const rounds = gameRounds?.filter((round) => round.gameId === game.id) ?? [];
      return {
        gameId: game.id,
        actualScore: result.score,
        difficulty: averageScore(rounds.map((round) => round.difficulty)) || 50,
      };
    })
    .filter(
      (input): input is { actualScore: number; difficulty: number; gameId: GameId } =>
        input != null,
    );

  return inputs.length > 0 ? buildPressureRecoveryCurve(inputs) : null;
}

function resolveDisplayResilienceCurve({
  gameResults,
  gameRounds,
  resilience,
}: {
  gameResults: MockExamGameResults;
  gameRounds: GameResultRoundRecord[] | undefined;
  resilience: ReportResilience;
}) {
  if (resilience?.curve && isPressureCurve(resilience.curve)) {
    return resilience.curve;
  }

  const localCurve = resolveLocalResilienceCurve(gameResults, gameRounds);
  if (localCurve) {
    return localCurve;
  }

  if (!resilience?.curve || resilience.curve.length === 0) {
    return null;
  }

  return buildPressureRecoveryCurve(
    resilience.curve.map((point) => ({
      gameId: point.game_id,
      actualScore: point.actual_score ?? point.value,
      difficulty: point.difficulty ?? 50,
    })),
  );
}

function ResilienceDifficultySection({ curve }: { curve: ResilienceCurve }) {
  const points: ResilienceChartPoint[] = curve.map((point) => ({
    key: `${point.game_id}-${point.segment}`,
    actual: point.actual_score ?? point.value,
    difficulty: point.difficulty ?? 50,
  }));

  return (
    <Card bg="bg.brandWeak" borderColor="stroke.brandWeak" p="spacingX.globalGutter">
      <VStack gap="x4">
        <VStack gap="x1_5">
          <Text textStyle="t4Bold">출제 난이도와 점수</Text>
          <Text color="fg.neutralMuted" textStyle="t3Regular" lineHeight="t4">
            게임별 출제 난이도(선)와 실제 점수(막대)를 함께 봤어요. 난이도가 높은 구간에서도 점수가 버텼는지 살펴보세요.
          </Text>
        </VStack>
        <ResilienceDifficultyChart points={points} />
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
  gameResults: MockExamGameResults;
  gameRounds: GameResultRoundRecord[] | undefined;
  resilience: ReportResilience;
  state: ReportSectionStates['resilience'];
};

function ResilienceSummary({ gameResults, gameRounds, resilience, state }: ResilienceSummaryProps) {
  if (resilience == null || state !== 'ready') {
    return null;
  }

  const insights = resilience.insights.slice(0, 2);
  const curve = resolveDisplayResilienceCurve({ gameResults, gameRounds, resilience });

  return (
    <VStack gap="x2">
      {curve ? <ResilienceDifficultySection curve={curve} /> : null}
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
      mockExamId={mockExamId}
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
