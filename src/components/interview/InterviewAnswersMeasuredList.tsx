import { Fragment } from 'react';

import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { List } from '../ui/List';
import { QUESTION_CATEGORY_TONE } from '../../data/interviewFlow';
import type { InterviewAnswerRow } from '../../data/local/interviewAnswers';
import { HStack, VStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';

export type InterviewAnswersMeasuredListProps = {
  answers: InterviewAnswerRow[];
  onRetryUpload?: (answerId: string) => void;
};

function formatAnswerTime(ms: number) {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function InterviewAnswersMeasuredList({ answers, onRetryUpload }: InterviewAnswersMeasuredListProps) {
  return (
    <Card py="x1">
      <List.Root>
        {answers.map((answer, index) => (
          <Fragment key={answer.id}>
            {index > 0 ? <List.Divider /> : null}
            <MeasuredAnswerRow answer={answer} onRetryUpload={onRetryUpload} />
          </Fragment>
        ))}
      </List.Root>
    </Card>
  );
}

function MeasuredAnswerRow({
  answer,
  onRetryUpload,
}: {
  answer: InterviewAnswerRow;
  onRetryUpload?: (answerId: string) => void;
}) {
  return (
    <VStack gap="x2" py="x2">
      <HStack align="center" gap="x1_5">
        <Badge
          label={answer.category}
          size="small"
          tone={QUESTION_CATEGORY_TONE[answer.category] ?? 'neutral'}
        />
        <Text color="fg.neutralSubtle" textStyle="t2Regular">
          답변 {formatAnswerTime(answer.answerMs)}
        </Text>
        {answer.retakeCount > 0 ? (
          <Text color="fg.neutralSubtle" textStyle="t2Regular">
            재응답 {answer.retakeCount}회
          </Text>
        ) : null}
        {answer.mediaStatus === 'uploading' ? <Badge label="업로드 중" size="small" /> : null}
        {answer.mediaStatus === 'failed' ? (
          <Badge label="업로드 실패" size="small" tone="critical" />
        ) : null}
      </HStack>
      <Text textStyle="t3Medium" maxLines={2}>
        {answer.questionText}
      </Text>
      {answer.mediaStatus === 'failed' && onRetryUpload ? (
        <HStack>
          <Button
            label="다시 시도"
            iconLeft="RotateCcw"
            size="small"
            variant="weak"
            onPress={() => onRetryUpload(answer.id)}
          />
        </HStack>
      ) : null}
    </VStack>
  );
}
