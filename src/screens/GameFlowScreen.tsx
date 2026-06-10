import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';

import { Body } from '../components/app/Body';
import { Header } from '../components/app/Header';
import { Screen } from '../components/app/Screen';
import { playComponents } from '../components/games/playComponents';
import { Button } from '../components/ui/Button';
import { games } from '../data/games';
import { useSaveGameResult } from '../data/local/useGameResults';
import { VStack } from '../design-system/components/Stack';
import { Text } from '../design-system/components/Text';
import type { GameResultInput } from '../domain/games/results';
import { GameIntroScreen } from './game/GameIntroScreen';
import { GameResultScreen } from './game/GameResultScreen';

type GamePhase = 'intro' | 'play' | 'result';

export function GameFlowScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const router = useRouter();
  const [phase, setPhase] = useState<GamePhase>('intro');
  const [result, setResult] = useState<GameResultInput | null>(null);
  const saveGameResult = useSaveGameResult();

  const game = games.find((item) => item.id === id);

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
            <Button label="게임 목록으로" variant="weak" onPress={close} />
          </VStack>
        </Body>
      </Screen>
    );
  }

  const PlayComponent = playComponents[game.id];

  function handleFinish(input: GameResultInput) {
    saveGameResult.mutate(input);
    setResult(input);
    setPhase('result');
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
