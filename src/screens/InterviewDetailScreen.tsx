import { Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

import { BottomActionBar } from '../components/app/BottomActionBar';
import { Header } from '../components/app/Header';
import { Screen } from '../components/app/Screen';
import { FeedbackReportBody } from '../components/interview/FeedbackReportBody';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { useInterviewAnswers } from '../data/local/useInterviewAnswers';
import { useInterviewSession } from '../data/local/useInterviewSessions';
import { retryInterviewMediaUpload } from '../data/media/interviewMediaUpload';
import { Box } from '../design-system/components/Box';
import { useDesignSystemTheme } from '../design-system/provider';
import { VStack } from '../design-system/components/Stack';
import { Text } from '../design-system/components/Text';
import { useAuth } from '../providers/AuthProvider';

function showShareNotice() {
  Alert.alert('공유 준비 중', '피드백 카드는 다음 업데이트에서 저장할 수 있어요.');
}

export function InterviewDetailScreen() {
  const router = useRouter();
  const db = useSQLiteContext();
  const { userId } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const recordId = typeof id === 'string' ? id : null;
  const { data: session, isLoading } = useInterviewSession(recordId);
  const { data: answers = [] } = useInterviewAnswers(session?.id ?? null);
  const canUseActions = !isLoading && Boolean(session);
  const { theme } = useDesignSystemTheme();

  function retryUpload(answerId: string) {
    if (userId) {
      void retryInterviewMediaUpload(db, userId, answerId);
    }
  }

  return (
    <Screen>
      <Header
        title="AI 피드백"
        subtitle={session ? `${session.company} · ${session.round}회차` : '실전 면접 리포트'}
        showBack
        onBack={() => router.back()}
        rightAction={canUseActions ? {
          icon: 'Share',
          label: '공유',
          onPress: showShareNotice,
        } : undefined}
      />
      <Box flex={1} bleedX="spacingX.globalGutter">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: theme.dimension.spacingX.globalGutter }}
          showsVerticalScrollIndicator={false}
        >
          <Box px="spacingX.globalGutter" py="x3">
            {isLoading ? <InterviewDetailSkeleton /> : null}
            {!isLoading && !session ? <MissingInterviewSession onBack={() => router.back()} /> : null}
            {!isLoading && session ? (
              // Standalone training interviews have no AI analysis in P1 —
              // the body stays in its measured stage (interview = null).
              <FeedbackReportBody
                session={session}
                answers={answers}
                interview={null}
                uploads={{ retry: retryUpload }}
              />
            ) : null}
          </Box>
        </ScrollView>
      </Box>
      {canUseActions ? (
        <BottomActionBar
          primary={{
            label: '공유',
            iconLeft: 'Share',
            onPress: showShareNotice,
          }}
        />
      ) : null}
    </Screen>
  );
}

function InterviewDetailSkeleton() {
  return (
    <VStack gap="x4">
      <Skeleton borderRadius="r4" height="x16" width="full" />
      <Skeleton borderRadius="r4" height="x16" width="full" />
    </VStack>
  );
}

function MissingInterviewSession({ onBack }: { onBack: () => void }) {
  return (
    <Card>
      <VStack align="center" gap="x2">
        <Text align="center" textStyle="t5Bold">
          면접 기록을 찾지 못했어요
        </Text>
        <Text align="center" color="fg.neutralMuted" textStyle="t3Regular">
          지난 면접 목록에서 다시 열어주세요.
        </Text>
        <Button label="목록으로 돌아가기" variant="weak" onPress={onBack} />
      </VStack>
    </Card>
  );
}
