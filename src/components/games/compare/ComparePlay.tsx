import { useEffect, useRef, useState } from 'react';
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
import { averageResponseMs, computeGameScore, roundScore } from '../../../domain/games/results';
import { toneColors } from '../../../domain/tone';
import { GameStageShell } from '../GameStageShell';
import { ResponseButton, type ResponseButtonState } from '../ResponseButton';

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

function getPanelBorderColor(question: CompareQuestion, selectedSide: CompareSide | null, side: CompareSide) {
  if (!selectedSide) return 'stroke.neutralWeak';
  if (side === compareCorrectAnswer(question)) return toneColors.positive.fg;
  if (side === selectedSide) return toneColors.critical.fg;
  return 'stroke.neutralWeak';
}

function getPanelBackground(question: CompareQuestion, selectedSide: CompareSide | null, side: CompareSide) {
  if (!selectedSide) return 'bg.layerDefault';
  if (side === compareCorrectAnswer(question)) return toneColors.positive.bg;
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
  const borderColor = getPanelBorderColor(question, selectedSide, side);
  const background = getPanelBackground(question, selectedSide, side);

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
              key={index}
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
  const [round, setRound] = useState(1);
  const [question, setQuestion] = useState(() => createCompareQuestion());
  const [picked, setPicked] = useState<CompareSide | null>(null);
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
  const answer = compareCorrectAnswer(question);

  function choose(side: CompareSide) {
    if (picked) return;

    responseTimesRef.current.push(Date.now() - questionShownAtRef.current);
    const isCorrect = side === answer;
    const nextCorrectCount = correctCount + (isCorrect ? 1 : 0);
    setPicked(side);
    setCorrectCount(nextCorrectCount);

    feedbackTimeoutRef.current = setTimeout(() => {
      if (round >= COMPARE_TOTAL_ROUNDS) {
        onFinish({
          gameId: game.id,
          score: computeGameScore(nextCorrectCount, COMPARE_TOTAL_ROUNDS),
          accuracy: nextCorrectCount / COMPARE_TOTAL_ROUNDS,
          avgResponseMs: averageResponseMs(responseTimesRef.current),
        });
        return;
      }
      setRound((value) => value + 1);
      setQuestion(createCompareQuestion());
      setPicked(null);
      questionShownAtRef.current = Date.now();
    }, COMPARE_FEEDBACK_MS);
  }

  function buttonState(side: CompareSide): ResponseButtonState {
    if (!picked) return 'idle';
    if (side === answer) return 'correct';
    if (side === picked) return 'wrong';
    return 'idle';
  }

  return (
    <GameStageShell
      gameName={game.name}
      tone={game.tone}
      round={round}
      totalRounds={COMPARE_TOTAL_ROUNDS}
      score={roundScore(correctCount, COMPARE_TOTAL_ROUNDS)}
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
              state={buttonState(side)}
              disabled={picked != null}
              onPress={() => choose(side)}
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
              onPress={() => choose(side)}
            />
          ))}
        </Grid>
      </Box>
    </GameStageShell>
  );
}
