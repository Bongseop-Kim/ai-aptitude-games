import { SectionHead } from '../app/SectionHead';
import { AnalysisStatusCard } from '../reports/AnalysisStatusCard';
import type { InterviewAnswerRow } from '../../data/local/interviewAnswers';
import { VStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';
import type { ReportInterview } from '../../domain/report';
import type { InterviewSessionRecord } from '../../domain/types';
import { Card } from '../ui/Card';
import { InterviewAnalysisBody } from './InterviewAnalysisBody';
import { InterviewAnswersMeasuredList } from './InterviewAnswersMeasuredList';

export type FeedbackReportBodyProps = {
  session: InterviewSessionRecord | null;
  answers?: InterviewAnswerRow[];
  interview?: ReportInterview | null;
  uploads?: { retry: (answerId: string) => void };
};

function formatAnswerMinutes(durationMs: number) {
  return `${Math.max(1, Math.round(durationMs / 60000))}분`;
}

export function FeedbackReportBody({
  session,
  answers = [],
  interview = null,
  uploads,
}: FeedbackReportBodyProps) {
  const analysisDone = interview?.status === 'done';

  return (
    <VStack gap="x4">
      {session ? (
        <Card minHeight="x16">
          <VStack gap="x1">
            <Text color="fg.neutralSubtle" textStyle="t2Regular">
              {session.company} · {session.role}
            </Text>
            <Text textStyle="t6Bold">
              질문 {session.questionCount}개 · 총 답변 {formatAnswerMinutes(session.durationMs)}
            </Text>
            <Text color="fg.neutralMuted" textStyle="t2Regular">
              답변 기록을 저장했어요.
            </Text>
          </VStack>
        </Card>
      ) : null}

      {analysisDone && interview ? (
        <InterviewAnalysisBody interview={interview} />
      ) : (
        <>
          {answers.length > 0 ? (
            <VStack gap="x2">
              <SectionHead title="답변 기록" />
              <InterviewAnswersMeasuredList answers={answers} onRetryUpload={uploads?.retry} />
            </VStack>
          ) : null}
          <VStack gap="x2">
            <SectionHead title="AI 분석" />
            {interview?.status === 'failed' ? (
              <AnalysisStatusCard
                variant="failed"
                title="답변을 분석하지 못했어요"
                body="잠시 후 다시 확인해주세요. 답변 기록은 그대로 남아 있어요."
              />
            ) : (
              <AnalysisStatusCard
                variant="pending"
                title="답변 분석을 준비하고 있어요"
                body="내용·구조·음성 분석이 준비되면 여기에서 확인할 수 있어요."
              />
            )}
          </VStack>
        </>
      )}
    </VStack>
  );
}
