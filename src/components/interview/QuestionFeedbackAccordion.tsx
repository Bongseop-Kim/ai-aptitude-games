import { Badge } from '../ui/Badge';
import { Icon } from '../ui/Icon';
import { List } from '../ui/List';
import { QUESTION_CATEGORY_TONE } from '../../data/interviewFlow';
import { Box } from '../../design-system/components/Box';
import { HStack, VStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';
import type { ReportInterviewQuestion } from '../../domain/report';

export type QuestionFeedbackRowProps = {
  question: ReportInterviewQuestion;
  index: number;
  onPress: () => void;
};

const AXIS_SHORT_LABELS = {
  content: '내용',
  star: '구조',
  voice: '음성',
  gaze: '시선',
  delivery: '전달력',
} as const;

export function QuestionFeedbackRow({ question, index, onPress }: QuestionFeedbackRowProps) {
  return (
    <List.Item accessibilityLabel={`${index + 1}번 질문 상세 보기`} onPress={onPress}>
      <List.Prefix>
        <Text color="fg.neutralSubtle" textStyle="t3Bold">
          Q{index + 1}
        </Text>
      </List.Prefix>
      <List.Content>
        <HStack align="center" gap="x1_5">
          <Box flex={1}>
            <Text textStyle="t3Medium" maxLines={1}>
              {question.text}
            </Text>
          </Box>
          <Badge
            label={question.category}
            size="xs"
            tone={QUESTION_CATEGORY_TONE[question.category] ?? 'neutral'}
          />
        </HStack>
        <HStack gap="x2">
          {question.scores?.content != null ? (
            <Text color="fg.neutralMuted" textStyle="t2Regular">
              내용 {question.scores.content}
            </Text>
          ) : null}
          {question.scores?.star != null ? (
            <Text color="fg.neutralMuted" textStyle="t2Regular">
              구조 {question.scores.star}
            </Text>
          ) : null}
        </HStack>
      </List.Content>
      <List.Suffix>
        <Icon name="ChevronRight" color="fg.neutralSubtle" size="small" />
      </List.Suffix>
    </List.Item>
  );
}

export function QuestionFeedbackDetails({ question }: { question: ReportInterviewQuestion }) {
  return (
    <VStack gap="x3">
      {question.scores ? (
        <HStack gap="x3">
          {(Object.keys(AXIS_SHORT_LABELS) as (keyof typeof AXIS_SHORT_LABELS)[]).map((key) => {
            const score = question.scores?.[key];
            if (score == null) return null;
            return (
              <VStack key={key} align="center" gap="x0_5">
                <Text color="fg.neutralSubtle" textStyle="t1Regular">
                  {AXIS_SHORT_LABELS[key]}
                </Text>
                <Text textStyle="t3Bold">{score}</Text>
              </VStack>
            );
          })}
        </HStack>
      ) : null}
      {question.good != null ? <FeedbackLine label="잘한 점" body={question.good} /> : null}
      {question.fix != null ? <FeedbackLine label="보완할 점" body={question.fix} /> : null}
      {question.why != null ? <FeedbackLine label="질문 의도" body={question.why} /> : null}
    </VStack>
  );
}
function FeedbackLine({ label, body }: { label: string; body: string }) {
  return (
    <VStack gap="x0_5">
      <Text color="fg.neutralSubtle" textStyle="t2Medium">
        {label}
      </Text>
      <Text color="fg.neutral" textStyle="t3Regular">
        {body}
      </Text>
    </VStack>
  );
}
