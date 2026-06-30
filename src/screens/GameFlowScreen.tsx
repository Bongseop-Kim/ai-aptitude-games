import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';

import { Body } from '../components/app/Body';
import { Header } from '../components/app/Header';
import { Screen } from '../components/app/Screen';
import { playComponents } from '../components/games/playComponents';
import { ActionButton } from '../components/ui/ActionButton';
import { Card } from '../components/ui/Card';
import { games } from '../data/games';
import {
  useActiveMockExamSession,
  useCompleteMockExamGameItem,
} from '../data/local/useMockExamSession';
import { useBestScores, useSaveGameResult } from '../data/local/useGameResults';
import { VStack } from '../design-system/components/Stack';
import { Text } from '../design-system/components/Text';
import type { GameResultInput } from '../domain/games/results';
import { GameIntroScreen } from './game/GameIntroScreen';
import { GameResultScreen } from './game/GameResultScreen';

type GamePhase = 'intro' | 'play' | 'result';

export function GameFlowScreen() {
  const { id, mockExamSessionId } = useLocalSearchParams<{ id: string; mockExamSessionId?: string }>();
  const navigation = useNavigation();
  const router = useRouter();
  const [phase, setPhase] = useState<GamePhase>('intro');
  const [result, setResult] = useState<GameResultInput | null>(null);
  const [bestBeforePlay, setBestBeforePlay] = useState<number | null | undefined>(undefined);
  const [playStartedAt, setPlayStartedAt] = useState(() => Date.now());
  const bestScores = useBestScores();
  const saveGameResult = useSaveGameResult();
  const mockExamSession = useActiveMockExamSession();
  const completeMockExamGameItem = useCompleteMockExamGameItem();

  const game = games.find((item) => item.id === id);
  const sessionId = typeof mockExamSessionId === 'string' ? mockExamSessionId : null;
  const isMockExamMode = sessionId != null;
  const completedMockExamItem = game
    ? mockExamSession.data?.items.some((item) => item.itemKey === game.id) ?? false
    : false;

  useEffect(() => {
    if (phase !== 'play') {
      return undefined;
    }

    return navigation.addListener('beforeRemove', (event) => {
      event.preventDefault();
      Alert.alert('게임을 그만둘까요?', '진행 중인 기록은 저장되지 않아요.', [
        { text: '계속하기', style: 'cancel' },
        {
          text: '그만두기',
          style: 'destructive',
          onPress: () => navigation.dispatch(event.data.action),
        },
      ]);
    });
  }, [navigation, phase]);

  function close() {
    router.back();
  }

  if (!game) {
    return (
      <Screen>
        <Header title="게임" showBack onBack={close} />
        <Body>
          <VStack align="center" flex={1} gap="x3" justify="center">
            <Text color="fg.neutralMuted" textStyle="t4Regular">
              준비 중인 게임이에요.
            </Text>
            <ActionButton label="게임 목록으로" variant="neutralWeak" onPress={close} />
          </VStack>
        </Body>
      </Screen>
    );
  }

  const PlayComponent = playComponents[game.id];

  async function handleFinish(input: GameResultInput) {
    if (isMockExamMode) {
      try {
        await completeMockExamGameItem.mutateAsync({
          durationMs: Math.max(1000, Date.now() - playStartedAt),
          input,
          sessionId,
        });
        setResult(input);
        setPhase('result');
      } catch {
        Alert.alert('게임 결과를 저장하지 못했어요', '잠시 후 다시 시도해주세요.');
      }
      return;
    }

    saveGameResult.mutate(input);
    setResult(input);
    setPhase('result');
  }

  function startPlay() {
    setPlayStartedAt(Date.now());
    setBestBeforePlay(bestScores.isLoading || !game ? undefined : bestScores.data?.[game.id] ?? null);
    setPhase('play');
  }

  if (isMockExamMode && mockExamSession.isLoading) {
    return (
      <MockExamNotice
        title="모의고사 상태를 확인하고 있어요"
        description="잠시만 기다려주세요."
        onBack={close}
      />
    );
  }

  if (isMockExamMode && !mockExamSession.data) {
    return (
      <MockExamNotice
        title="진행 중인 모의고사를 찾지 못했어요"
        description="모의고사 화면에서 다시 시작해주세요."
        onBack={close}
        showAction
      />
    );
  }

  if (isMockExamMode && completedMockExamItem && phase !== 'result') {
    return (
      <MockExamNotice
        title="이미 완료한 게임이에요"
        description="모의고사에서는 완료한 항목을 다시 볼 수 없어요."
        onBack={close}
        showAction
      />
    );
  }

  if (phase === 'play') {
    const GamePlay = PlayComponent;
    return <GamePlay game={game} onFinish={handleFinish} onClose={close} />;
  }

  if (phase === 'result' && result) {
    return (
      <GameResultScreen
        game={game}
        result={result}
        bestBeforePlay={bestBeforePlay}
        onRetry={isMockExamMode ? undefined : () => {
          setResult(null);
          startPlay();
        }}
        onExit={close}
        exitLabel={isMockExamMode ? '모의고사로 돌아가기' : undefined}
      />
    );
  }

  return <GameIntroScreen game={game} onStart={startPlay} onClose={close} />;
}

function MockExamNotice({
  title,
  description,
  onBack,
  showAction = false,
}: {
  title: string;
  description: string;
  onBack: () => void;
  showAction?: boolean;
}) {
  return (
    <Screen>
      <Header title="모의고사" showBack onBack={onBack} />
      <Body>
        <VStack flex={1} justify="center">
          <Card minHeight="x16">
            <VStack align="center" gap="x3">
              <Text align="center" textStyle="t5Bold">
                {title}
              </Text>
              <Text align="center" color="fg.neutralMuted" textStyle="t3Regular">
                {description}
              </Text>
              {showAction ? <ActionButton label="모의고사로 돌아가기" variant="neutralWeak" onPress={onBack} /> : null}
            </VStack>
          </Card>
        </VStack>
      </Body>
    </Screen>
  );
}
