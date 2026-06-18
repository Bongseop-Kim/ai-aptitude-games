import { useState } from 'react';

import { Box } from '../../../design-system/components/Box';
import { Grid } from '../../../design-system/components/Grid';
import { HStack, VStack } from '../../../design-system/components/Stack';
import { Text } from '../../../design-system/components/Text';
import type { GamePlayProps } from '../../../domain/games/play';
import { averageResponseMs, computeGameScore } from '../../../domain/games/results';
import {
  RPS_FEEDBACK_MS,
  RPS_TOTAL_ROUNDS,
  createRpsQuestion,
  rpsDifficulty,
  rpsCorrectAnswer,
  rpsHandIcon,
  rpsHandLabel,
  rpsHands,
  rpsRuleLabel,
  type RpsHand,
} from '../../../domain/games/rps';
import { toneColors } from '../../../domain/tone';
import { Icon } from '../../ui/Icon';
import { GameStageShell } from '../GameStageShell';
import { ResponseButton, answerButtonState } from '../ResponseButton';
import { useRoundPlay } from '../useRoundPlay';

export function RpsPlay({ game, onFinish, onClose }: GamePlayProps) {
  const [question, setQuestion] = useState(() => createRpsQuestion());
  const { round, picked, headerScore, choose } = useRoundPlay<RpsHand>({
    totalRounds: RPS_TOTAL_ROUNDS,
    feedbackMs: RPS_FEEDBACK_MS,
    onAdvanceRound: () => {
      setQuestion(createRpsQuestion());
    },
    getDifficulty: (_answer, currentRound) => rpsDifficulty(question, currentRound),
    onComplete: ({ correctCount, responseTimes, rounds }) => {
      onFinish({
        gameId: game.id,
        score: computeGameScore(correctCount, RPS_TOTAL_ROUNDS),
        accuracy: correctCount / RPS_TOTAL_ROUNDS,
        avgResponseMs: averageResponseMs(responseTimes),
        rounds,
      });
    },
  });

  const colors = toneColors[game.tone];
  const answer = rpsCorrectAnswer(question);

  return (
    <GameStageShell
      gameName={game.name}
      tone={game.tone}
      round={round}
      totalRounds={RPS_TOTAL_ROUNDS}
      score={headerScore}
      onClose={onClose}
      instruction={
        <Text textStyle="t3Regular">
          현재 규칙: AI 손을{' '}
          <Text color={colors.fg} textStyle="t3Bold">
            {rpsRuleLabel[question.rule]}
          </Text>
        </Text>
      }
      footer={
        <Grid columns={3} gap="x2">
          {rpsHands.map((hand) => (
            <ResponseButton
              key={hand}
              label={rpsHandLabel[hand]}
              icon={rpsHandIcon[hand]}
              state={answerButtonState(picked, answer, hand)}
              disabled={picked != null}
              onPress={() => choose(hand, hand === answer)}
            />
          ))}
        </Grid>
      }
    >
      <Box alignItems="center" flex={1} justifyContent="center">
        <HStack align="center" gap="x5">
          <VStack align="center" gap="x1_5">
            <Text color="fg.neutralSubtle" textStyle="t2Regular">
              AI
            </Text>
            <Box
              alignItems="center"
              bg={colors.bg}
              borderRadius="r4"
              height="x16"
              justifyContent="center"
              width="x16"
            >
              <Icon name={rpsHandIcon[question.aiHand]} color={colors.fg} size="large" />
            </Box>
          </VStack>
          <Text color="fg.neutralSubtle" textStyle="t4Bold">
            VS
          </Text>
          <VStack align="center" gap="x1_5">
            <Text color="fg.neutralSubtle" textStyle="t2Regular">
              나
            </Text>
            <Box
              alignItems="center"
              borderColor="stroke.neutralWeak"
              borderRadius="r4"
              borderWidth="thin"
              height="x16"
              justifyContent="center"
              width="x16"
            >
              {picked ? (
                <Icon
                  name={rpsHandIcon[picked]}
                  color={picked === answer ? 'fg.positive' : 'fg.critical'}
                  size="large"
                />
              ) : (
                <Text color="fg.neutralSubtle" textStyle="t8Bold">
                  ?
                </Text>
              )}
            </Box>
          </VStack>
        </HStack>
      </Box>
    </GameStageShell>
  );
}
