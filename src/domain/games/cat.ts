import { averagePointsScore, clampDifficulty, roundDifficulty } from './results';
import { pickRandom, shuffle } from './random';

export const CAT_TOTAL_ROUNDS = 6;
export const CAT_GRID_COLUMNS = 6;
export const CAT_CELL_COUNT = 36;
const CAT_MICE_COUNT = 6;
export const CAT_MEMORIZE_MS = 2600;
export const CAT_FEEDBACK_MS = 900;

export type CatQuestion = {
  mice: ReadonlySet<number>;
  catCell: number;
  found: boolean;
};

export const catConfidenceLabels: readonly string[] = [
  '매우 확실',
  '확실',
  '조금',
  '불확실',
  '불확실',
  '조금',
  '확실',
  '매우 확실',
];

function range(length: number): number[] {
  return Array.from({ length }, (_, index) => index);
}

export function createCatFoundPlan(): boolean[] {
  return shuffle([true, true, true, false, false, false]);
}

export function createCatQuestion(found: boolean): CatQuestion {
  const miceCells = shuffle(range(CAT_CELL_COUNT)).slice(0, CAT_MICE_COUNT);
  const mice = new Set(miceCells);
  const emptyCells = range(CAT_CELL_COUNT).filter((cell) => !mice.has(cell));
  const catCell = found ? pickRandom(miceCells) : pickRandom(emptyCells);

  return { mice, catCell, found };
}

export function catAnswerFromConfidence(index: number): boolean {
  return index >= 4;
}

export function catConfidenceStrength(index: number): number {
  return index >= 4 ? index - 3 : 4 - index;
}

export function catRoundPoints(ok: boolean, strength: number): number {
  return ok ? 70 + strength * 6 : 60 - strength * 6;
}

export function computeCatScore(points: readonly number[]): number {
  return averagePointsScore(points);
}

export function catDifficulty(question: CatQuestion, round: number): number {
  const missLoad = question.found ? 0 : 8;
  return clampDifficulty(42 + missLoad + roundDifficulty(round, CAT_TOTAL_ROUNDS, 0, 16));
}
