import { SectionHead } from '../app/SectionHead';
import { Box } from '../../design-system/components/Box';
import { HStack, VStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';
import type { InterviewSessionRecord } from '../../domain/types';
import { Card } from '../ui/Card';
import { Icon } from '../ui/Icon';

export type FeedbackReportBodyProps = {
  session: InterviewSessionRecord | null;
};

function formatAnswerMinutes(durationMs: number) {
  return `${Math.max(1, Math.round(durationMs / 60000))}분`;
}

export function FeedbackReportBody({ session }: FeedbackReportBodyProps) {
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

      <VStack gap="x2">
        <SectionHead title="AI 분석" />
        <Card minHeight="x16">
          <HStack align="center" gap="x3">
            <Box
              alignItems="center"
              bg="bg.brandWeak"
              borderRadius="full"
              height="x10"
              justifyContent="center"
              width="x10"
            >
              <Icon name="Clock" color="fg.brand" />
            </Box>
            <VStack flex={1} gap="x1">
              <Text textStyle="t4Bold">답변 분석을 준비하고 있어요</Text>
              <Text color="fg.neutralMuted" textStyle="t2Regular">
                내용·구조·음성 분석이 준비되면 여기에서 확인할 수 있어요.
              </Text>
            </VStack>
          </HStack>
        </Card>
      </VStack>
    </VStack>
  );
}
