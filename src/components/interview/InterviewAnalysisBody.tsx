import { Fragment, useState } from 'react';
import { useRouter } from 'expo-router';

import { SubSectionHead } from '../app/SubSectionHead';
import { ReportScoreListCard } from '../reports/ReportScoreListCard';
import { ReportScoreRow } from '../reports/ReportScoreRow';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
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
            fullWidth
            items={chartItems}
            onValueChange={setChartKey}
            size="small"
            value={chartKey}
          />
          {chartKey === 'axes' ? (
            <VStack>
              <ReportScoreListCard markerLegendLabel="또래 평균">
                {INTERVIEW_AXES.map((axis, index) => {
                  const score = axisScores.get(axis.key) ?? null;
                  return (
                    <Fragment key={axis.key}>
                      {index > 0 ? <List.Divider /> : null}
                      <ReportScoreRow
                        title={axis.name}
                        value={score?.score ?? null}
                        markerValue={score?.peer_avg ?? null}
                        tagItems={[
                          { label: axis.sub },
                          ...(score?.peer_avg != null ? [{ label: `또래 ${score.peer_avg}` }] : []),
                        ]}
                        unavailableLabel="영상 분석 준비 중"
                      />
                    </Fragment>
                  );
                })}
              </ReportScoreListCard>
            </VStack>
          ) : null}
          {chartKey === 'delivery' && hasDeliveryDetails ? (
            <VStack>
              <ReportScoreListCard>
                {interview.delivery_details?.map((detail, index) => (
                  <Fragment key={index}>
                    {index > 0 ? <List.Divider /> : null}
                    <ReportScoreRow title={detail.label} value={detail.value} />
                  </Fragment>
                ))}
              </ReportScoreListCard>
            </VStack>
          ) : null}
          {chartKey === 'ncs' && hasNcsUnits ? (
            <VStack>
              <ReportScoreListCard>
                {interview.ncs_units.map((unit, index) => (
                  <Fragment key={unit.label}>
                    {index > 0 ? <List.Divider /> : null}
                    <ReportScoreRow
                      title={unit.label}
                      value={unit.score}
                      tagItems={unit.basis ? [{ label: unit.basis }] : []}
                    />
                  </Fragment>
                ))}
              </ReportScoreListCard>
            </VStack>
          ) : null}
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
