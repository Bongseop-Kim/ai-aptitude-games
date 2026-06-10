import { useState } from 'react';

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
import { averageResponseMs, computeGameScore } from '../../../domain/games/results';
import { toneColors } from '../../../domain/tone';
import { Card } from '../../ui/Card';
import { Icon } from '../../ui/Icon';
import { GameStageShell } from '../GameStageShell';
import { ResponseButton, answerButtonState } from '../ResponseButton';
import { useRoundPlay } from '../useRoundPlay';

export function PromisePlay({ game, onFinish, onClose }: GamePlayProps) {
  const [questions] = useState(() => createPromiseSession());
  const { round, picked, headerScore, choose } = useRoundPlay<number>({
    totalRounds: PROMISE_TOTAL_ROUNDS,
    feedbackMs: PROMISE_FEEDBACK_MS,
    onComplete: ({ correctCount, responseTimes }) => {
      onFinish({
        gameId: game.id,
        score: computeGameScore(correctCount, PROMISE_TOTAL_ROUNDS),
        accuracy: correctCount / PROMISE_TOTAL_ROUNDS,
        avgResponseMs: averageResponseMs(responseTimes),
      });
    },
  });

  const colors = toneColors[game.tone];
  const question = questions[round - 1];

  return (
    <GameStageShell
      gameName={game.name}
      tone={game.tone}
      round={round}
      totalRounds={PROMISE_TOTAL_ROUNDS}
      score={headerScore}
      onClose={onClose}
      instruction={<Text textStyle="t3Regular">세 친구의 단서를 종합해 약속 장소를 추론하세요.</Text>}
      footer={
        <Grid columns={2} gap="x2">
          {question.options.map((option, index) => (
            <ResponseButton
              key={option}
              label={option}
              state={answerButtonState(picked, question.answerIndex, index)}
              disabled={picked != null}
              onPress={() => choose(index, index === question.answerIndex)}
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
