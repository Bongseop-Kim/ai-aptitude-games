import type { GameId } from '../types';
import { clamp } from './random';

export type GameResultInput = {
  gameId: GameId;
  score: number;
  accuracy: number;
  avgResponseMs: number;
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

// 또래 비교 데이터가 생기기 전까지 쓰는 placeholder 공식 (프로토타입과 동일)
export function peerPercentile(score: number): number {
  return Math.max(8, 100 - score);
}

export function averageResponseMs(times: readonly number[]): number {
  if (times.length === 0) return 0;
  return Math.round(times.reduce((sum, ms) => sum + ms, 0) / times.length);
}
