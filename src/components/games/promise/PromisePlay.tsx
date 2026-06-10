import { useEffect, useRef, useState } from 'react';

import { Box } from '../../../design-system/components/Box';
import { Grid } from '../../../design-system/components/Grid';
import { HStack, VStack } from '../../../design-system/components/Stack';
import { Text } from '../../../design-system/components/Text';
import type { GamePlayProps } from '../../../domain/games/play';
import {
  PROMISE_FEEDBACK_MS,
  PROMISE_TOTAL_ROUNDS,
  createPromiseSession,
} from '../../../domain/games/promise';
import { averageResponseMs, computeGameScore, roundScore } from '../../../domain/games/results';
import { toneColors } from '../../../domain/tone';
import { Card } from '../../ui/Card';
import { Icon } from '../../ui/Icon';
import { GameStageShell } from '../GameStageShell';
import { ResponseButton, type ResponseButtonState } from '../ResponseButton';

export function PromisePlay({ game, onFinish, onClose }: GamePlayProps) {
  const [questions] = useState(() => createPromiseSession());
  const [round, setRound] = useState(1);
  const [picked, setPicked] = useState<number | null>(null);
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
  const question = questions[round - 1];

  function choose(index: number) {
    if (picked != null) return;

    responseTimesRef.current.push(Date.now() - questionShownAtRef.current);
    const isCorrect = index === question.answerIndex;
    const nextCorrectCount = correctCount + (isCorrect ? 1 : 0);
    setPicked(index);
    setCorrectCount(nextCorrectCount);

    feedbackTimeoutRef.current = setTimeout(() => {
      if (round >= PROMISE_TOTAL_ROUNDS) {
        onFinish({
          gameId: game.id,
          score: computeGameScore(nextCorrectCount, PROMISE_TOTAL_ROUNDS),
          accuracy: nextCorrectCount / PROMISE_TOTAL_ROUNDS,
          avgResponseMs: averageResponseMs(responseTimesRef.current),
        });
        return;
      }
      setRound((value) => value + 1);
      setPicked(null);
      questionShownAtRef.current = Date.now();
    }, PROMISE_FEEDBACK_MS);
  }

  function buttonState(index: number): ResponseButtonState {
    if (picked == null) return 'idle';
    if (index === question.answerIndex) return 'correct';
    if (index === picked) return 'wrong';
    return 'idle';
  }

  return (
    <GameStageShell
      gameName={game.name}
      tone={game.tone}
      round={round}
      totalRounds={PROMISE_TOTAL_ROUNDS}
      score={roundScore(correctCount, PROMISE_TOTAL_ROUNDS)}
      onClose={onClose}
      instruction={<Text textStyle="t3Regular">세 친구의 단서를 종합해 약속 장소를 추론하세요.</Text>}
      footer={
        <Grid columns={2} gap="x2">
          {question.options.map((option, index) => (
            <ResponseButton
              key={option}
              label={option}
              state={buttonState(index)}
              disabled={picked != null}
              onPress={() => choose(index)}
            />
          ))}
        </Grid>
      }
    >
      <VStack flex={1} gap="x2" justify="center">
        {question.clues.map((clue) => (
          <Card key={clue.who}>
            <HStack align="flexStart" gap="x3">
              <Box
                alignItems="center"
                bg={colors.bg}
                borderRadius="r3"
                height="x10"
                justifyContent="center"
                width="x10"
              >
                <Icon name={clue.icon} color={colors.fg} />
              </Box>
              <VStack flex={1} gap="x1">
                <Text textStyle="t3Bold">{clue.who}</Text>
                <Text color="fg.neutralMuted" textStyle="t3Regular">
                  {clue.text}
                </Text>
              </VStack>
            </HStack>
          </Card>
        ))}
        <Text textStyle="t3Bold">약속 장소는 어디일까요?</Text>
      </VStack>
    </GameStageShell>
  );
}
