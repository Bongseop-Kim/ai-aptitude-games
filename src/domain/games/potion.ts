import type { IconName } from '../../shared/types';
import { pickRandom } from './random';

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
  'eco',
  'spa',
  'grass',
  'water-drop',
  'local-florist',
  'park',
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
