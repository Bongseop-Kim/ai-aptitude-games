import type { IconName } from '../../shared/types';
import { pickRandom } from './random';
import { clampDifficulty, roundDifficulty } from './results';

export type PotionColor = 'red' | 'blue';

export type PotionSession = {
  keyIngredient: IconName;
};

export type PotionQuestion = {
  ingredients: IconName[];
  result: PotionColor;
};

export const POTION_TOTAL_ROUNDS = 5;
export const POTION_FEEDBACK_MS = 850;

export const potionIngredients: readonly IconName[] = [
  'Leaf',
  'Flower',
  'Wheat',
  'Droplet',
  'Flower2',
  'Trees',
];

export const potionColorLabel: Record<PotionColor, string> = {
  blue: '파란약',
  red: '빨간약',
};

export function createPotionSession(): PotionSession {
  return { keyIngredient: pickRandom(potionIngredients) };
}

export function createPotionQuestion(session: PotionSession): PotionQuestion {
  const ingredients = Array.from({ length: 4 }, () => pickRandom(potionIngredients));
  const result = ingredients.includes(session.keyIngredient) ? 'red' : 'blue';

  return { ingredients, result };
}

export function potionDifficulty(question: PotionQuestion, round: number): number {
  const uniqueIngredientCount = new Set(question.ingredients).size;
  const resultLoad = question.result === 'red' ? 6 : 0;
  return clampDifficulty(34 + uniqueIngredientCount * 5 + resultLoad + roundDifficulty(round, POTION_TOTAL_ROUNDS, 0, 18));
}
