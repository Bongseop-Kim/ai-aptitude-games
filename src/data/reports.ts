import type { ReportCompetency } from '../domain/types';

export const reportCompetencies: ReportCompetency[] = [
  { key: 'trust', label: '신뢰', description: '책임감·윤리 판단', score: 82, tone: 'positive' },
  { key: 'strategy', label: '전략', description: '다중 조건·문제 해결', score: 76, tone: 'informative' },
  { key: 'relationship', label: '관계', description: '협업·갈등 조율', score: 68, tone: 'warning' },
  { key: 'value', label: '가치', description: '내재 동기·가치 수용', score: 74, tone: 'brand' },
  { key: 'fit', label: '조직적합', description: '유연성·융화 속도', score: 79, tone: 'neutral' },
];
