import type { MockExamRecord } from '../domain/types';

export const mockExamRecords: MockExamRecord[] = [
  { round: 6, dateLabel: '1월 12일', score: 78, delta: 4, duration: '22:14', pro: true },
  { round: 5, dateLabel: '1월 5일', score: 74, delta: 5, duration: '21:48', pro: true },
  { round: 4, dateLabel: '12월 29일', score: 69, delta: -2, duration: '24:02', pro: false },
  { round: 3, dateLabel: '12월 22일', score: 71, delta: 3, duration: '23:17', pro: false },
  { round: 2, dateLabel: '12월 15일', score: 68, delta: 6, duration: '25:30', pro: false },
  { round: 1, dateLabel: '12월 8일', score: 62, delta: null, duration: '26:44', pro: false },
];
