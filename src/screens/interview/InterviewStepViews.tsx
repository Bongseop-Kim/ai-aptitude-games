import { Body } from '../../components/app/Body';
import { BottomActionBar } from '../../components/app/BottomActionBar';
import {
  InterviewCameraView,
  QuestionDots,
  RecordControls,
  type RecordMode,
  StarGuide,
  StatCard,
  formatRecordTime,
} from '../../components/interview/InterviewFlowParts';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Icon } from '../../components/ui/Icon';
import { Box } from '../../design-system/components/Box';
import { Grid } from '../../design-system/components/Grid';
import { HStack, VStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';
import type { InterviewPromptQuestion } from '../../domain/composeInterviewQuestions';

export function RecordStepView({
  question,
  questionIndex,
  total,
  mode,
  elapsed,
  onStart,
  onStop,
  onRetake,
  onNext,
}: {
  question: InterviewPromptQuestion;
  questionIndex: number;
  total: number;
  mode: RecordMode;
  elapsed: number;
  onStart: () => void;
  onStop: () => void;
  onRetake: () => void;
  onNext: () => void;
}) {
  const limitSeconds = question.limitSeconds;

  return (
    <Body bottomPad="x6">
      <VStack flex={1} gap="x3">
        <HStack align="center" gap="x2">
          <QuestionDots index={questionIndex} total={total} />
          <Text color="fg.neutralMuted" textStyle="t3Bold">{questionIndex + 1} / {total}</Text>
        </HStack>
        <Card p="x3">
          <HStack gap="x3">
            <InterviewCameraView active recording={mode === 'rec'} elapsed={elapsed} />
            <VStack flex={1} gap="x2">
              <Badge label={question.category} tone="brand" size="small" />
              <Text textStyle="t4Bold">{question.text}</Text>
              <Text color={mode === 'rec' ? 'fg.critical' : 'fg.neutralSubtle'} textStyle="t5Bold">
                {formatRecordTime(elapsed)} <Text color="fg.neutralSubtle" textStyle="t2Regular">/ 권장 {formatRecordTime(limitSeconds)}</Text>
              </Text>
            </VStack>
          </HStack>
        </Card>
        <VStack gap="x2">
          <HStack align="center" gap="x1_5">
            <Icon name="Timeline" color="fg.informative" size="small" />
            <Text color="fg.neutralSubtle" textStyle="t2Bold">STAR 구조로 답해 보세요</Text>
          </HStack>
          <StarGuide />
        </VStack>
        <Card bg="bg.brandWeak" borderColor="stroke.brandWeak" minHeight="x35_5" p="x3">
          <VStack gap="x2">
            <HStack align="center" gap="x1_5">
              <Icon name="Lightbulb" color="fg.brand" size="small" />
              <Text color="fg.brand" textStyle="t3Bold">답변 가이드</Text>
            </HStack>
            <Text color={question.hint ? 'fg.neutral' : 'fg.neutralSubtle'} textStyle="t3Regular">
              {question.hint ?? 'STAR 구조(상황 → 과제 → 행동 → 결과)로 차분하게 답해 보세요.'}
            </Text>
          </VStack>
        </Card>
        <RecordControls
          mode={mode}
          isLast={questionIndex === total - 1}
          onStart={onStart}
          onStop={onStop}
          onRetake={onRetake}
          onNext={onNext}
        />
      </VStack>
    </Body>
  );
}

export function FinishView({
  feedbackLabel,
  questionCount,
  totalSeconds,
  saving,
  onFeedback,
}: {
  feedbackLabel?: string;
  questionCount: number;
  totalSeconds: number;
  saving: boolean;
  onFeedback: () => void;
}) {
  return (
    <>
      <Body bottomPad="x4">
        <VStack align="center" flex={1} gap="x5" justify="center">
          <Box alignItems="center" bg="bg.brandWeak" borderRadius="full" height="x16" justifyContent="center" width="x16">
            <Icon name="CircleCheck" color="fg.brand" size="large" />
          </Box>
          <VStack align="center" gap="x1">
            <Text align="center" textStyle="t9Bold">면접을 완주했어요!</Text>
            <Text align="center" color="fg.neutralMuted" textStyle="t4Regular">
              AI가 답변·음성·전달력을 분석할게요.
            </Text>
          </VStack>
          <Grid columns={2} gap="x2" width="full">
            <StatCard label="질문" value={`${questionCount}개`} icon="CircleHelp" />
            <StatCard label="소요 시간" value={formatRecordTime(totalSeconds)} icon="Clock" />
          </Grid>
        </VStack>
      </Body>
      <BottomActionBar
        primary={{
          label: feedbackLabel ?? 'AI 피드백 받기',
          iconLeft: 'Sparkles',
          disabled: saving,
          onPress: onFeedback,
        }}
      />
    </>
  );
}

