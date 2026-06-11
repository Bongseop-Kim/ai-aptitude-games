import { useEffect, useRef, useState } from 'react';
import { Pressable } from 'react-native';

import { Box } from '../../../design-system/components/Box';
import { Grid } from '../../../design-system/components/Grid';
import { VStack } from '../../../design-system/components/Stack';
import { Text } from '../../../design-system/components/Text';
import type { GamePlayProps } from '../../../domain/games/play';
import {
  PATH_FEEDBACK_MS,
  PATH_TOTAL_ROUNDS,
  createPathSession,
  isPathSeparated,
  type PathCellType,
  type PathPuzzle,
} from '../../../domain/games/path';
import { averageResponseMs, computeGameScore, roundScore } from '../../../domain/games/results';
import { toneColors } from '../../../domain/tone';
import type { ColorToken } from '../../../design-system/components/style-props';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { Icon } from '../../ui/Icon';
import { GameStageShell } from '../GameStageShell';

type FeedbackState = 'correct' | 'wrong' | null;

function feedbackBorder(feedback: FeedbackState) {
  if (feedback === 'correct') return toneColors.positive.fg;
  if (feedback === 'wrong') return toneColors.critical.fg;
  return 'stroke.neutralSubtle';
}

function cellLabel(cell: PathCellType, fenced: boolean) {
  if (fenced) return '울타리';
  if (cell === 'person') return '사람';
  if (cell === 'car') return '자동차';
  if (cell === 'wall') return '고정 장애물';
  return '빈 칸';
}

type PathCellProps = {
  cell: PathCellType;
  disabled: boolean;
  fenced: boolean;
  tone: GamePlayProps['game']['tone'];
  onPress: () => void;
};

function PathCell({ cell, disabled, fenced, tone, onPress }: PathCellProps) {
  const colors = toneColors[tone];
  const isInteractive = cell === 'empty' && !disabled;
  const background = cell === 'wall' ? 'bg.disabled' : fenced ? colors.bg : 'bg.layerDefault';
  const borderColor = fenced ? colors.fg : 'stroke.neutralWeak';
  const iconColor: ColorToken = fenced || cell === 'person' ? colors.fg : 'fg.neutralMuted';

  return (
    <Pressable
      accessibilityLabel={cellLabel(cell, fenced)}
      accessibilityRole="button"
      accessibilityState={{ disabled: !isInteractive, selected: fenced }}
      disabled={!isInteractive}
      onPress={onPress}
    >
      <Box
        alignItems="center"
        bg={background}
        borderColor={borderColor}
        borderRadius="r3"
        borderWidth="thin"
        justifyContent="center"
        style={{ aspectRatio: 1 }}
      >
        {fenced ? <Icon name="Fence" color={iconColor} size="small" /> : null}
        {!fenced && cell === 'person' ? <Icon name="Footprints" color={iconColor} size="small" /> : null}
        {!fenced && cell === 'car' ? <Icon name="Car" color={iconColor} size="small" /> : null}
      </Box>
    </Pressable>
  );
}

type PathBoardProps = {
  disabled: boolean;
  fences: ReadonlySet<number>;
  puzzle: PathPuzzle;
  tone: GamePlayProps['game']['tone'];
  onToggleFence: (index: number) => void;
};

function PathBoard({ disabled, fences, puzzle, tone, onToggleFence }: PathBoardProps) {
  return (
    <Grid columns={puzzle.cols} gap="x1">
      {puzzle.cells.map((cell, index) => (
        <PathCell
          key={`${cell}-${index}`}
          cell={cell}
          disabled={disabled}
          fenced={fences.has(index)}
          tone={tone}
          onPress={() => onToggleFence(index)}
        />
      ))}
    </Grid>
  );
}

export function PathPlay({ game, onFinish, onClose }: GamePlayProps) {
  const [round, setRound] = useState(1);
  const [puzzles] = useState(() => createPathSession());
  const [fences, setFences] = useState<Set<number>>(() => new Set());
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const responseTimesRef = useRef<number[]>([]);
  const questionShownAtRef = useRef<number | null>(null);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    questionShownAtRef.current = Date.now();
  }, []);

  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, []);

  const puzzle = puzzles[round - 1];
  const isSubmitted = feedback != null;
  const displayedScore = roundScore(correctCount, PATH_TOTAL_ROUNDS);

  function toggleFence(index: number) {
    if (isSubmitted || puzzle.cells[index] !== 'empty') return;

    setFences((currentFences) => {
      const nextFences = new Set(currentFences);

      if (nextFences.has(index)) {
        nextFences.delete(index);
        return nextFences;
      }

      if (nextFences.size >= puzzle.fenceLimit) return currentFences;

      nextFences.add(index);
      return nextFences;
    });
  }

  function submit() {
    if (isSubmitted) return;

    const answeredAt = Date.now();

    responseTimesRef.current.push(answeredAt - (questionShownAtRef.current ?? answeredAt));
    const isCorrect = isPathSeparated(puzzle, fences);
    const nextCorrectCount = correctCount + (isCorrect ? 1 : 0);

    setFeedback(isCorrect ? 'correct' : 'wrong');
    setCorrectCount(nextCorrectCount);

    feedbackTimeoutRef.current = setTimeout(() => {
      if (round >= PATH_TOTAL_ROUNDS) {
        onFinish({
          gameId: game.id,
          score: computeGameScore(nextCorrectCount, PATH_TOTAL_ROUNDS),
          accuracy: nextCorrectCount / PATH_TOTAL_ROUNDS,
          avgResponseMs: averageResponseMs(responseTimesRef.current),
        });
        return;
      }

      setRound((value) => value + 1);
      setFences(new Set());
      setFeedback(null);
      questionShownAtRef.current = Date.now();
    }, PATH_FEEDBACK_MS);
  }

  return (
    <GameStageShell
      gameName={game.name}
      tone={game.tone}
      round={round}
      totalRounds={PATH_TOTAL_ROUNDS}
      score={displayedScore}
      onClose={onClose}
      instruction={
        <Text textStyle="t3Regular">울타리를 놓아 사람과 자동차의 길을 분리하세요.</Text>
      }
      footer={
        <Button
          label={`제출 (${fences.size}/${puzzle.fenceLimit})`}
          fullWidth
          disabled={fences.size === 0 || isSubmitted}
          onPress={submit}
        />
      }
    >
      <VStack flex={1} gap="x3" justify="center">
        <Card borderColor={feedbackBorder(feedback)} overflow="hidden" p="x2">
          <PathBoard
            disabled={isSubmitted}
            fences={fences}
            puzzle={puzzle}
            tone={game.tone}
            onToggleFence={toggleFence}
          />
        </Card>
      </VStack>
    </GameStageShell>
  );
}
