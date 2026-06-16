import { useEffect, useRef, useState } from 'react';
import { Pressable } from 'react-native';

import { Box } from '../../../design-system/components/Box';
import { Grid } from '../../../design-system/components/Grid';
import { HStack, VStack } from '../../../design-system/components/Stack';
import { Text } from '../../../design-system/components/Text';
import type { ColorToken } from '../../../design-system/components/style-props';
import {
  CAT_CELL_COUNT,
  CAT_FEEDBACK_MS,
  CAT_GRID_COLUMNS,
  CAT_MEMORIZE_MS,
  CAT_TOTAL_ROUNDS,
  catAnswerFromConfidence,
  catConfidenceLabels,
  catConfidenceStrength,
  catRoundPoints,
  computeCatScore,
  createCatFoundPlan,
  createCatQuestion,
  type CatQuestion,
} from '../../../domain/games/cat';
import type { GamePlayProps } from '../../../domain/games/play';
import { averageResponseMs } from '../../../domain/games/results';
import { toneColors } from '../../../domain/tone';
import { Icon } from '../../ui/Icon';
import { GameStageShell } from '../GameStageShell';
import { useRoundPlay } from '../useRoundPlay';

type CatPhase = 'memorize' | 'judge' | 'feedback';
type AnswerTone = 'critical' | 'positive';

const catCells = Array.from({ length: CAT_CELL_COUNT }, (_, cell) => cell);
const confidenceButtonOptions = [
  { id: 'missed-very-sure', index: 0 },
  { id: 'missed-sure', index: 1 },
  { id: 'missed-somewhat', index: 2 },
  { id: 'missed-unsure', index: 3 },
  { id: 'found-unsure', index: 4 },
  { id: 'found-somewhat', index: 5 },
  { id: 'found-sure', index: 6 },
  { id: 'found-very-sure', index: 7 },
] as const;

function answerTone(index: number): AnswerTone {
  return catAnswerFromConfidence(index) ? 'positive' : 'critical';
}

function confidenceA11yLabel(index: number): string {
  const answer = catAnswerFromConfidence(index) ? '찾았다' : '놓쳤다';
  return `${answer}, ${catConfidenceLabels[index]}`;
}

type CatCellProps = {
  cell: number;
  phase: CatPhase;
  question: CatQuestion;
};

function CatCell({ cell, phase, question }: CatCellProps) {
  const showsMouse = phase !== 'judge' && question.mice.has(cell);
  const showsCat = phase !== 'memorize' && question.catCell === cell;
  const borderColor = showsCat ? toneColors.critical.fg : 'stroke.neutralWeak';
  const background = showsCat ? toneColors.critical.bg : showsMouse ? 'bg.layerFloating' : 'bg.layerDefault';

  return (
    <Box
      alignItems="center"
      bg={background}
      borderColor={borderColor}
      borderRadius="r2"
      borderWidth="thin"
      justifyContent="center"
      style={{ aspectRatio: 1 }}
    >
      {showsMouse ? <Icon name="Rat" color="fg.neutralSubtle" size="small" /> : null}
      {showsCat ? <Icon name="PawPrint" color={toneColors.critical.fg} size="small" /> : null}
    </Box>
  );
}

type ConfidenceButtonProps = {
  disabled: boolean;
  index: number;
  selected: boolean;
  onPress: () => void;
};

function ConfidenceButton({ disabled, index, selected, onPress }: ConfidenceButtonProps) {
  const tone = answerTone(index);
  const toneColor = toneColors[tone];
  const foreground: ColorToken = selected ? toneColor.fg : 'fg.neutralSubtle';
  const borderColor: ColorToken = selected ? toneColor.fg : 'stroke.neutralWeak';
  const background: ColorToken = selected ? toneColor.bg : 'bg.layerDefault';

  return (
    <Pressable
      accessibilityLabel={confidenceA11yLabel(index)}
      accessibilityRole="button"
      accessibilityState={{ disabled, selected }}
      disabled={disabled}
      onPress={onPress}
    >
      <VStack align="center" gap="x1">
        <Box
          alignItems="center"
          bg={background}
          borderColor={borderColor}
          borderRadius="full"
          borderWidth="thin"
          height="x8"
          justifyContent="center"
          width="x8"
        >
          <Text color={foreground} textStyle="t2Bold">
            {catConfidenceStrength(index)}
          </Text>
        </Box>
        <Text align="center" color={foreground} maxLines={1} textStyle="t1Bold">
          {catConfidenceLabels[index]}
        </Text>
      </VStack>
    </Pressable>
  );
}

type ConfidenceFooterProps = {
  disabled: boolean;
  picked: number | null;
  onChoose: (index: number) => void;
};

function ConfidenceFooter({ disabled, picked, onChoose }: ConfidenceFooterProps) {
  return (
    <VStack gap="x2">
      <HStack align="center" justify="spaceBetween">
        <Text color={toneColors.critical.fg} textStyle="t2Bold">
          ← 놓쳤다
        </Text>
        <Text color={toneColors.positive.fg} textStyle="t2Bold">
          찾았다 →
        </Text>
      </HStack>
      <Grid columns={8} gap="x1">
        {confidenceButtonOptions.map(({ id, index }) => (
          <ConfidenceButton
            key={id}
            disabled={disabled}
            index={index}
            selected={picked === index}
            onPress={() => onChoose(index)}
          />
        ))}
      </Grid>
    </VStack>
  );
}

function createQuestionForRound(plan: readonly boolean[], round: number) {
  return createCatQuestion(plan[round - 1]);
}

export function CatPlay({ game, onFinish, onClose }: GamePlayProps) {
  const [foundPlan] = useState(() => createCatFoundPlan());
  const [phase, setPhase] = useState<CatPhase>('memorize');
  const [question, setQuestion] = useState(() => createQuestionForRound(foundPlan, 1));
  const [displayedScore, setDisplayedScore] = useState(0);
  const pointsRef = useRef<number[]>([]);
  const { round, picked, choose: chooseRound, markQuestionShown } = useRoundPlay<number>({
    totalRounds: CAT_TOTAL_ROUNDS,
    feedbackMs: CAT_FEEDBACK_MS,
    onAdvanceRound: (nextRound) => {
      setQuestion(createQuestionForRound(foundPlan, nextRound));
      setPhase('memorize');
    },
    onComplete: ({ correctCount, responseTimes, rounds }) => {
      onFinish({
        gameId: game.id,
        score: computeCatScore(pointsRef.current),
        accuracy: correctCount / CAT_TOTAL_ROUNDS,
        avgResponseMs: averageResponseMs(responseTimes),
        rounds,
      });
    },
  });

  useEffect(() => {
    if (phase !== 'memorize') return undefined;

    const memorizeTimeout = setTimeout(() => {
      markQuestionShown();
      setPhase('judge');
    }, CAT_MEMORIZE_MS);

    return () => clearTimeout(memorizeTimeout);
  }, [markQuestionShown, phase, question]);

  const instruction =
    phase === 'memorize' ? '생쥐들이 숨습니다 — 위치를 외우세요' : '이 칸의 고양이는 생쥐를 찾았을까요?';

  function choose(index: number) {
    if (picked != null || phase !== 'judge') return;

    const guessedFound = catAnswerFromConfidence(index);
    const isCorrect = guessedFound === question.found;
    const strength = catConfidenceStrength(index);

    pointsRef.current.push(catRoundPoints(isCorrect, strength));
    setDisplayedScore(computeCatScore(pointsRef.current));
    setPhase('feedback');
    chooseRound(index, isCorrect);
  }

  return (
    <GameStageShell
      gameName={game.name}
      tone={game.tone}
      round={round}
      totalRounds={CAT_TOTAL_ROUNDS}
      score={displayedScore}
      onClose={onClose}
      instruction={<Text textStyle="t3Bold">{instruction}</Text>}
      footer={
        phase === 'memorize' ? null : (
          <ConfidenceFooter disabled={phase !== 'judge'} picked={picked} onChoose={choose} />
        )
      }
    >
      <Box alignItems="center" flex={1} justifyContent="center">
        <Box width="full">
          <Grid columns={CAT_GRID_COLUMNS} gap="x1">
            {catCells.map((cell) => (
              <CatCell key={cell} cell={cell} phase={phase} question={question} />
            ))}
          </Grid>
        </Box>
      </Box>
    </GameStageShell>
  );
}
