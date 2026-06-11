import type { ColorToken } from '../design-system/components/style-props';
import type { ReadinessLevel, Tone } from './types';

type ReadinessTempLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export function readinessLevel(score: number): ReadinessLevel {
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

export function readinessTempLevel(score: number): ReadinessTempLevel {
  if (score < 30) return 1;
  if (score < 40) return 2;
  if (score < 50) return 3;
  if (score < 58) return 4;
  if (score < 66) return 5;
  if (score < 74) return 6;
  if (score < 82) return 7;
  if (score < 88) return 8;
  if (score < 94) return 9;
  return 10;
}

export function readinessTempColors(score: number): { text: ColorToken; bg: ColorToken } {
  const level = readinessTempLevel(score);

  return {
    text: `mannerTemp.l${level}Text` as ColorToken,
    bg: `mannerTemp.l${level}Bg` as ColorToken,
  };
}
