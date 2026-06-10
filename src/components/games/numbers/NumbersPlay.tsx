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
  numbersTargetSequence,
} from '../../../domain/games/numbers';
import { averageResponseMs, computeGameScore, roundScore } from '../../../domain/games/results';
import { toneColors } from '../../../domain/tone';
import { Icon, type IconName } from '../../ui/Icon';
import { GameStageShell } from '../GameStageShell';

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
  const [round, setRound] = useState(1);
  const [question, setQuestion] = useState(() => createNumbersQuestion(1));
  const [phase, setPhase] = useState<NumbersPhase>('memorize');
  const [input, setInput] = useState<number[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const responseTimesRef = useRef<number[]>([]);
  const recallStartedAtRef = useRef(Date.now());
  const memorizeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    memorizeTimeoutRef.current = setTimeout(() => {
      recallStartedAtRef.current = Date.now();
      setPhase('recall');
    }, question.sequence.length * NUMBERS_MEMORIZE_MS_PER_DIGIT);

    return () => {
      if (memorizeTimeoutRef.current) {
        clearTimeout(memorizeTimeoutRef.current);
      }
    };
  }, [question]);

  useEffect(() => {
    return () => {
      if (memorizeTimeoutRef.current) {
        clearTimeout(memorizeTimeoutRef.current);
      }
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, []);

  const colors = toneColors[game.tone];
  const target = numbersTargetSequence(question.sequence);
  const isRecall = phase === 'recall';
  const isFeedback = phase === 'feedback';
  const isInputComplete = input.length === target.length;
  const isInputCorrect = input.every((digit, index) => digit === target[index]);
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
    if (!isRecall || !isInputComplete) return;

    responseTimesRef.current.push(Date.now() - recallStartedAtRef.current);
    const nextCorrectCount = correctCount + (isInputCorrect ? 1 : 0);

    setPhase('feedback');
    setCorrectCount(nextCorrectCount);

    feedbackTimeoutRef.current = setTimeout(() => {
      if (round >= NUMBERS_TOTAL_ROUNDS) {
        const times = responseTimesRef.current;
        onFinish({
          gameId: game.id,
          score: computeGameScore(nextCorrectCount, NUMBERS_TOTAL_ROUNDS),
          accuracy: nextCorrectCount / NUMBERS_TOTAL_ROUNDS,
          avgResponseMs: averageResponseMs(times),
        });
        return;
      }

      const nextRound = round + 1;
      setRound(nextRound);
      setQuestion(createNumbersQuestion(nextRound));
      setInput([]);
      setPhase('memorize');
    }, NUMBERS_FEEDBACK_MS);
  }

  return (
    <GameStageShell
      gameName={game.name}
      tone={game.tone}
      round={round}
      totalRounds={NUMBERS_TOTAL_ROUNDS}
      score={roundScore(correctCount, NUMBERS_TOTAL_ROUNDS)}
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
            icon="backspace"
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
            icon="check"
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
              key={`${digit}-${index}`}
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
          {target.map((_, index) => (
            <Box
              key={index}
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
