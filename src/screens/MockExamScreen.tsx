import { useEffect, useRef } from 'react';
import { Alert, Pressable } from 'react-native';
import { useIsFocused, useRouter } from 'expo-router';

import { Body } from '../components/app/Body';
import { Header } from '../components/app/Header';
import { Screen } from '../components/app/Screen';
import { Badge } from '../components/ui/Badge';
import { ActionButton } from '../components/ui/ActionButton';
import { Card } from '../components/ui/Card';
import { Icon, type IconName } from '../components/ui/Icon';
import { List } from '../components/ui/List';
import { Skeleton } from '../components/ui/Skeleton';
import { games } from '../data/games';
import {
  MOCK_EXAM_ITEM_COUNT,
  type MockExamItemKey,
  type MockExamSessionItem,
} from '../data/local/mockExamSessions';
import {
  useAbandonMockExamSession,
  useActiveMockExamSession,
  useFinalizeMockExamSession,
  useStartMockExamSession,
} from '../data/local/useMockExamSession';
import { Box } from '../design-system/components/Box';
import { HStack, VStack } from '../design-system/components/Stack';
import { Text } from '../design-system/components/Text';

type MockExamRow = {
  key: MockExamItemKey;
  title: string;
  detail: string;
  icon: IconName;
};

const mockExamSkeletonRows = Array.from({ length: MOCK_EXAM_ITEM_COUNT }, (_, index) => `mock-exam-${index}`);
const mockExamRows: MockExamRow[] = [
  ...games.map((game) => ({
    key: game.id,
    title: game.name,
    detail: `${game.skill} · ${game.minutes}분`,
    icon: game.icon,
  })),
  {
    key: 'interview',
    title: 'AI 면접',
    detail: '직무 맞춤 실전 면접',
    icon: 'Video',
  },
];

function findCompletedItem(items: MockExamSessionItem[], itemKey: MockExamItemKey) {
  return items.find((item) => item.itemKey === itemKey) ?? null;
}

export function MockExamScreen() {
  const router = useRouter();
  const activeSession = useActiveMockExamSession();
  const startMockExamSession = useStartMockExamSession();
  const abandonMockExamSession = useAbandonMockExamSession();
  const finalizeMockExamSession = useFinalizeMockExamSession();
  const finalizeRequestedRef = useRef(false);
  const isFocused = useIsFocused();
  const session = activeSession.data ?? null;
  const completedCount = session?.items.length ?? 0;

  useEffect(() => {
    if (!isFocused || !session || completedCount < MOCK_EXAM_ITEM_COUNT || finalizeRequestedRef.current || finalizeMockExamSession.isPending) {
      return;
    }

    finalizeRequestedRef.current = true;
    void finalizeMockExamSession.mutateAsync(session.id).then((resultId) => {
      if (resultId) {
        router.replace({ pathname: '/reports/[id]', params: { id: resultId } } as never);
        return;
      }
      finalizeRequestedRef.current = false;
    }).catch(() => {
      finalizeRequestedRef.current = false;
      Alert.alert('모의고사를 완료하지 못했어요', '잠시 후 다시 시도해주세요.');
    });
  }, [completedCount, finalizeMockExamSession, isFocused, router, session]);

  function close() {
    router.back();
  }

  async function startSession() {
    try {
      await startMockExamSession.mutateAsync();
    } catch {
      Alert.alert('모의고사를 시작하지 못했어요', '잠시 후 다시 시도해주세요.');
    }
  }

  function confirmAbandon() {
    if (!session) {
      return;
    }

    Alert.alert('모의고사를 포기할까요?', '진행 상황은 삭제되고 기록은 생성되지 않아요.', [
      { text: '계속하기', style: 'cancel' },
      {
        text: '포기하기',
        style: 'destructive',
        onPress: () => {
          void abandonMockExamSession.mutateAsync(session.id).then(() => router.back()).catch(() => {
            Alert.alert('모의고사를 포기하지 못했어요', '잠시 후 다시 시도해주세요.');
          });
        },
      },
    ]);
  }

  function openItem(itemKey: MockExamItemKey) {
    if (!session) {
      return;
    }

    if (itemKey === 'interview') {
      router.push({ pathname: '/interview/new', params: { mockExamSessionId: session.id } } as never);
      return;
    }

    router.push({ pathname: '/games/[id]', params: { id: itemKey, mockExamSessionId: session.id } } as never);
  }

  if (activeSession.isLoading) {
    return (
      <Screen>
        <Header title="모의고사" showBack onBack={close}>
          <MockExamProgressStrip completedCount={0} />
        </Header>
        <Body bottomPad="x4">
          <MockExamLoadingRows />
        </Body>
      </Screen>
    );
  }

  if (!session) {
    return (
      <Screen>
        <Header title="모의고사" showBack onBack={close} />
        <Body bottomPad="x4">
          <Card bg="bg.brandWeak" borderColor="stroke.brandWeak" minHeight="x16">
            <VStack gap="x3">
              <HStack align="center" gap="x3">
                <Box alignItems="center" bg="bg.brandSolid" borderRadius="r4" height="x13" justifyContent="center" width="x13">
                  <Icon name="Trophy" color="fg.neutralInverted" size="large" />
                </Box>
                <VStack flex={1} gap="x1">
                  <Text textStyle="t6Bold">새 모의고사를 시작해요</Text>
                  <Text color="fg.neutralMuted" textStyle="t3Regular">
                    9개 게임과 AI 면접을 원하는 순서로 완료하면 종합 리포트가 열려요.
                  </Text>
                </VStack>
              </HStack>
              <ActionButton
                label="모의고사 시작"
                iconRight="ArrowRight"
                loading={startMockExamSession.isPending}
                onPress={startSession}
              />
            </VStack>
          </Card>
        </Body>
      </Screen>
    );
  }

  return (
    <Screen>
      <Header
        title="모의고사"
        showBack
        onBack={close}
        rightAction={{
          icon: 'Delete',
          label: '포기',
          disabled: abandonMockExamSession.isPending,
          onPress: confirmAbandon,
        }}
      >
        <MockExamProgressStrip completedCount={completedCount} />
      </Header>
      <Body bottomPad="x4">
        <Card bg="bg.neutralSolid" borderColor="stroke.neutralContrast" p="x4">
          <HStack align="center" gap="x3">
            <Box alignItems="center" bg="bg.brandSolid" borderRadius="full" height="x10" justifyContent="center" width="x10">
              <Text color="fg.neutralInverted" textStyle="t4Bold">
                {completedCount}
              </Text>
            </Box>
            <VStack flex={1} gap="x0_5">
              <Text color="fg.neutralInverted" textStyle="t5Bold">
                {completedCount}/{MOCK_EXAM_ITEM_COUNT} 완료
              </Text>
              <Text color="fg.neutralSubtle" textStyle="t2Regular">
                완료한 항목은 다시 응시할 수 없어요.
              </Text>
            </VStack>
            <Badge label="진행 중" tone="brand" size="small" />
          </HStack>
        </Card>
        <MockExamRows items={session.items} onOpenItem={openItem} />
      </Body>
    </Screen>
  );
}

function MockExamProgressStrip({ completedCount }: { completedCount: number }) {
  return (
    <HStack gap="x1">
      {mockExamRows.map((item, index) => (
        <Box
          key={item.key}
          bg={index < completedCount ? 'bg.brandSolid' : 'stroke.neutralWeak'}
          borderRadius="full"
          flex={1}
          height="x1"
        />
      ))}
    </HStack>
  );
}

function MockExamLoadingRows() {
  return (
    <Card py="x1">
      <List.Root>
        {mockExamSkeletonRows.map((key, index) => (
          <Box key={key}>
            {index > 0 ? <List.Divider /> : null}
            <HStack align="center" gap="x3" py="x3">
              <Skeleton borderRadius="r3" height="x11" width="x11" />
              <VStack flex={1} gap="x1">
                <Skeleton height="x4" width="x16" />
                <Skeleton height="x3" width="full" />
              </VStack>
              <Skeleton borderRadius="full" height="x5" width="x5" />
            </HStack>
          </Box>
        ))}
      </List.Root>
    </Card>
  );
}

function MockExamRows({
  items,
  onOpenItem,
}: {
  items: MockExamSessionItem[];
  onOpenItem: (itemKey: MockExamItemKey) => void;
}) {
  return (
    <Card py="x1">
      <List.Root>
        {mockExamRows.map((row, index) => {
          const completedItem = findCompletedItem(items, row.key);
          const isCompleted = completedItem != null;

          return (
            <Box key={row.key}>
              {index > 0 ? <List.Divider /> : null}
              <MockExamItemRow
                completedItem={completedItem}
                disabled={isCompleted}
                row={row}
                onPress={() => onOpenItem(row.key)}
              />
            </Box>
          );
        })}
      </List.Root>
    </Card>
  );
}

function MockExamItemRow({
  completedItem,
  disabled,
  row,
  onPress,
}: {
  completedItem: MockExamSessionItem | null;
  disabled: boolean;
  row: MockExamRow;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress}>
      <HStack align="center" gap="x3" py="x3">
        <Box alignItems="center" bg={disabled ? 'palette.green100' : 'bg.neutralWeak'} borderRadius="r3" height="x11" justifyContent="center" width="x11">
          <Icon name={disabled ? 'CircleCheck' : row.icon} color={disabled ? 'fg.positive' : 'fg.neutralMuted'} />
        </Box>
        <VStack flex={1} gap="x0_5">
          <HStack align="center" gap="x1_5">
            <Text textStyle="t4Medium" maxLines={1}>
              {row.title}
            </Text>
            {completedItem ? <Badge label={`${completedItem.score}점`} tone="positive" size="small" /> : null}
          </HStack>
          <Text color="fg.neutralMuted" textStyle="t3Regular" maxLines={1}>
            {completedItem ? '완료했어요' : row.detail}
          </Text>
        </VStack>
        <Icon name={disabled ? 'Check' : 'ChevronRight'} color={disabled ? 'fg.positive' : 'fg.neutralSubtle'} size="small" />
      </HStack>
    </Pressable>
  );
}
