import type { ReportCompetency, ReportSectionKey } from '../domain/types';

export const reportCompetencies: ReportCompetency[] = [
  { key: 'trust', label: '신뢰', description: '책임감·윤리 판단', score: 82, tone: 'positive' },
  { key: 'strategy', label: '전략', description: '다중 조건·문제 해결', score: 76, tone: 'informative' },
  { key: 'relationship', label: '관계', description: '협업·갈등 조율', score: 68, tone: 'warning' },
  { key: 'value', label: '가치', description: '내재 동기·가치 수용', score: 74, tone: 'brand' },
  { key: 'fit', label: '조직적합', description: '유연성·융화 속도', score: 79, tone: 'neutral' },
];

export type ReportDetailSection = {
  key: ReportSectionKey;
  title: string;
  locked: boolean;
};

export type ReportHighlight = {
  game: string;
  skill: string;
  score: number;
  note: string;
};

export const reportDetailSections: ReportDetailSection[] = [
  { key: 'cover', title: '종합 리포트', locked: false },
  { key: 'radar', title: '5대 역량 프로필', locked: false },
  { key: 'highlights', title: '강점 · 약점 Top 3', locked: false },
  { key: 'resilience', title: '스트레스 복원력', locked: true },
  { key: 'pattern', title: '응답 패턴 프로필', locked: true },
  { key: 'peer', title: '또래 비교 · 성장 추이', locked: false },
  { key: 'coach', title: 'AI 코치 · 개선 플랜', locked: true },
];

export const reportStrengths: ReportHighlight[] = [
  {
    game: '개수 비교',
    skill: 'Subitizing',
    score: 88,
    note: '크기 착시를 억제하고 개수만 추정했어요.',
  },
  {
    game: '마법약 만들기',
    skill: '귀납 추론',
    score: 85,
    note: '실패 후 가설 전환이 빠르게 일어났어요.',
  },
  {
    game: '고양이 찾기',
    skill: '메타인지',
    score: 82,
    note: '확신도와 정답률의 일치도가 높았어요.',
  },
];

export const reportGrowthAreas: ReportHighlight[] = [
  {
    game: '숫자 누르기',
    skill: 'Digit Span 역순',
    score: 63,
    note: '6자리 이상에서 정답률이 낮아졌어요.',
  },
  {
    game: '도형 순서',
    skill: 'N-back',
    score: 66,
    note: '정보 갱신 부하가 큰 구간에서 흔들렸어요.',
  },
  {
    game: '길 만들기',
    skill: '계획력',
    score: 69,
    note: '전체 조망 전에 국지적으로 해결하는 경향이 있었어요.',
  },
];

export const peerPercentiles: Record<ReportCompetency['key'], number> = {
  fit: 66,
  relationship: 55,
  strategy: 72,
  trust: 88,
  value: 78,
};
