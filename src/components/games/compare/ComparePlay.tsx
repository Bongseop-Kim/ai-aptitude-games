import { useState } from 'react';
import { Pressable } from 'react-native';

import { Box } from '../../../design-system/components/Box';
import { Grid } from '../../../design-system/components/Grid';
import { Text } from '../../../design-system/components/Text';
import type { GamePlayProps } from '../../../domain/games/play';
import {
  COMPARE_FEEDBACK_MS,
  COMPARE_TOTAL_ROUNDS,
  compareCorrectAnswer,
  compareSideLabel,
  compareSides,
  createCompareQuestion,
  getCompareDotPosition,
  type CompareQuestion,
  type CompareSide,
} from '../../../domain/games/compare';
import { averageResponseMs, computeGameScore } from '../../../domain/games/results';
import { toneColors } from '../../../domain/tone';
import { GameStageShell } from '../GameStageShell';
import { ResponseButton, answerButtonState } from '../ResponseButton';
import { useRoundPlay } from '../useRoundPlay';

// Game-specific perceptual sizes: 9 has no exact dimension token and the pair
// is tuned to make the "larger dots but fewer count" distraction legible.
const SMALL_DOT_SIZE = 9;
const LARGE_DOT_SIZE = 16;

function getSideCount(question: CompareQuestion, side: CompareSide) {
  return side === 'left' ? question.left : question.right;
}

function getDotSize(question: CompareQuestion, side: CompareSide) {
  const count = getSideCount(question, side);
  const otherCount = getSideCount(question, side === 'left' ? 'right' : 'left');

  return count < otherCount ? LARGE_DOT_SIZE : SMALL_DOT_SIZE;
}

function getPanelBorderColor(answer: CompareSide, selectedSide: CompareSide | null, side: CompareSide) {
  if (!selectedSide) return 'stroke.neutralWeak';
  if (side === answer) return toneColors.positive.fg;
  if (side === selectedSide) return toneColors.critical.fg;
  return 'stroke.neutralWeak';
}

function getPanelBackground(answer: CompareSide, selectedSide: CompareSide | null, side: CompareSide) {
  if (!selectedSide) return 'bg.layerDefault';
  if (side === answer) return toneColors.positive.bg;
  if (side === selectedSide) return toneColors.critical.bg;
  return 'bg.layerDefault';
}

type ComparePanelProps = {
  disabled: boolean;
  question: CompareQuestion;
  selectedSide: CompareSide | null;
  side: CompareSide;
  onPress: () => void;
};

function ComparePanel({ disabled, question, selectedSide, side, onPress }: ComparePanelProps) {
  const answer = compareCorrectAnswer(question);
  const count = getSideCount(question, side);
  const dotSize = getDotSize(question, side);
  const isSelected = selectedSide === side;
  const borderColor = getPanelBorderColor(answer, selectedSide, side);
  const background = getPanelBackground(answer, selectedSide, side);

  return (
    <Pressable
      accessibilityLabel={`${compareSideLabel[side]} 패널`}
      accessibilityRole="button"
      accessibilityState={{ disabled, selected: isSelected }}
      disabled={disabled}
      onPress={onPress}
    >
      <Box
        bg={background}
        borderColor={borderColor}
        borderRadius="r4"
        borderWidth="thin"
        overflow="hidden"
        position="relative"
        style={{ aspectRatio: 0.75 }}
      >
        {Array.from({ length: count }).map((_, index) => {
          const position = getCompareDotPosition(index);

          return (
            <Box
              key={`dot-${count}-${position.left}-${position.top}`}
              bg="fg.neutral"
              borderRadius="full"
              position="absolute"
              style={{
                height: dotSize,
                left: position.left,
                top: position.top,
                width: dotSize,
              }}
            />
          );
        })}
      </Box>
    </Pressable>
  );
}

export function ComparePlay({ game, onFinish, onClose }: GamePlayProps) {
  const [question, setQuestion] = useState(() => createCompareQuestion());
  const { round, picked, headerScore, choose } = useRoundPlay<CompareSide>({
    totalRounds: COMPARE_TOTAL_ROUNDS,
    feedbackMs: COMPARE_FEEDBACK_MS,
    onAdvanceRound: () => {
      setQuestion(createCompareQuestion());
    },
    onComplete: ({ correctCount, responseTimes }) => {
      onFinish({
        gameId: game.id,
        score: computeGameScore(correctCount, COMPARE_TOTAL_ROUNDS),
        accuracy: correctCount / COMPARE_TOTAL_ROUNDS,
        avgResponseMs: averageResponseMs(responseTimes),
      });
    },
  });

  const colors = toneColors[game.tone];
  const answer = compareCorrectAnswer(question);

  return (
    <GameStageShell
      gameName={game.name}
      tone={game.tone}
      round={round}
      totalRounds={COMPARE_TOTAL_ROUNDS}
      score={headerScore}
      onClose={onClose}
      instruction={
        <Text textStyle="t3Regular">
          <Text color={colors.fg} textStyle="t3Bold">
            개수가 더 많은
          </Text>{' '}
          쪽을 빠르게 탭하세요. 크기에 속지 마세요.
        </Text>
      }
      footer={
        <Grid columns={2} gap="x2">
          {compareSides.map((side) => (
            <ResponseButton
              key={side}
              label={compareSideLabel[side]}
              state={answerButtonState(picked, answer, side)}
              disabled={picked != null}
              onPress={() => choose(side, side === answer)}
            />
          ))}
        </Grid>
      }
    >
      <Box flex={1} justifyContent="center">
        <Grid columns={2} gap="x2_5">
          {compareSides.map((side) => (
            <ComparePanel
              key={side}
              disabled={picked != null}
              question={question}
              selectedSide={picked}
              side={side}
              onPress={() => choose(side, side === answer)}
            />
          ))}
        </Grid>
      </Box>
    </GameStageShell>
  );
}
