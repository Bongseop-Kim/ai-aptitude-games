import { useEffect, useRef, useState } from 'react';

import { Box } from '../../../design-system/components/Box';
import { Grid } from '../../../design-system/components/Grid';
import { HStack, VStack } from '../../../design-system/components/Stack';
import { Text } from '../../../design-system/components/Text';
import type { GamePlayProps } from '../../../domain/games/play';
import { averageResponseMs, computeGameScore, roundScore } from '../../../domain/games/results';
import {
  RPS_FEEDBACK_MS,
  RPS_TOTAL_ROUNDS,
  createRpsQuestion,
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
import { ResponseButton, type ResponseButtonState } from '../ResponseButton';

export function RpsPlay({ game, onFinish, onClose }: GamePlayProps) {
  const [round, setRound] = useState(1);
  const [question, setQuestion] = useState(() => createRpsQuestion());
  const [picked, setPicked] = useState<RpsHand | null>(null);
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
  const answer = rpsCorrectAnswer(question);

  function choose(hand: RpsHand) {
    if (picked) return;

    responseTimesRef.current.push(Date.now() - questionShownAtRef.current);
    const isCorrect = hand === answer;
    const nextCorrectCount = correctCount + (isCorrect ? 1 : 0);
    setPicked(hand);
    setCorrectCount(nextCorrectCount);

    feedbackTimeoutRef.current = setTimeout(() => {
      if (round >= RPS_TOTAL_ROUNDS) {
        onFinish({
          gameId: game.id,
          score: computeGameScore(nextCorrectCount, RPS_TOTAL_ROUNDS),
          accuracy: nextCorrectCount / RPS_TOTAL_ROUNDS,
          avgResponseMs: averageResponseMs(responseTimesRef.current),
        });
        return;
      }
      setRound((value) => value + 1);
      setQuestion(createRpsQuestion());
      setPicked(null);
      questionShownAtRef.current = Date.now();
    }, RPS_FEEDBACK_MS);
  }

  function buttonState(hand: RpsHand): ResponseButtonState {
    if (!picked) return 'idle';
    if (hand === answer) return 'correct';
    if (hand === picked) return 'wrong';
    return 'idle';
  }

  return (
    <GameStageShell
      gameName={game.name}
      tone={game.tone}
      round={round}
      totalRounds={RPS_TOTAL_ROUNDS}
      score={roundScore(correctCount, RPS_TOTAL_ROUNDS)}
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
              state={buttonState(hand)}
              disabled={picked != null}
              onPress={() => choose(hand)}
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
