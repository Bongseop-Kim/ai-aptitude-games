import type { GameId } from '../types';
import { clamp } from './random';

export type GameRoundResult = {
  roundIndex: number;
  correct: boolean;
  responseMs: number;
  levelParams?: Record<string, number | boolean> | null;
};

export type GameResultInput = {
  gameId: GameId;
  score: number;
  accuracy: number;
  avgResponseMs: number;
  rounds: GameRoundResult[];
};

export type GameGrade = 'A' | 'A-' | 'B+' | 'B' | 'C';

export function computeGameScore(correct: number, total: number): number {
  return clamp(Math.round(45 + 55 * (correct / total)), 20, 100);
}

export function roundScore(correctCount: number, totalRounds: number): number {
  return Math.round(correctCount * (100 / totalRounds));
}

export function averagePointsScore(points: readonly number[]): number {
  if (points.length === 0) return 20;

  const average = points.reduce((sum, point) => sum + point, 0) / points.length;
  return clamp(Math.round(average), 20, 100);
}

export function gradeForScore(score: number): GameGrade {
  if (score >= 85) return 'A';
  if (score >= 75) return 'A-';
  if (score >= 65) return 'B+';
  if (score >= 55) return 'B';
  return 'C';
}

export function averageResponseMs(times: readonly number[]): number {
  if (times.length === 0) return 0;
  return Math.round(times.reduce((sum, ms) => sum + ms, 0) / times.length);
}
