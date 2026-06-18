import { useEffect, useRef, useState } from 'react';
import { Pressable, type PressableProps } from 'react-native';

import { Box } from '../../../design-system/components/Box';
import { Grid } from '../../../design-system/components/Grid';
import { HStack, VStack } from '../../../design-system/components/Stack';
import { Text } from '../../../design-system/components/Text';
import type { ColorToken } from '../../../design-system/components/style-props';
import type { GamePlayProps } from '../../../domain/games/play';
import {
  NUMBERS_FEEDBACK_MS,
  NUMBERS_MEMORIZE_MS_PER_DIGIT,
  NUMBERS_TOTAL_ROUNDS,
  createNumbersQuestion,
  numbersDifficulty,
  numbersSequenceLength,
  numbersTargetSequence,
} from '../../../domain/games/numbers';
import { averageResponseMs, computeGameScore } from '../../../domain/games/results';
import { toneColors } from '../../../domain/tone';
import { Icon, type IconName } from '../../ui/Icon';
import { GameStageShell } from '../GameStageShell';
import { useRoundPlay } from '../useRoundPlay';

type NumbersPhase = 'memorize' | 'recall' | 'feedback';

type KeypadKeyProps = Omit<PressableProps, 'children'> & {
  icon?: IconName;
  label: string;
};

const keypadDigits = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

function inputBorderColor({
  colors,
  feedbackColor,
  isFeedback,
  value,
}: {
  colors: (typeof toneColors)[keyof typeof toneColors];
  feedbackColor: ColorToken;
  isFeedback: boolean;
  value: number | undefined;
}): ColorToken {
  if (isFeedback) return feedbackColor;
  if (value === undefined) return 'stroke.neutralWeak';
  return colors.fg;
}

function KeypadKey({ icon, label, disabled, ...props }: KeypadKeyProps) {
  const isDisabled = disabled === true;
  const contentColor: ColorToken = isDisabled ? 'fg.neutralSubtle' : 'fg.neutral';

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      {...props}
    >
      <Box
        alignItems="center"
        bg={isDisabled ? 'bg.disabled' : 'bg.layerDefault'}
        borderColor="stroke.neutralWeak"
        borderRadius="r3"
        borderWidth="thin"
        height="x12"
        justifyContent="center"
      >
        {icon ? (
          <Icon name={icon} color={contentColor} />
        ) : (
          <Text color={contentColor} textStyle="t5Bold">
            {label}
          </Text>
        )}
      </Box>
    </Pressable>
  );
}

export function NumbersPlay({ game, onFinish, onClose }: GamePlayProps) {
  const [question, setQuestion] = useState(() => createNumbersQuestion(1));
  const [phase, setPhase] = useState<NumbersPhase>('memorize');
  const [input, setInput] = useState<number[]>([]);
  const previousRoundRef = useRef(1);
  const { round, picked, headerScore, choose, markQuestionShown } = useRoundPlay<number[]>({
    totalRounds: NUMBERS_TOTAL_ROUNDS,
    feedbackMs: NUMBERS_FEEDBACK_MS,
    getDifficulty: (_answer, currentRound) => numbersDifficulty(currentRound),
    getLevelParams: (_answer, currentRound) => ({ digits: numbersSequenceLength(currentRound) }),
    onComplete: ({ correctCount, responseTimes, rounds }) => {
      onFinish({
        gameId: game.id,
        score: computeGameScore(correctCount, NUMBERS_TOTAL_ROUNDS),
        accuracy: correctCount / NUMBERS_TOTAL_ROUNDS,
        avgResponseMs: averageResponseMs(responseTimes),
        rounds,
      });
    },
  });

  useEffect(() => {
    const memorizeTimeout = setTimeout(() => {
      markQuestionShown();
      setPhase('recall');
    }, question.sequence.length * NUMBERS_MEMORIZE_MS_PER_DIGIT);

    return () => clearTimeout(memorizeTimeout);
  }, [markQuestionShown, question]);

  useEffect(() => {
    if (round === previousRoundRef.current) {
      return;
    }

    previousRoundRef.current = round;
    setQuestion(createNumbersQuestion(round));
    setInput([]);
    setPhase('memorize');
  }, [round]);

  const colors = toneColors[game.tone];
  const target = numbersTargetSequence(question.sequence);
  const isRecall = phase === 'recall';
  const isFeedback = phase === 'feedback';
  const isInputComplete = input.length === target.length;
  const isInputCorrect = isInputComplete && input.every((digit, index) => digit === target[index]);
  const inputFeedbackColor = isInputCorrect ? toneColors.positive.fg : toneColors.critical.fg;

  function addDigit(digit: number) {
    if (!isRecall || input.length >= target.length) return;
    setInput((value) => [...value, digit]);
  }

  function removeDigit() {
    if (!isRecall) return;
    setInput((value) => value.slice(0, -1));
  }

  function submit() {
    if (!isRecall || !isInputComplete || picked != null) return;

    setPhase('feedback');
    choose(input, isInputCorrect);
  }

  return (
    <GameStageShell
      gameName={game.name}
      tone={game.tone}
      round={round}
      totalRounds={NUMBERS_TOTAL_ROUNDS}
      score={headerScore}
      onClose={onClose}
      instruction={<Text textStyle="t3Regular">숫자가 사라지면 순서를 거꾸로 입력하세요.</Text>}
      footer={
        <Grid columns={3} gap="x2">
          {keypadDigits.map((digit) => (
            <KeypadKey
              key={digit}
              label={String(digit)}
              disabled={!isRecall || input.length >= target.length}
              onPress={() => addDigit(digit)}
            />
          ))}
          <KeypadKey
            label="지우기"
            icon="Delete"
            disabled={!isRecall || input.length === 0}
            onPress={removeDigit}
          />
          <KeypadKey
            label="0"
            disabled={!isRecall || input.length >= target.length}
            onPress={() => addDigit(0)}
          />
          <KeypadKey
            label="제출"
            icon="Check"
            disabled={!isRecall || !isInputComplete}
            onPress={submit}
          />
        </Grid>
      }
    >
      <VStack flex={1} gap="x5" justify="center">
        <HStack align="center" gap="x1" justify="center">
          {question.sequence.map((digit, index) => (
            <Box
              key={`memory-digit-${index + 1}-${digit}`}
              alignItems="center"
              bg={colors.bg}
              borderRadius="r3"
              height="x12"
              justifyContent="center"
              width="x10"
            >
              <Text color={colors.fg} textStyle="t6Bold">
                {phase === 'memorize' ? digit : '?'}
              </Text>
            </Box>
          ))}
        </HStack>
        <HStack align="center" gap="x1" justify="center">
          {target.map((digit, index) => (
            <Box
              key={`recall-slot-${index + 1}-${digit}`}
              alignItems="center"
              bg="bg.layerDefault"
              borderColor={inputBorderColor({
                colors,
                feedbackColor: inputFeedbackColor,
                isFeedback,
                value: input[index],
              })}
              borderRadius="r3"
              borderWidth="thin"
              height="x12"
              justifyContent="center"
              width="x10"
            >
              <Text color={isFeedback ? inputFeedbackColor : 'fg.neutral'} textStyle="t5Bold">
                {input[index] ?? ''}
              </Text>
            </Box>
          ))}
        </HStack>
      </VStack>
    </GameStageShell>
  );
}
