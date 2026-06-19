import { ScrollView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Header } from '../components/app/Header';
import { Screen } from '../components/app/Screen';
import { SubSectionHead } from '../components/app/SubSectionHead';
import { QuestionFeedbackDetails } from '../components/interview/QuestionFeedbackAccordion';
import { Badge } from '../components/ui/Badge';
import { ActionButton } from '../components/ui/ActionButton';
import { Card } from '../components/ui/Card';
import { Icon } from '../components/ui/Icon';
import { Skeleton } from '../components/ui/Skeleton';
import { QUESTION_CATEGORY_TONE } from '../data/interviewFlow';
import { useInterviewAnswers } from '../data/local/useInterviewAnswers';
import { useInterviewSessionForMockExam } from '../data/local/useInterviewSessions';
import { useMockExamRecord } from '../data/local/useMockExamResults';
import type { InterviewAnswerRow } from '../data/local/interviewAnswers';
import { retryInterviewMediaUpload } from '../data/media/interviewMediaUpload';
import { useMockExamReport } from '../data/server/useMockExamReport';
import { supabase } from '../lib/supabase';
import { Box } from '../design-system/components/Box';
import { HStack, VStack } from '../design-system/components/Stack';
import { Text } from '../design-system/components/Text';
import { useDesignSystemTheme } from '../design-system/provider';
import type { ReportInterviewQuestion } from '../domain/report';
import { useAuth } from '../providers/AuthProvider';

const MEDIA_BUCKET = 'interview-media';
const SIGNED_URL_SECONDS = 30 * 60;
const VIDEO_HEIGHT_TOKEN = 'x60';

function isVideoPath(path: string | null | undefined) {
  const normalized = path?.split('?')[0]?.toLowerCase() ?? '';
  return normalized.endsWith('.mp4') || normalized.endsWith('.mov') || normalized.endsWith('.m4v');
}

function formatAnswerTime(durationMs: number | null | undefined) {
  if (durationMs == null) {
    return null;
  }
  const seconds = Math.max(1, Math.round(durationMs / 1000));
  if (seconds < 60) {
    return `${seconds}초`;
  }
  return `${Math.floor(seconds / 60)}분 ${seconds % 60}초`;
}

function useAnswerVideoUri(answer: InterviewAnswerRow | null) {
  return useQuery({
    queryKey: ['interview-answer-video', answer?.id, answer?.mediaLocalUri, answer?.mediaPath],
    queryFn: async () => {
      if (answer == null) {
        return null;
      }
      if (isVideoPath(answer.mediaLocalUri)) {
        return answer.mediaLocalUri;
      }
      if (!isVideoPath(answer.mediaPath) || answer.mediaPath == null) {
        return null;
      }
      const { data, error } = await supabase.storage
        .from(MEDIA_BUCKET)
        .createSignedUrl(answer.mediaPath, SIGNED_URL_SECONDS);
      if (error) {
        throw error;
      }
      return data.signedUrl;
    },
    enabled: answer != null,
    retry: 1,
  });
}

export function ReportInterviewQuestionScreen() {
  const router = useRouter();
  const db = useSQLiteContext();
  const insets = useSafeAreaInsets();
  const { userId } = useAuth();
  const { id, questionId } = useLocalSearchParams<{ id: string; questionId: string }>();
  const mockExamId = typeof id === 'string' ? id : null;
  const targetQuestionId = typeof questionId === 'string' ? questionId : null;
  const { data: record, isLoading: recordLoading } = useMockExamRecord(mockExamId);
  const { data: reportRow, isLoading: reportLoading } = useMockExamReport(
    mockExamId,
    record?.createdAt ?? null,
  );
  const { data: session, isLoading: sessionLoading } = useInterviewSessionForMockExam(mockExamId);
  const {
    data: answers = [],
    isLoading: answersLoading,
    isFetching: answersFetching,
  } = useInterviewAnswers(session?.id ?? null);

  const questions = reportRow?.report?.interview?.questions ?? [];
  const questionIndex = questions.findIndex((item) => item.question_id === targetQuestionId);
  const question = questionIndex >= 0 ? questions[questionIndex] : null;
  const answer = answers.find((item) => item.questionId === targetQuestionId) ?? null;
  const loading = recordLoading || reportLoading || sessionLoading || answersLoading || answersFetching;
  const bottomInset = insets.bottom;

  function retryUpload() {
    if (userId && answer) {
      void retryInterviewMediaUpload(db, userId, answer.id);
    }
  }

  return (
    <Screen contentPb="x0" safeEdges={['top', 'left', 'right']}>
      <Header
        title="질문 상세"
        subtitle={record ? `모의고사 · ${record.round}회차` : '답변 다시보기'}
        showBack
        onBack={() => router.back()}
      />
      <Box flex={1} bleedX="spacingX.globalGutter">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          contentInset={{ bottom: bottomInset }}
          scrollIndicatorInsets={{ bottom: bottomInset }}
          showsVerticalScrollIndicator={false}
        >
          <Box px="spacingX.globalGutter" pt="x3" pb="spacingY.screenBottom">
            {loading && !question ? <QuestionDetailSkeleton /> : null}
            {!loading && !question ? <MissingQuestion onBack={() => router.back()} /> : null}
            {question ? (
              <QuestionDetailBody
                answer={answer}
                index={questionIndex}
                question={question}
                onRetryUpload={retryUpload}
              />
            ) : null}
          </Box>
        </ScrollView>
      </Box>
    </Screen>
  );
}

function QuestionDetailBody({
  answer,
  index,
  question,
  onRetryUpload,
}: {
  answer: InterviewAnswerRow | null;
  index: number;
  question: ReportInterviewQuestion;
  onRetryUpload: () => void;
}) {
  const answerText = answer?.answerText ?? question.transcript;
  const answerTime = formatAnswerTime(answer?.answerMs);

  return (
    <VStack gap="x4">
      <VStack gap="x2">
        <SubSectionHead title="질문" />
        <Card>
          <VStack gap="x2">
            <HStack align="center" gap="x2">
              <Text color="fg.neutralSubtle" textStyle="t3Bold">
                Q{index + 1}
              </Text>
              <Badge
                label={question.category}
                size="small"
                tone={QUESTION_CATEGORY_TONE[question.category] ?? 'neutral'}
              />
              {answerTime ? (
                <Text color="fg.neutralMuted" textStyle="t2Regular">
                  답변 {answerTime}
                </Text>
              ) : null}
            </HStack>
            <Text textStyle="t4Bold">{question.text}</Text>
          </VStack>
        </Card>
      </VStack>

      <VStack gap="x2">
        <SubSectionHead title="내 답변" />
        <Card minHeight="x16">
          <Text color={answerText ? 'fg.neutral' : 'fg.neutralMuted'} textStyle="t3Regular">
            {answerText ?? '답변 텍스트가 아직 없어요.'}
          </Text>
        </Card>
      </VStack>

      <VStack gap="x2">
        <SubSectionHead title="답변 영상" />
        <AnswerVideoCard answer={answer} onRetryUpload={onRetryUpload} />
      </VStack>

      <VStack gap="x2">
        <SubSectionHead title="피드백" />
        <Card>
          <QuestionFeedbackDetails question={question} />
        </Card>
      </VStack>
    </VStack>
  );
}

function AnswerVideoCard({
  answer,
  onRetryUpload,
}: {
  answer: InterviewAnswerRow | null;
  onRetryUpload: () => void;
}) {
  const { data: uri = null, isError, isLoading } = useAnswerVideoUri(answer);

  if (isLoading) {
    return <Skeleton borderRadius="r4" height={VIDEO_HEIGHT_TOKEN} width="full" />;
  }

  if (uri) {
    return (
      <Card overflow="hidden" p="x0">
        <AnswerVideoPlayer uri={uri} />
      </Card>
    );
  }

  return (
    <Card minHeight={VIDEO_HEIGHT_TOKEN}>
      <VStack align="center" flex={1} gap="x2" justify="center">
        <Icon name="Video" color="fg.neutralSubtle" />
        <Text align="center" color="fg.neutralMuted" textStyle="t3Regular">
          {isError ? '답변 영상을 불러오지 못했어요.' : '다시 볼 답변 영상이 없어요.'}
        </Text>
        {answer?.mediaStatus === 'failed' ? (
          <ActionButton label="업로드 다시 시도" size="small" variant="neutralWeak" onPress={onRetryUpload} />
        ) : null}
      </VStack>
    </Card>
  );
}

function AnswerVideoPlayer({ uri }: { uri: string }) {
  const { theme } = useDesignSystemTheme();
  const player = useVideoPlayer(uri, (instance) => {
    instance.loop = false;
  });
  const height = theme.dimension.x[VIDEO_HEIGHT_TOKEN];

  return <VideoView player={player} nativeControls style={{ width: '100%', height }} />;
}

function QuestionDetailSkeleton() {
  return (
    <VStack gap="x4">
      <Skeleton borderRadius="r4" height="x16" width="full" />
      <Skeleton borderRadius="r4" height="x16" width="full" />
      <Skeleton borderRadius="r4" height={VIDEO_HEIGHT_TOKEN} width="full" />
    </VStack>
  );
}

function MissingQuestion({ onBack }: { onBack: () => void }) {
  return (
    <Card>
      <VStack align="center" gap="x2">
        <Text align="center" textStyle="t5Bold">
          질문을 찾지 못했어요
        </Text>
        <Text align="center" color="fg.neutralMuted" textStyle="t3Regular">
          종합 리포트에서 다시 열어주세요.
        </Text>
        <ActionButton label="리포트로 돌아가기" variant="neutralWeak" onPress={onBack} />
      </VStack>
    </Card>
  );
}
