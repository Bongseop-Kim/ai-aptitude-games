import { useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';

import { Box } from '../../../design-system/components/Box';
import { VStack } from '../../../design-system/components/Stack';
import { Text } from '../../../design-system/components/Text';
import type { GamePlayProps } from '../../../domain/games/play';
import { averageResponseMs, computeGameScore, roundScore } from '../../../domain/games/results';
import {
  MEMORY_FEEDBACK_MS,
  MEMORY_TOTAL_ROUNDS,
  createMemoryRounds,
  memoryAnswerLabel,
  memoryAnswers,
  memoryShapeIcon,
  type MemoryAnswer,
} from '../../../domain/games/memory';
import { toneColors } from '../../../domain/tone';
import { Icon } from '../../ui/Icon';
import { GameStageShell } from '../GameStageShell';
import { ResponseButton, type ResponseButtonState } from '../ResponseButton';

export function MemoryPlay({ game, onFinish, onClose }: GamePlayProps) {
  const [round, setRound] = useState(1);
  const [rounds] = useState(() => createMemoryRounds());
  const [picked, setPicked] = useState<MemoryAnswer | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const responseTimesRef = useRef<number[]>([]);
  const questionShownAtRef = useRef(Date.now());
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, []);

  const colors = toneColors[game.tone];
  const currentRound = rounds[round - 1];

  function choose(answer: MemoryAnswer) {
    if (picked) return;

    responseTimesRef.current.push(Date.now() - questionShownAtRef.current);
    const isCorrect = answer === currentRound.answer;
    const nextCorrectCount = correctCount + (isCorrect ? 1 : 0);
    setPicked(answer);
    setCorrectCount(nextCorrectCount);

    feedbackTimeoutRef.current = setTimeout(() => {
      if (round >= MEMORY_TOTAL_ROUNDS) {
        onFinish({
          gameId: game.id,
          score: computeGameScore(nextCorrectCount, MEMORY_TOTAL_ROUNDS),
          accuracy: nextCorrectCount / MEMORY_TOTAL_ROUNDS,
          avgResponseMs: averageResponseMs(responseTimesRef.current),
        });
        return;
      }

      setRound((value) => value + 1);
      setPicked(null);
      questionShownAtRef.current = Date.now();
    }, MEMORY_FEEDBACK_MS);
  }

  function buttonState(answer: MemoryAnswer): ResponseButtonState {
    if (!picked) return 'idle';
    if (answer === currentRound.answer) return 'correct';
    if (answer === picked) return 'wrong';
    return 'idle';
  }

  return (
    <GameStageShell
      gameName={game.name}
      tone={game.tone}
      round={round}
      totalRounds={MEMORY_TOTAL_ROUNDS}
      score={roundScore(correctCount, MEMORY_TOTAL_ROUNDS)}
      onClose={onClose}
      instruction={
        <Text textStyle="t3Regular">
          지금 도형이{' '}
          <Text color={colors.fg} textStyle="t3Bold">
            2번째 전 / 3번째 전
          </Text>{' '}
          도형과 같은지 판단하세요.
        </Text>
      }
      footer={
        <VStack gap="x2">
          {memoryAnswers.map((answer) => (
            <ResponseButton
              key={answer}
              label={memoryAnswerLabel[answer]}
              state={buttonState(answer)}
              disabled={picked != null}
              accessibilityState={{ disabled: picked != null }}
              onPress={() => choose(answer)}
            />
          ))}
        </VStack>
      }
    >
      <Box alignItems="center" flex={1} justifyContent="center">
        <Box height="x16" position="relative" width="x16">
          <Box
            bg="bg.layerDefault"
            borderColor="stroke.neutralWeak"
            borderRadius="r4"
            borderWidth="thin"
            height="x16"
            left="x2"
            position="absolute"
            top="x2"
            width="x16"
            style={styles.backCardFar}
          />
          <Box
            bg="bg.layerDefault"
            borderColor="stroke.neutralWeak"
            borderRadius="r4"
            borderWidth="thin"
            height="x16"
            left="x1"
            position="absolute"
            top="x1"
            width="x16"
            style={styles.backCardNear}
          />
          <Box
            alignItems="center"
            bg={colors.bg}
            borderColor="stroke.neutralWeak"
            borderRadius="r4"
            borderWidth="thin"
            boxShadow="surface"
            height="x16"
            justifyContent="center"
            position="absolute"
            width="x16"
          >
            <Icon name={memoryShapeIcon[currentRound.shape]} color={colors.fg} size="large" />
          </Box>
        </Box>
      </Box>
    </GameStageShell>
  );
}

const styles = StyleSheet.create({
  backCardFar: {
    transform: [{ rotate: '-4deg' }],
  },
  backCardNear: {
    transform: [{ rotate: '-2deg' }],
  },
});
