import type { IconName } from '../../shared/types';
import { pickRandom } from './random';

export type RpsHand = 'scissors' | 'rock' | 'paper';
export type RpsRule = 'win' | 'lose' | 'draw';

export type RpsQuestion = {
  aiHand: RpsHand;
  rule: RpsRule;
};

export const RPS_TOTAL_ROUNDS = 5;
export const RPS_FEEDBACK_MS = 750;

export const rpsHands: readonly RpsHand[] = ['scissors', 'rock', 'paper'];
const rpsRules: readonly RpsRule[] = ['win', 'lose', 'draw'];

// key가 value를 이긴다
const beats: Record<RpsHand, RpsHand> = {
  rock: 'scissors',
  scissors: 'paper',
  paper: 'rock',
};

const beatenBy: Record<RpsHand, RpsHand> = {
  scissors: 'rock',
  paper: 'scissors',
  rock: 'paper',
};

export const rpsHandLabel: Record<RpsHand, string> = {
  scissors: '가위',
  rock: '바위',
  paper: '보',
};

export const rpsHandIcon: Record<RpsHand, IconName> = {
  scissors: 'scissors',
  rock: 'rock',
  paper: 'hand',
};

export const rpsRuleLabel: Record<RpsRule, string> = {
  win: '이기기',
  lose: '지기',
  draw: '비기기',
};

export function createRpsQuestion(): RpsQuestion {
  return { aiHand: pickRandom(rpsHands), rule: pickRandom(rpsRules) };
}

export function rpsCorrectAnswer({ aiHand, rule }: RpsQuestion): RpsHand {
  if (rule === 'draw') return aiHand;
  if (rule === 'win') return beatenBy[aiHand];
  return beats[aiHand];
}
