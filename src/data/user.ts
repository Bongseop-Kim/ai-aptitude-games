import type { UserProfile } from '../domain/types';

export const user: UserProfile = {
  name: '김준비',
  description: '개발 준비 · 무료 체험 6일 남음',
  handle: '@yeokgeom',
  jobLabel: 'IT · 개발 준비',
  streakDays: 4,
  mockExamCount: 6,
  gems: 340,
  readiness: {
    score: 74,
    percentileLabel: '상위 28%',
    strength: '신뢰 · 82',
    weakness: '관계 · 68',
  },
  ranking: {
    rivalInitial: '민',
    message: '민수님이 주간 랭킹에서 추월했어요',
    detail: '내 순위 2위 · 1위까지 46점',
  },
};
