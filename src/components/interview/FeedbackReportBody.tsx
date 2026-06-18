import { SubSectionHead } from '../app/SubSectionHead';
import { AnalysisStatusCard } from '../reports/AnalysisStatusCard';
import type { InterviewAnswerRow } from '../../data/local/interviewAnswers';
import { Box } from '../../design-system/components/Box';
import { VStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';
import type { ReportInterview } from '../../domain/report';
import type { InterviewSessionRecord } from '../../domain/types';
import { Card } from '../ui/Card';
import { InterviewAnalysisBody } from './InterviewAnalysisBody';
import { InterviewAnswersMeasuredList } from './InterviewAnswersMeasuredList';

export type FeedbackReportBodyProps = {
  session: InterviewSessionRecord | null;
  mockExamId?: string;
  answers?: InterviewAnswerRow[];
  answersLoading?: boolean;
  interview?: ReportInterview | null;
  uploads?: { retry: (answerId: string) => void };
};

function formatAnswerMinutes(durationMs: number) {
  return `${Math.max(1, Math.round(durationMs / 60000))}분`;
}

export function FeedbackReportBody({
  session,
  mockExamId,
  answers = [],
  answersLoading = false,
  interview = null,
  uploads,
}: FeedbackReportBodyProps) {
  const analysisDone = interview?.status === 'done';

  return (
    <VStack gap="x4">
      {session && !analysisDone ? (
        <Card minHeight="x16" p="spacingX.globalGutter">
          <VStack gap="x1">
            <Text color="fg.neutralSubtle" textStyle="t2Regular">
              {session.company} · {session.role}
            </Text>
            <Text textStyle="t5Bold">
              질문 {session.questionCount}개 · 총 답변 {formatAnswerMinutes(session.durationMs)}
            </Text>
            <Text color="fg.neutralMuted" textStyle="t2Regular">
              답변 기록을 저장했어요.
            </Text>
          </VStack>
        </Card>
      ) : null}

      {analysisDone && interview && mockExamId ? (
        <InterviewAnalysisBody interview={interview} mockExamId={mockExamId} session={session} />
      ) : (
        <>
          <VStack gap="x2">
            <SubSectionHead title="답변 기록" />
            {answers.length > 0 ? (
              <InterviewAnswersMeasuredList answers={answers} onRetryUpload={uploads?.retry} />
            ) : (
              <Box minHeight={answersLoading ? 'x34' : 'x16'} />
            )}
          </VStack>
          <VStack gap="x2">
            <SubSectionHead title="AI 분석" />
            {interview?.status === 'failed' ? (
              <AnalysisStatusCard
                variant="failed"
                title="답변을 분석하지 못했어요"
                body="잠시 후 다시 확인해주세요. 답변 기록은 그대로 남아 있어요."
              />
            ) : (
              <AnalysisStatusCard
                variant="pending"
                title="답변 결과를 분석하고 있어요"
                body="내용·구조·음성 분석이 준비되면 여기에서 확인할 수 있어요."
              />
            )}
          </VStack>
        </>
      )}
    </VStack>
  );
}
