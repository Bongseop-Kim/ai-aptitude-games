import { useState } from 'react';
import { Pressable } from 'react-native';

import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { Icon } from '../ui/Icon';
import { QUESTION_CATEGORY_TONE } from '../../data/interviewFlow';
import { Box } from '../../design-system/components/Box';
import { HStack, VStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';
import type { ReportInterviewQuestion } from '../../domain/report';

export type QuestionFeedbackAccordionProps = {
  question: ReportInterviewQuestion;
  index: number;
};

const AXIS_SHORT_LABELS = {
  content: '내용',
  star: '구조',
  voice: '음성',
  gaze: '시선',
  delivery: '전달력',
} as const;

export function QuestionFeedbackAccordion({ question, index }: QuestionFeedbackAccordionProps) {
  const [expanded, setExpanded] = useState(false);
  const [transcriptVisible, setTranscriptVisible] = useState(false);
  const summaryHidden = expanded;
  const detailHidden = !expanded;
  const transcriptHidden = !transcriptVisible;

  return (
    <Card py="x3">
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        onPress={() => setExpanded((value) => !value)}
      >
        <HStack align="center" gap="x2">
          <Text color="fg.neutralSubtle" textStyle="t3Bold">
            Q{index + 1}
          </Text>
          <Badge
            label={question.category}
            size="small"
            tone={QUESTION_CATEGORY_TONE[question.category] ?? 'neutral'}
          />
          <Box flex={1}>
            <Text textStyle="t3Medium" maxLines={2}>
              {question.text}
            </Text>
          </Box>
          <Icon name={expanded ? 'ChevronUp' : 'ChevronDown'} color="fg.neutralSubtle" size="small" />
        </HStack>
        <HStack
          gap="x2"
          pt="x1_5"
          pointerEvents={summaryHidden ? 'none' : 'auto'}
          accessibilityElementsHidden={summaryHidden}
          importantForAccessibility={summaryHidden ? 'no-hide-descendants' : 'auto'}
          style={{ opacity: summaryHidden ? 0 : 1 }}
        >
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
      </Pressable>

      <VStack
        gap="x3"
        pt="x3"
        pointerEvents={detailHidden ? 'none' : 'auto'}
        accessibilityElementsHidden={detailHidden}
        importantForAccessibility={detailHidden ? 'no-hide-descendants' : 'auto'}
        style={{ opacity: detailHidden ? 0 : 1 }}
      >
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

        {question.transcript != null ? (
          <VStack gap="x1_5">
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded: transcriptVisible }}
              onPress={() => setTranscriptVisible((value) => !value)}
            >
              <HStack align="center" gap="x1">
                <Text color="fg.brand" textStyle="t2Medium">
                  {transcriptVisible ? '전사 접기' : '전사 보기'}
                </Text>
                <Icon
                  name={transcriptVisible ? 'ChevronUp' : 'ChevronDown'}
                  color="fg.brand"
                  size="small"
                />
              </HStack>
            </Pressable>
            <Text
              color="fg.neutralMuted"
              textStyle="t2Regular"
              pointerEvents={transcriptHidden ? 'none' : 'auto'}
              accessibilityElementsHidden={transcriptHidden}
              importantForAccessibility={transcriptHidden ? 'no-hide-descendants' : 'auto'}
              style={{ opacity: transcriptHidden ? 0 : 1 }}
            >
              {question.transcript}
            </Text>
          </VStack>
        ) : null}

        {question.good != null ? <FeedbackLine label="잘한 점" body={question.good} /> : null}
        {question.fix != null ? <FeedbackLine label="보완할 점" body={question.fix} /> : null}
        {question.why != null ? <FeedbackLine label="질문 의도" body={question.why} /> : null}
      </VStack>
    </Card>
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
