import { Fragment } from 'react';
import { useRouter } from 'expo-router';

import { SubSectionHead } from '../app/SubSectionHead';
import { ReportScoreListCard } from '../reports/ReportScoreListCard';
import { ReportScoreRow } from '../reports/ReportScoreRow';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { List } from '../ui/List';
import { INTERVIEW_AXES } from '../../data/interviewFlow';
import { Box } from '../../design-system/components/Box';
import { HStack, VStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';
import type { ReportInterview, ReportTopFix } from '../../domain/report';
import { QuestionFeedbackRow } from './QuestionFeedbackAccordion';

export type InterviewAnalysisBodyProps = {
  interview: ReportInterview;
  mockExamId: string;
};

const BAND_STEPS = ['부족', '필요', '우수', '완성'] as const;

export function InterviewAnalysisBody({ interview, mockExamId }: InterviewAnalysisBodyProps) {
  const router = useRouter();
  const axisScores = new Map(interview.axes.map((axis) => [axis.key, axis]));

  return (
    <VStack gap="x4">
      <Card p="spacingX.globalGutter">
        <VStack gap="x3">
          <HStack align="center" gap="x2">
            <Text textStyle="t8Bold">{interview.overall_score}</Text>
            <Text color="fg.neutralSubtle" textStyle="t3Medium">
              / 100
            </Text>
          </HStack>
          <HStack gap="x1">
            {BAND_STEPS.map((step) => {
              const active = step === interview.band;
              return (
                <Box
                  key={step}
                  alignItems="center"
                  bg={active ? 'bg.brandWeak' : 'bg.neutralWeak'}
                  borderRadius="r2"
                  flex={1}
                  py="x1"
                >
                  <Text
                    color={active ? 'fg.brand' : 'fg.neutralSubtle'}
                    textStyle={active ? 't2Bold' : 't2Regular'}
                  >
                    {step}
                  </Text>
                </Box>
              );
            })}
          </HStack>
        </VStack>
      </Card>

      <VStack gap="x2">
        <SubSectionHead title="평가 축" caption="또래 평균은 같은 조건으로 응시한 집단의 평균이에요." />
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

      {interview.delivery_details && interview.delivery_details.length > 0 ? (
        <VStack gap="x2">
          <SubSectionHead title="전달력 세부" caption="말의 속도와 흐름처럼 전달 방식을 나누어 본 값이에요." />
          <ReportScoreListCard>
            {interview.delivery_details.map((detail, index) => (
              <Fragment key={index}>
                {index > 0 ? <List.Divider /> : null}
                <ReportScoreRow title={detail.label} value={detail.value} />
              </Fragment>
            ))}
          </ReportScoreListCard>
        </VStack>
      ) : null}

      {interview.ncs_units.length > 0 ? (
        <VStack gap="x2">
          <SubSectionHead title="NCS 능력단위" caption="NCS 직업공통능력 기준으로 답변 행동을 다시 묶어 본 참고 지표예요." />
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
