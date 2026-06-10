import { useEffect, useState, type ComponentType } from 'react';
import { Alert } from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';

import { Body } from '../components/app/Body';
import { Header } from '../components/app/Header';
import { Screen } from '../components/app/Screen';
import { CatPlay } from '../components/games/cat/CatPlay';
import { ComparePlay } from '../components/games/compare/ComparePlay';
import { MemoryPlay } from '../components/games/memory/MemoryPlay';
import { NumbersPlay } from '../components/games/numbers/NumbersPlay';
import { PathPlay } from '../components/games/path/PathPlay';
import { PromisePlay } from '../components/games/promise/PromisePlay';
import { PotionPlay } from '../components/games/potion/PotionPlay';
import { RotatePlay } from '../components/games/rotate/RotatePlay';
import { RpsPlay } from '../components/games/rps/RpsPlay';
import { Button } from '../components/ui/Button';
import { games } from '../data/games';
import { useSaveGameResult } from '../data/local/useGameResults';
import { VStack } from '../design-system/components/Stack';
import { Text } from '../design-system/components/Text';
import type { GamePlayProps } from '../domain/games/play';
import type { GameResultInput } from '../domain/games/results';
import type { GameId } from '../domain/types';
import { GameIntroScreen } from './game/GameIntroScreen';
import { GameResultScreen } from './game/GameResultScreen';

const playComponents: Partial<Record<GameId, ComponentType<GamePlayProps>>> = {
  cat: CatPlay,
  rps: RpsPlay,
  rotate: RotatePlay,
  promise: PromisePlay,
  potion: PotionPlay,
  path: PathPlay,
  compare: ComparePlay,
  memory: MemoryPlay,
  numbers: NumbersPlay,
};

export const playableGameIds: ReadonlySet<GameId> = new Set(Object.keys(playComponents) as GameId[]);

type GamePhase = 'intro' | 'play' | 'result';

export function GameFlowScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const router = useRouter();
  const [phase, setPhase] = useState<GamePhase>('intro');
  const [result, setResult] = useState<GameResultInput | null>(null);
  const saveGameResult = useSaveGameResult();

  const game = games.find((item) => item.id === id);
  const PlayComponent = game ? playComponents[game.id] : undefined;

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

  if (!game || !PlayComponent) {
    return (
      <Screen>
        <Header title="게임" showBack onBack={close} />
        <Body>
          <VStack align="center" flex={1} gap="x3" justify="center">
            <Text color="fg.neutralMuted" textStyle="t4Regular">
              준비 중인 게임이에요.
            </Text>
            <Button label="게임 목록으로" variant="weak" onPress={close} />
          </VStack>
        </Body>
      </Screen>
    );
  }

  function handleFinish(input: GameResultInput) {
    saveGameResult.mutate(input);
    setResult(input);
    setPhase('result');
  }

  if (phase === 'play') {
    return <PlayComponent game={game} onFinish={handleFinish} onClose={close} />;
  }

  if (phase === 'result' && result) {
    return (
      <GameResultScreen
        game={game}
        result={result}
        onRetry={() => {
          setResult(null);
          setPhase('play');
        }}
        onExit={close}
      />
    );
  }

  return <GameIntroScreen game={game} onStart={() => setPhase('play')} onClose={close} />;
}
