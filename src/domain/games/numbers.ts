export type NumbersQuestion = {
  sequence: number[];
};

export const NUMBERS_TOTAL_ROUNDS = 4;
export const NUMBERS_FEEDBACK_MS = 750;
export const NUMBERS_MEMORIZE_MS_PER_DIGIT = 800;

export function numbersSequenceLength(round: number): number {
  return Math.min(7, Math.max(4, round + 3));
}

function randomDigit(except?: number): number {
  let digit = Math.floor(Math.random() * 10);

  while (digit === except) {
    digit = Math.floor(Math.random() * 10);
  }

  return digit;
}

export function createNumbersQuestion(round: number): NumbersQuestion {
  const length = numbersSequenceLength(round);
  const sequence: number[] = [];

  for (let index = 0; index < length; index += 1) {
    sequence.push(randomDigit(sequence[index - 1]));
  }

  return { sequence };
}

export function numbersTargetSequence(sequence: readonly number[]): number[] {
  return [...sequence].reverse();
}
