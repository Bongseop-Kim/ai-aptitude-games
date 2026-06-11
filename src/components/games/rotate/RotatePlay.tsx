import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable } from 'react-native';

import { Box } from '../../../design-system/components/Box';
import { Grid } from '../../../design-system/components/Grid';
import { HStack, VStack } from '../../../design-system/components/Stack';
import { Text } from '../../../design-system/components/Text';
import type { GamePlayProps } from '../../../domain/games/play';
import { averageResponseMs } from '../../../domain/games/results';
import {
  ROTATE_CLICK_LIMIT,
  ROTATE_FEEDBACK_MS,
  ROTATE_TOTAL_ROUNDS,
  applyRotateOp,
  canonicalize,
  computeRotateScore,
  createRotateTarget,
  initialRotateState,
  minClicksFor,
  rotateOps,
  rotateRoundScore,
  statesMatch,
  type CanonicalRotateState,
  type RotateOp,
  type RotateOpId,
  type RotateState,
} from '../../../domain/games/rotate';
import { toneColors } from '../../../domain/tone';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { Icon } from '../../ui/Icon';
import { Tag } from '../../ui/Tag';
import { GameStageShell } from '../GameStageShell';

type FeedbackState = 'correct' | 'wrong' | null;

const rotateOpById = Object.fromEntries(
  rotateOps.map((op) => [op.id, op]),
) as Record<RotateOpId, RotateOp>;

function buildState(sequence: readonly RotateOpId[]): RotateState {
  return sequence.reduce((state, opId) => applyRotateOp(state, opId), initialRotateState);
}

function feedbackBorder(feedback: FeedbackState) {
  if (feedback === 'correct') return toneColors.positive.fg;
  if (feedback === 'wrong') return toneColors.critical.fg;
  return 'stroke.neutralSubtle';
}

type ShapeGlyphProps = {
  state: RotateState | CanonicalRotateState;
  size?: 'medium' | 'large';
};

function ShapeGlyph({ state, size = 'medium' }: ShapeGlyphProps) {
  const canonical = 'mirrored' in state ? state : canonicalize(state);
  const fontSize = size === 'large' ? 56 : 48;
  const lineHeight = size === 'large' ? 64 : 56;

  return (
    <Text
      align="center"
      color="fg.neutral"
      style={{
        fontFamily: 'Georgia',
        fontSize,
        fontWeight: '800',
        lineHeight,
        transform: [
          { rotate: `${canonical.rotation}deg` },
          { scaleX: canonical.mirrored ? -1 : 1 },
          { scaleY: 1 },
        ],
      }}
    >
      R
    </Text>
  );
}

type OpButtonProps = {
  op: RotateOp;
  disabled: boolean;
  tone: GamePlayProps['game']['tone'];
  onPress: () => void;
};

function OpButton({ op, disabled, tone, onPress }: OpButtonProps) {
  const colors = toneColors[tone];
  const contentColor = disabled ? 'fg.disabled' : colors.fg;

  return (
    <Pressable
      accessibilityLabel={op.label}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
    >
      <VStack
        align="center"
        bg={disabled ? 'bg.disabled' : 'bg.layerDefault'}
        borderColor={disabled ? 'stroke.neutralWeak' : colors.fg}
        borderRadius="r3"
        borderWidth="thin"
        gap="x1"
        px="x1"
        py="x2"
      >
        <Box style={op.iconRotation ? { transform: [{ rotate: `${op.iconRotation}deg` }] } : undefined}>
          <Icon name={op.icon} color={contentColor} size="small" />
        </Box>
        <Text align="center" color={disabled ? 'fg.disabled' : 'fg.neutral'} textStyle="t2Bold" maxLines={2}>
          {op.label}
        </Text>
      </VStack>
    </Pressable>
  );
}

export function RotatePlay({ game, onFinish, onClose }: GamePlayProps) {
  const [round, setRound] = useState(1);
  const [target, setTarget] = useState(() => createRotateTarget());
  const [sequence, setSequence] = useState<RotateOpId[]>([]);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [roundScores, setRoundScores] = useState<number[]>([]);
  const responseTimesRef = useRef<number[]>([]);
  const questionShownAtRef = useRef(0);
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

  const colors = toneColors[game.tone];
  const currentState = useMemo(() => buildState(sequence), [sequence]);
  const minClicks = useMemo(() => minClicksFor(target), [target]);
  const remainingClicks = ROTATE_CLICK_LIMIT - sequence.length;
  const displayedScore = roundScores.length > 0 ? computeRotateScore(roundScores) : 0;
  const isSubmitted = feedback != null;

  function addOp(opId: RotateOpId) {
    if (isSubmitted || sequence.length >= ROTATE_CLICK_LIMIT) return;
    setSequence((items) => [...items, opId]);
  }

  function resetSequence() {
    if (isSubmitted) return;
    setSequence([]);
  }

  function submit() {
    if (isSubmitted) return;

    responseTimesRef.current.push(Date.now() - questionShownAtRef.current);
    const isCorrect = statesMatch(currentState, target);
    const nextCorrectCount = correctCount + (isCorrect ? 1 : 0);
    const nextRoundScores = [...roundScores, rotateRoundScore(isCorrect, sequence.length, minClicks)];

    setFeedback(isCorrect ? 'correct' : 'wrong');
    setCorrectCount(nextCorrectCount);
    setRoundScores(nextRoundScores);

    feedbackTimeoutRef.current = setTimeout(() => {
      if (round >= ROTATE_TOTAL_ROUNDS) {
        onFinish({
          gameId: game.id,
          score: computeRotateScore(nextRoundScores),
          accuracy: nextCorrectCount / ROTATE_TOTAL_ROUNDS,
          avgResponseMs: averageResponseMs(responseTimesRef.current),
        });
        return;
      }

      setRound((value) => value + 1);
      setTarget(createRotateTarget());
      setSequence([]);
      setFeedback(null);
      questionShownAtRef.current = Date.now();
    }, ROTATE_FEEDBACK_MS);
  }

  return (
    <GameStageShell
      gameName={game.name}
      tone={game.tone}
      round={round}
      totalRounds={ROTATE_TOTAL_ROUNDS}
      score={displayedScore}
      onClose={onClose}
      instruction={
        <Text textStyle="t3Regular">왼쪽(전) 도형을 오른쪽(후) 모양으로 만들어 보세요.</Text>
      }
      footer={<Button label="답안 제출" fullWidth disabled={isSubmitted} onPress={submit} />}
    >
      <VStack flex={1} gap="x3" justify="center">
        <Card overflow="hidden" p={0}>
          <Grid columns={2}>
            <VStack align="center" gap="x1_5" p="x4" borderRightWidth="thin" borderColor="stroke.neutralWeak">
              <ShapeGlyph state={initialRotateState} />
              <Text color="fg.neutralSubtle" textStyle="t2Regular">
                전
              </Text>
            </VStack>
            <VStack align="center" bg={colors.bg} gap="x1_5" p="x4">
              <ShapeGlyph state={target} />
              <Text color={colors.fg} textStyle="t2Bold">
                후
              </Text>
            </VStack>
          </Grid>
        </Card>

        <VStack align="center" gap="x2">
          <Text color="fg.neutralSubtle" textStyle="t3Regular">
            내 도형 (남은 클릭 {remainingClicks})
          </Text>
          <Card
            alignItems="center"
            borderColor={feedbackBorder(feedback)}
            justifyContent="center"
            p="x3"
            width="full"
          >
            <ShapeGlyph state={currentState} size="large" />
          </Card>
        </VStack>

        <Grid columns={4} gap="x1_5">
          {rotateOps.map((op) => (
            <OpButton
              key={op.id}
              op={op}
              tone={game.tone}
              disabled={isSubmitted || sequence.length >= ROTATE_CLICK_LIMIT}
              onPress={() => addOp(op.id)}
            />
          ))}
        </Grid>

        <HStack align="center" flexWrap="wrap" gap="x1_5">
          {sequence.length === 0 ? (
            <Text color="fg.neutralSubtle" textStyle="t3Regular">
              변환 버튼을 눌러 순서를 쌓아요
            </Text>
          ) : (
            sequence.map((opId, index) => {
              const op = rotateOpById[opId];
              return <Tag key={`${opId}-${index}`} label={`${index + 1}. ${op.label}`} />;
            })
          )}
          {sequence.length > 0 ? (
            <Button
              label="초기화"
              variant="ghost"
              size="small"
              disabled={isSubmitted}
              onPress={resetSequence}
            />
          ) : null}
        </HStack>
      </VStack>
    </GameStageShell>
  );
}
