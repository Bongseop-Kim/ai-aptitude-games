import type { ReportSectionKey } from '../domain/types';

export type ReportDetailSection = {
  key: ReportSectionKey;
  title: string;
  locked: boolean;
};

export const reportDetailSections: ReportDetailSection[] = [
  { key: 'cover', title: '종합 리포트', locked: false },
  { key: 'games', title: '게임별 결과', locked: false },
  { key: 'competencies', title: '5대 역량 프로필', locked: false },
  { key: 'highlights', title: '강점 · 보완 Top 3', locked: false },
  { key: 'interview', title: 'AI 면접 피드백', locked: false },
  { key: 'resilience', title: '스트레스 복원력', locked: true },
  { key: 'pattern', title: '응답 패턴 프로필', locked: true },
  { key: 'peer', title: '성장 추이', locked: false },
  { key: 'coach', title: 'AI 코치 · 개선 플랜', locked: true },
];
