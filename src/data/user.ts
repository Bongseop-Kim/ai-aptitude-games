import type { UserProfile } from '../domain/types';

export const user: UserProfile = {
  name: '김준비',
  description: '개발 준비 · 무료 체험 6일 남음',
  handle: '@yeokgeom',
  jobLabel: 'IT · 개발 준비',
  streakDays: 4,
  mockExamCount: 6,
  readiness: {
    score: 74,
    percentileLabel: '상위 28%',
    strength: '신뢰 · 82',
    weakness: '관계 · 68',
  },
};
