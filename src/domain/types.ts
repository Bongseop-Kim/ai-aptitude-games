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

export type GameStatus = 'done' | 'ready' | 'locked';

export type Tone = BadgeTone;

export type Game = {
  id: GameId;
  name: string;
  skill: CognitiveSkill;
  description: string;
  icon: IconName;
  score: number;
  minutes: number;
  status: GameStatus;
  tone: Tone;
};

export type ReadinessLevel = 'seed' | 'sprout' | 'steady' | 'strong';

export type ReportSectionKey =
  | 'cover'
  | 'radar'
  | 'highlights'
  | 'resilience'
  | 'pattern'
  | 'peer'
  | 'coach';

export type ReportCompetency = {
  key: 'trust' | 'strategy' | 'relationship' | 'value' | 'fit';
  label: string;
  description: string;
  score: number;
  tone: Tone;
};

export type MockExamRecord = {
  round: number;
  dateLabel: string;
  score: number;
  delta: number | null;
  duration: string;
  pro: boolean;
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
  gems: number;
  readiness: {
    score: number;
    percentileLabel: string;
    strength: string;
    weakness: string;
  };
  ranking: {
    rivalInitial: string;
    message: string;
    detail: string;
  };
};
