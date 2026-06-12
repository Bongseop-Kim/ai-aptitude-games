import { Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { BottomActionBar } from '../components/app/BottomActionBar';
import { Header } from '../components/app/Header';
import { Screen } from '../components/app/Screen';
import { FeedbackReportBody } from '../components/interview/FeedbackReportBody';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { useInterviewSession } from '../data/local/useInterviewSessions';
import { Box } from '../design-system/components/Box';
import { VStack } from '../design-system/components/Stack';
import { Text } from '../design-system/components/Text';

function showShareNotice() {
  Alert.alert('공유 준비 중', '피드백 카드는 다음 업데이트에서 저장할 수 있어요.');
}

export function InterviewDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const recordId = typeof id === 'string' ? id : null;
  const { data: session, isLoading } = useInterviewSession(recordId);
  const canUseActions = !isLoading && Boolean(session);

  function goRetry() {
    router.push({ pathname: '/interview/new', params: { mode: 'retry' } } as never);
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
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 16 }} showsVerticalScrollIndicator={false}>
          <Box px="spacingX.globalGutter" py="x3">
            {isLoading ? <InterviewDetailSkeleton /> : null}
            {!isLoading && !session ? <MissingInterviewSession onBack={() => router.back()} /> : null}
            {!isLoading && session ? (
              <FeedbackReportBody session={session} />
            ) : null}
          </Box>
        </ScrollView>
      </Box>
      {canUseActions ? (
        <BottomActionBar
          secondary={{
            label: '공유',
            iconLeft: 'Share',
            onPress: showShareNotice,
          }}
          primary={{
            label: '약점 재도전',
            iconRight: 'RotateCcw',
            onPress: goRetry,
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
