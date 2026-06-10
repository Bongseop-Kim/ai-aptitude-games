import { useEffect, useRef, useState } from 'react';

import { Box } from '../../../design-system/components/Box';
import { Grid } from '../../../design-system/components/Grid';
import { VStack } from '../../../design-system/components/Stack';
import { Text } from '../../../design-system/components/Text';
import type { GamePlayProps } from '../../../domain/games/play';
import {
  POTION_FEEDBACK_MS,
  POTION_TOTAL_ROUNDS,
  createPotionQuestion,
  createPotionSession,
  potionColorLabel,
  type PotionColor,
} from '../../../domain/games/potion';
import { averageResponseMs, computeGameScore, roundScore } from '../../../domain/games/results';
import { toneColors } from '../../../domain/tone';
import { Icon } from '../../ui/Icon';
import { GameStageShell } from '../GameStageShell';
import { ResponseButton, type ResponseButtonState } from '../ResponseButton';

const potionAnswerColor = {
  blue: toneColors.informative.fg,
  red: toneColors.critical.fg,
} as const;

export function PotionPlay({ game, onFinish, onClose }: GamePlayProps) {
  const [session] = useState(() => createPotionSession());
  const [round, setRound] = useState(1);
  const [question, setQuestion] = useState(() => createPotionQuestion(session));
  const [picked, setPicked] = useState<PotionColor | null>(null);
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
  const answer = question.result;
  const isRevealed = picked != null;

  function choose(color: PotionColor) {
    if (picked) return;

    responseTimesRef.current.push(Date.now() - questionShownAtRef.current);
    const isCorrect = color === answer;
    const nextCorrectCount = correctCount + (isCorrect ? 1 : 0);
    setPicked(color);
    setCorrectCount(nextCorrectCount);

    feedbackTimeoutRef.current = setTimeout(() => {
      if (round >= POTION_TOTAL_ROUNDS) {
        onFinish({
          gameId: game.id,
          score: computeGameScore(nextCorrectCount, POTION_TOTAL_ROUNDS),
          accuracy: nextCorrectCount / POTION_TOTAL_ROUNDS,
          avgResponseMs: averageResponseMs(responseTimesRef.current),
        });
        return;
      }
      setRound((value) => value + 1);
      setQuestion(createPotionQuestion(session));
      setPicked(null);
      questionShownAtRef.current = Date.now();
    }, POTION_FEEDBACK_MS);
  }

  function buttonState(color: PotionColor): ResponseButtonState {
    if (!picked) return 'idle';
    if (color === answer) return 'correct';
    if (color === picked) return 'wrong';
    return 'idle';
  }

  return (
    <GameStageShell
      gameName={game.name}
      tone={game.tone}
      round={round}
      totalRounds={POTION_TOTAL_ROUNDS}
      score={roundScore(correctCount, POTION_TOTAL_ROUNDS)}
      onClose={onClose}
      instruction={
        <Text textStyle="t3Regular">
          네 재료의 조합으로 어떤 약이 될지 예측해요. 결과를 보며{' '}
          <Text color={colors.fg} textStyle="t3Bold">
            규칙
          </Text>
          을 찾아요.
        </Text>
      }
      footer={
        <Grid columns={2} gap="x2">
          <ResponseButton
            label={potionColorLabel.blue}
            state={buttonState('blue')}
            disabled={isRevealed}
            accessibilityState={{ disabled: isRevealed }}
            onPress={() => choose('blue')}
          />
          <ResponseButton
            label={potionColorLabel.red}
            state={buttonState('red')}
            disabled={isRevealed}
            accessibilityState={{ disabled: isRevealed }}
            onPress={() => choose('red')}
          />
        </Grid>
      }
    >
      <VStack align="center" flex={1} gap="x4" justify="center">
        <Grid columns={2} gap="x2">
          {question.ingredients.map((ingredient, index) => (
            <Box
              key={`${ingredient}-${index}`}
              alignItems="center"
              bg={colors.bg}
              borderColor={colors.border}
              borderRadius="r4"
              borderWidth="thin"
              height="x16"
              justifyContent="center"
              width="x16"
            >
              <Icon name={ingredient} color={colors.fg} size="large" />
            </Box>
          ))}
        </Grid>

        {isRevealed ? (
          <VStack align="center" gap="x1_5">
            <Icon name="flask" color={potionAnswerColor[answer]} size="large" />
            <Text color={potionAnswerColor[answer]} textStyle="t4Bold">
              {potionColorLabel[answer]} 완성
            </Text>
            <Text
              align="center"
              color={picked === answer ? 'fg.positive' : 'fg.critical'}
              textStyle="t3Bold"
            >
              {picked === answer ? '예측 성공!' : '예측 실패 — 다음 판 힌트로!'}
            </Text>
          </VStack>
        ) : null}
      </VStack>
    </GameStageShell>
  );
}
