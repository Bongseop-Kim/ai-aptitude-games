import type { IconName } from '../../shared/types';
import { pickRandom, shuffle } from './random';

export type MemoryShape = 'triangle' | 'square' | 'circle' | 'pentagon';
export type MemoryAnswer = 'diff' | 'n2' | 'n3';

export type MemoryRound = {
  shape: MemoryShape;
  answer: MemoryAnswer;
};

export const MEMORY_TOTAL_ROUNDS = 6;
export const MEMORY_FEEDBACK_MS = 700;

const memoryShapes: readonly MemoryShape[] = ['triangle', 'square', 'circle', 'pentagon'];
const n2Candidates = [2, 3, 4, 5] as const;
const n3Candidates = [3, 4, 5] as const;

export const memoryShapeIcon: Record<MemoryShape, IconName> = {
  triangle: 'Triangle',
  square: 'Square',
  circle: 'Circle',
  pentagon: 'Pentagon',
};

export const memoryAnswerLabel: Record<MemoryAnswer, string> = {
  diff: '다름',
  n2: '2번째 전과 같음',
  n3: '3번째 전과 같음',
};

export const memoryAnswers: readonly MemoryAnswer[] = ['diff', 'n2', 'n3'];

function answerFor(sequence: readonly MemoryShape[], index: number): MemoryAnswer {
  const current = sequence[index];

  if (index >= 2 && sequence[index - 2] === current) return 'n2';
  if (index >= 3 && sequence[index - 3] === current) return 'n3';
  return 'diff';
}

function createAnswerTargets(): MemoryAnswer[] {
  const targets = Array<MemoryAnswer>(MEMORY_TOTAL_ROUNDS).fill('diff');
  const n3Position = pickRandom(n3Candidates);
  const n2Count = pickRandom([1, 2] as const);
  const n2Positions = shuffle(n2Candidates.filter((position) => position !== n3Position)).slice(
    0,
    n2Count,
  );

  targets[n3Position] = 'n3';
  n2Positions.forEach((position) => {
    targets[position] = 'n2';
  });

  return targets;
}

function candidatesForTarget(
  sequence: readonly (MemoryShape | undefined)[],
  index: number,
  target: MemoryAnswer,
): MemoryShape[] {
  return shuffle(
    memoryShapes.filter((shape) => {
      if (target === 'n2') return index >= 2 && shape === sequence[index - 2];
      if (target === 'n3') {
        return index >= 3 && shape === sequence[index - 3] && shape !== sequence[index - 2];
      }
      return shape !== sequence[index - 2] && shape !== sequence[index - 3];
    }),
  );
}

function buildSequence(targets: readonly MemoryAnswer[]): MemoryShape[] | null {
  const sequence: (MemoryShape | undefined)[] = Array(MEMORY_TOTAL_ROUNDS);

  function fill(index: number): boolean {
    if (index >= MEMORY_TOTAL_ROUNDS) return true;

    for (const shape of candidatesForTarget(sequence, index, targets[index])) {
      sequence[index] = shape;
      if (fill(index + 1)) return true;
      sequence[index] = undefined;
    }

    return false;
  }

  return fill(0) ? (sequence as MemoryShape[]) : null;
}

function isValidRoundSet(rounds: readonly MemoryRound[]): boolean {
  const n2Count = rounds.filter((round) => round.answer === 'n2').length;
  const n3Count = rounds.filter((round) => round.answer === 'n3').length;

  return n2Count >= 1 && n2Count <= 2 && n3Count === 1;
}

export function createMemoryRounds(): MemoryRound[] {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const targets = createAnswerTargets();
    const sequence = buildSequence(targets);
    if (!sequence) continue;

    const rounds = sequence.map((shape, index) => ({
      shape,
      answer: answerFor(sequence, index),
    }));

    if (rounds.length === targets.length && rounds.every((round, index) => round.answer === targets[index]) && isValidRoundSet(rounds)) {
      return rounds;
    }
  }

  return [
    { shape: 'triangle', answer: 'diff' },
    { shape: 'square', answer: 'diff' },
    { shape: 'triangle', answer: 'n2' },
    { shape: 'circle', answer: 'diff' },
    { shape: 'square', answer: 'n3' },
    { shape: 'pentagon', answer: 'diff' },
  ];
}
