import { Fragment } from 'react';

import { SubSectionHead } from '../app/SubSectionHead';
import { ProgressBar } from '../readiness/ProgressBar';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { List } from '../ui/List';
import { INTERVIEW_AXES } from '../../data/interviewFlow';
import { Box } from '../../design-system/components/Box';
import { HStack, VStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';
import type { ReportInterview, ReportTopFix } from '../../domain/report';
import { QuestionFeedbackAccordion } from './QuestionFeedbackAccordion';

export type InterviewAnalysisBodyProps = {
  interview: ReportInterview;
};

const BAND_STEPS = ['부족', '필요', '우수', '완성'] as const;

export function InterviewAnalysisBody({ interview }: InterviewAnalysisBodyProps) {
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
        <Card p="spacingX.globalGutter">
          <List.Root>
            {INTERVIEW_AXES.map((axis, index) => {
              const score = axisScores.get(axis.key) ?? null;
              return (
                <Fragment key={axis.key}>
                  {index > 0 ? <List.Divider /> : null}
                  <HStack align="center" gap="x3" py="x3">
                    <VStack flex={0.55} gap="x0_5" minWidth="x16">
                      <Text textStyle="t4Bold">{axis.name}</Text>
                      <Text color="fg.neutralSubtle" textStyle="t2Regular" lineHeight="t3" maxLines={2}>
                        {axis.sub}
                      </Text>
                    </VStack>
                    {score != null ? (
                      <>
                        <Box flex={1}>
                          <ProgressBar value={score.score} layout="inline" />
                        </Box>
                        <Text textStyle="t5Bold">{score.score}</Text>
                        {score.peer_avg != null ? (
                          <Text color="fg.neutralMuted" textStyle="t2Regular">
                            또래 {score.peer_avg}
                          </Text>
                        ) : null}
                      </>
                    ) : (
                      <Box flex={1}>
                        <Text color="fg.neutralSubtle" textStyle="t2Regular">
                          영상 분석 준비 중
                        </Text>
                      </Box>
                    )}
                  </HStack>
                </Fragment>
              );
            })}
          </List.Root>
        </Card>
      </VStack>

      {interview.delivery_details && interview.delivery_details.length > 0 ? (
        <VStack gap="x2">
          <SubSectionHead title="전달력 세부" caption="말의 속도와 흐름처럼 전달 방식을 나누어 본 값이에요." />
          <Card p="spacingX.globalGutter">
            <List.Root>
              {interview.delivery_details.map((detail, index) => (
                <Fragment key={index}>
                  {index > 0 ? <List.Divider /> : null}
                  <HStack align="center" gap="x3" py="x3">
                    <Box flex={0.45} minWidth="x16">
                      <Text textStyle="t3Medium" maxLines={2}>
                        {detail.label}
                      </Text>
                    </Box>
                    <Box flex={1}>
                      <ProgressBar value={detail.value} layout="inline" />
                    </Box>
                    <Text textStyle="t5Bold">{detail.value}</Text>
                  </HStack>
                </Fragment>
              ))}
            </List.Root>
          </Card>
        </VStack>
      ) : null}

      {interview.ncs_units.length > 0 ? (
        <VStack gap="x2">
          <SubSectionHead title="NCS 능력단위" caption="직무에서 자주 쓰는 행동 단위로 답변을 다시 묶어 본 값이에요." />
          <Card p="spacingX.globalGutter">
            <List.Root>
              {interview.ncs_units.map((unit, index) => (
                <Fragment key={index}>
                  {index > 0 ? <List.Divider /> : null}
                  <HStack align="center" gap="x3" py="x3">
                    <Box flex={0.45} minWidth="x16">
                      <Text textStyle="t3Medium" maxLines={2}>
                        {unit.label}
                      </Text>
                    </Box>
                    <Box flex={1}>
                      <ProgressBar value={unit.score} layout="inline" />
                    </Box>
                    <Text textStyle="t5Bold">{unit.score}</Text>
                  </HStack>
                </Fragment>
              ))}
            </List.Root>
          </Card>
        </VStack>
      ) : null}

      {interview.top_fixes.length > 0 ? (
        <VStack gap="x2">
          <SubSectionHead title="우선 보완 포인트" />
          {interview.top_fixes.map((fix, index) => (
            <TopFixCard key={index} fix={fix} />
          ))}
        </VStack>
      ) : null}

      {interview.questions.length > 0 ? (
        <VStack gap="x2">
          <SubSectionHead title="질문별 피드백" />
          {interview.questions.map((question, index) => (
            <QuestionFeedbackAccordion key={question.question_id} question={question} index={index} />
          ))}
        </VStack>
      ) : null}
    </VStack>
  );
}

function TopFixCard({ fix }: { fix: ReportTopFix }) {
  const axisName = INTERVIEW_AXES.find((axis) => axis.key === fix.axis)?.name ?? fix.axis;

  return (
    <Card p="spacingX.globalGutter">
      <VStack gap="x1_5">
        <HStack align="center" gap="x1_5">
          <Badge label={axisName} size="small" tone="informative" />
          {fix.pro ? <Badge label="Pro" size="small" tone="brandSolid" /> : null}
        </HStack>
        <Text textStyle="t4Bold">{fix.title}</Text>
        <Text color="fg.neutralMuted" textStyle="t2Regular">
          {fix.body}
        </Text>
      </VStack>
    </Card>
  );
}
