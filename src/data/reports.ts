import type { ReportSectionKey } from '../domain/types';

export type ReportDetailSection = {
  key: ReportSectionKey;
  title: string;
};

export const reportDetailSections: ReportDetailSection[] = [
  { key: 'summary', title: '요약' },
  { key: 'game', title: '게임' },
  { key: 'interview', title: '면접' },
];
