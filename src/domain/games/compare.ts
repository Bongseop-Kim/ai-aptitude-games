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
  const left = 6 + Math.floor(Math.random() * 10);
  let right = 6 + Math.floor(Math.random() * 10);

  if (left === right) {
    right = right === 15 ? 14 : right + 1;
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
