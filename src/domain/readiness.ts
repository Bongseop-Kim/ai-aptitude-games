import type { ReadinessLevel, Tone } from './types';

function readinessLevel(score: number): ReadinessLevel {
  if (score >= 85) return 'strong';
  if (score >= 75) return 'steady';
  if (score >= 60) return 'sprout';
  return 'seed';
}

export function readinessLabel(score: number) {
  const level = readinessLevel(score);

  if (level === 'strong') return '실전 감각 좋아요';
  if (level === 'steady') return '꾸준히 오르는 중';
  if (level === 'sprout') return '기초 다지는 중';
  return '준비 시작';
}

export function readinessTone(score: number): Tone {
  const level = readinessLevel(score);

  if (level === 'strong') return 'positive';
  if (level === 'steady') return 'brand';
  if (level === 'sprout') return 'warning';
  return 'neutral';
}
