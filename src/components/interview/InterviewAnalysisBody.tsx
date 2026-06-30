import { Fragment, useState } from 'react';
import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import { SubSectionHead } from '../app/SubSectionHead';
import { RadarChart } from '../reports/ReportCharts';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import type { HelpBubbleInfo } from '../ui/HelpBubble';
import { List } from '../ui/List';
import { SegmentedControl } from '../ui/SegmentedControl';
import { INTERVIEW_AXES } from '../../data/interviewFlow';
import { Box } from '../../design-system/components/Box';
import { HStack, VStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';
import type { ReportInterview, ReportTopFix } from '../../domain/report';
import type { InterviewSessionRecord } from '../../domain/types';
import { formatAnswerMinutes } from '../../domain/interviewFormatting';
import { QuestionFeedbackRow } from './QuestionFeedbackAccordion';

export type InterviewAnalysisBodyProps = {
  interview: ReportInterview;
  mockExamId: string;
  session?: InterviewSessionRecord | null;
};

type InterviewChartKey = 'axes' | 'delivery' | 'ncs';

const INTERVIEW_CHART_HELP: Record<InterviewChartKey, HelpBubbleInfo> = {
  axes: {
    title: '평가는 이렇게 봤어요',
    description:
      '질문별 답변에서 내용 관련성, STAR 구조, 음성, 시선, 전달력을 각각 0~100점으로 봤어요. 또래 평균은 같은 기준으로 분석한 답변과 비교한 값이에요.',
  },
  delivery: {
    title: '전달은 이렇게 봤어요',
    description:
      '음성과 영상에서 말 속도, 발음 명료도, 시선 안정처럼 전달에 영향을 주는 신호를 봤어요.',
  },
  ncs: {
    title: 'NCS는 이렇게 봤어요',
    description:
      '답변 내용과 사례를 NCS 직업기초능력 단위에 연결해 점수화했어요. 질문 의도와 답변 근거가 얼마나 맞는지 함께 봐요.',
  },
};

export function InterviewAnalysisBody({ interview, mockExamId, session = null }: InterviewAnalysisBodyProps) {
  const router = useRouter();
  const [chartKey, setChartKey] = useState<InterviewChartKey>('axes');
  const axisScores = new Map(interview.axes.map((axis) => [axis.key, axis]));
  const hasDeliveryDetails = Boolean(interview.delivery_details && interview.delivery_details.length > 0);
  const hasNcsUnits = interview.ncs_units.length > 0;
  const chartItems = [
    { label: '평가', value: 'axes' },
    { label: '전달', value: 'delivery', disabled: !hasDeliveryDetails },
    { label: 'NCS', value: 'ncs', disabled: !hasNcsUnits },
  ] as const satisfies readonly { disabled?: boolean; label: string; value: InterviewChartKey }[];

  return (
    <VStack gap="x4">
      <Card bg="bg.brandWeak" borderColor="stroke.brandWeak" p="spacingX.globalGutter">
        <VStack gap="x3">
          {session ? (
            <VStack gap="x1">
              <Text color="fg.neutralSubtle" textStyle="t2Regular">
                {session.company} · {session.role}
              </Text>
              <Text textStyle="t4Bold">
                질문 {session.questionCount}개 · 총 답변 {formatAnswerMinutes(session.durationMs)}
              </Text>
            </VStack>
          ) : null}
          {session ? <List.Divider /> : null}
          <HStack align="center" gap="x3" justify="spaceBetween">
            <HStack align="center" gap="x1">
              <Text textStyle="t8Bold">{interview.overall_score}</Text>
              <Text color="fg.neutralSubtle" textStyle="t3Medium">
                / 100
              </Text>
            </HStack>
            <Badge label={interview.band} size="small" tone="brand" />
          </HStack>
        </VStack>
      </Card>

      <VStack gap="x2">
        <SubSectionHead title="면접 차트" />
        <VStack gap="x3" minHeight="x60">
          <SegmentedControl
            accessibilityLabel="면접 차트 선택"
            items={chartItems}
            onValueChange={setChartKey}
            size="small"
            value={chartKey}
          />
          <Box position="relative">
            <Box
              accessibilityElementsHidden={chartKey !== 'axes'}
              importantForAccessibility={chartKey === 'axes' ? 'auto' : 'no-hide-descendants'}
              pointerEvents={chartKey === 'axes' ? 'auto' : 'none'}
              style={chartKey === 'axes' ? styles.visibleChartPane : styles.hiddenChartPane}
            >
              <RadarChart
                comparisonLabel="또래 평균"
                help={INTERVIEW_CHART_HELP.axes}
                points={INTERVIEW_AXES.map((axis) => {
                  const score = axisScores.get(axis.key) ?? null;
                  return {
                    label: axis.name,
                    value: score?.score ?? null,
                    comparisonValue: score?.peer_avg ?? null,
                  };
                })}
                unavailableLabel="영상 분석 준비 중"
              />
            </Box>
            <Box
              accessibilityElementsHidden={chartKey !== 'delivery'}
              importantForAccessibility={chartKey === 'delivery' ? 'auto' : 'no-hide-descendants'}
              pointerEvents={chartKey === 'delivery' ? 'auto' : 'none'}
              style={chartKey === 'delivery' ? styles.visibleChartPane : styles.hiddenChartPane}
            >
              <RadarChart
                help={INTERVIEW_CHART_HELP.delivery}
                points={(interview.delivery_details ?? []).map((detail) => ({
                  label: detail.label,
                  value: detail.value,
                }))}
              />
            </Box>
            <Box
              accessibilityElementsHidden={chartKey !== 'ncs'}
              importantForAccessibility={chartKey === 'ncs' ? 'auto' : 'no-hide-descendants'}
              pointerEvents={chartKey === 'ncs' ? 'auto' : 'none'}
              style={chartKey === 'ncs' ? styles.visibleChartPane : styles.hiddenChartPane}
            >
              <RadarChart
                help={INTERVIEW_CHART_HELP.ncs}
                points={interview.ncs_units.map((unit) => ({
                  label: unit.label,
                  value: unit.score,
                }))}
              />
            </Box>
          </Box>
        </VStack>
      </VStack>

      {interview.top_fixes.length > 0 ? (
        <VStack gap="x2">
          <SubSectionHead title="우선 보완 포인트" />
          <Card py="x1">
            <List.Root>
              {interview.top_fixes.map((fix, index) => (
                <Fragment key={index}>
                  {index > 0 ? <List.Divider /> : null}
                  <TopFixRow fix={fix} index={index} />
                </Fragment>
              ))}
            </List.Root>
          </Card>
        </VStack>
      ) : null}

      {interview.questions.length > 0 ? (
        <VStack gap="x2">
          <SubSectionHead title="질문별 피드백" />
          <Card py="x1">
            <List.Root>
              {interview.questions.map((question, index) => (
                <Fragment key={question.question_id}>
                  {index > 0 ? <List.Divider /> : null}
                  <QuestionFeedbackRow
                    question={question}
                    index={index}
                    onPress={() => {
                      router.push({
                        pathname: '/reports/[id]/interview-questions/[questionId]',
                        params: { id: mockExamId, questionId: question.question_id },
                      } as never);
                    }}
                  />
                </Fragment>
              ))}
            </List.Root>
          </Card>
        </VStack>
      ) : null}
    </VStack>
  );
}

const styles = StyleSheet.create({
  hiddenChartPane: {
    left: 0,
    opacity: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  visibleChartPane: {
    opacity: 1,
  },
});

function TopFixRow({ fix, index }: { fix: ReportTopFix; index: number }) {
  const axisName = INTERVIEW_AXES.find((axis) => axis.key === fix.axis)?.name ?? fix.axis;

  return (
    <List.Item>
      <List.Prefix>
        <Text color="fg.neutralSubtle" textStyle="t3Bold">
          {index + 1}
        </Text>
      </List.Prefix>
      <List.Content>
        <HStack align="center" gap="x1_5">
          <Box flex={1}>
            <Text textStyle="t3Medium" maxLines={1}>
              {fix.title}
            </Text>
          </Box>
          <Badge label={axisName} size="xs" tone="informative" />
        </HStack>
        <Text color="fg.neutralMuted" textStyle="t2Regular">
          {fix.body}
        </Text>
      </List.Content>
    </List.Item>
  );
}
