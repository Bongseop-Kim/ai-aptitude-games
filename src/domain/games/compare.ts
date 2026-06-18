import { randomInt } from './random';
import { clampDifficulty, roundDifficulty } from './results';

export type CompareSide = 'left' | 'right';

export type CompareQuestion = {
  left: number;
  right: number;
};

export type CompareDotPosition = {
  left: `${number}%`;
  top: `${number}%`;
};

export const COMPARE_TOTAL_ROUNDS = 8;
export const COMPARE_FEEDBACK_MS = 450;

export const compareSides: readonly CompareSide[] = ['left', 'right'];

export const compareSideLabel: Record<CompareSide, string> = {
  left: '왼쪽',
  right: '오른쪽',
};

export function createCompareQuestion(): CompareQuestion {
  const left = randomInt(6, 15);
  let right = randomInt(6, 15);

  while (right === left) {
    right = randomInt(6, 15);
  }

  return { left, right };
}

export function compareCorrectAnswer(question: CompareQuestion): CompareSide {
  return question.left > question.right ? 'left' : 'right';
}

export function getCompareDotPosition(index: number): CompareDotPosition {
  return {
    left: `${8 + ((index * 37) % 78)}%`,
    top: `${10 + ((index * 53) % 76)}%`,
  };
}

export function compareDifficulty(question: CompareQuestion, round: number): number {
  const gap = Math.abs(question.left - question.right);
  const crowding = Math.max(question.left, question.right);
  const gapLoad = Math.max(0, 9 - gap) * 4;
  return clampDifficulty(30 + gapLoad + crowding + roundDifficulty(round, COMPARE_TOTAL_ROUNDS, 0, 12));
}
