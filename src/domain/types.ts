import type { BadgeTone, IconName } from '../shared/types';

export type GameId =
  | 'rps'
  | 'rotate'
  | 'promise'
  | 'potion'
  | 'path'
  | 'numbers'
  | 'memory'
  | 'cat'
  | 'compare';

export type CognitiveSkill =
  | '억제 제어'
  | '시공간 작업기억'
  | '논리 추론'
  | '귀납 추론'
  | '계획력'
  | 'Digit Span'
  | 'N-back'
  | '메타인지'
  | 'Subitizing';

export type GameStatus = 'done' | 'ready';

export type Tone = BadgeTone;

export type Game = {
  id: GameId;
  name: string;
  skill: CognitiveSkill;
  description: string;
  icon: IconName;
  minutes: number;
  tone: Tone;
};

export type GameWithProgress = Game & {
  score: number | null;
  status: GameStatus;
};

export type ReadinessLevel = 'seed' | 'sprout' | 'steady' | 'strong';

export type ReportSectionKey =
  | 'summary'
  | 'game'
  | 'interview';

export type MockExamRecord = {
  id: string;
  round: number;
  createdAt: string;
  dateLabel: string;
  score: number;
  delta: number | null;
  duration: string;
  durationMs: number;
};

export type InterviewSessionRecord = {
  id: string;
  round: number;
  createdAt: string;
  dateLabel: string;
  company: string;
  role: string;
  score: number;
  delta: number | null;
  questionCount: number;
  duration: string;
  durationMs: number;
  mockExamId: string | null;
};

export type SubscriptionPlan = {
  id: 'free' | 'pro-monthly' | 'pro-yearly';
  name: string;
  priceLabel: string;
  description: string;
  recommended?: boolean;
};

export type UserProfile = {
  name: string;
  description: string;
  handle: string;
  jobLabel: string;
  streakDays: number;
  mockExamCount: number;
  readiness: {
    score: number;
    percentileLabel: string;
    strength: string;
    weakness: string;
  };
};
