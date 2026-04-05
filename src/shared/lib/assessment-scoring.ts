import { AssessmentDifficultyTier, AssessmentGameKey } from "./telemetry";

export const ASSESSMENT_SCORING_CONTRACT_VERSION = "1.0.0";

export const ASSESSMENT_COMPONENT_WEIGHTS = {
  accuracy: 0.7,
  speed: 0.2,
  completion: 0.1,
} as const;

type TimeTargetMap = Record<AssessmentGameKey, number>;

export const ASSESSMENT_GAME_TIME_TARGET_MS: TimeTargetMap = {
  nback: 3_500,
  gonogo: 1_500,
  rotation: 6_000,
  rps: 3_000,
  promise: 8_000,
  numbers: 6_000,
  potion: 8_000,
  stroop: 3_000,
  taskswitch: 5_000,
  arith: 5_000,
  sequence: 5_000,
  vsearch: 5_000,
};

export const ASSESSMENT_GAME_WEIGHTS: Record<AssessmentGameKey, number> = {
  nback: 1,
  gonogo: 1,
  rotation: 1,
  rps: 1,
  promise: 1,
  numbers: 1,
  potion: 1,
  stroop: 1,
  taskswitch: 1,
  arith: 1,
  sequence: 1,
  vsearch: 1,
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

export type GameReadinessScoreWeights = {
  accuracy: number;
  speed: number;
  completion: number;
};

export type AssessmentScoringInput = {
  gameKey: AssessmentGameKey;
  difficultyTier: AssessmentDifficultyTier;
  totalQuestions: number;
  correctCount: number;
  answeredCount: number;
  avgLatencyMs: number | null;
};

export type AssessmentScoringResult = {
  gameKey: AssessmentGameKey;
  difficultyTier: AssessmentDifficultyTier;
  version: string;
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  accuracy: number;
  completionRate: number;
  speedScore: number;
  speedCapMs: number;
  readinessScore: number;
  weights: GameReadinessScoreWeights;
  edgeCase: string | null;
};

export type AggregateReadinessInput = AssessmentScoringInput & {
  readinessScore: number;
};

export type AggregateReadinessPayload = {
  readinessScore: number;
  totalWeight: number;
  weightedGames: number;
  formula: string;
};

export const calculateGameReadiness = ({
  gameKey,
  difficultyTier,
  totalQuestions,
  correctCount,
  answeredCount,
  avgLatencyMs,
}: AssessmentScoringInput): AssessmentScoringResult => {
  if (totalQuestions <= 0) {
    return {
      gameKey,
      difficultyTier,
      version: ASSESSMENT_SCORING_CONTRACT_VERSION,
      totalQuestions: 0,
      answeredCount: 0,
      correctCount: 0,
      accuracy: 0,
      completionRate: 0,
      speedScore: 0,
      speedCapMs: avgLatencyMs ?? 0,
      readinessScore: 0,
      weights: ASSESSMENT_COMPONENT_WEIGHTS,
      edgeCase: "No question data available",
    };
  }

  const safeTotal = Math.max(1, Math.round(totalQuestions));
  const safeCorrect = clamp01(correctCount / safeTotal);
  const safeAnswered = clamp01((Math.max(0, Math.round(answeredCount))) / safeTotal);

  const targetMs = ASSESSMENT_GAME_TIME_TARGET_MS[gameKey] ?? 5_000;
  const speedScore =
    avgLatencyMs == null
      ? 0.5
      : clamp01(1 - clamp01(avgLatencyMs / targetMs));

  const readinessScoreRaw =
    ASSESSMENT_COMPONENT_WEIGHTS.accuracy * safeCorrect +
    ASSESSMENT_COMPONENT_WEIGHTS.speed * speedScore +
    ASSESSMENT_COMPONENT_WEIGHTS.completion * safeAnswered;
  const readinessScore = Math.round(readinessScoreRaw * 1000) / 10;

  return {
    gameKey,
    difficultyTier,
    version: ASSESSMENT_SCORING_CONTRACT_VERSION,
    totalQuestions: safeTotal,
    answeredCount: Math.max(0, Math.round(answeredCount)),
    correctCount: Math.max(0, Math.round(correctCount)),
    accuracy: safeCorrect,
    completionRate: safeAnswered,
    speedScore,
    speedCapMs: targetMs,
    readinessScore,
    weights: ASSESSMENT_COMPONENT_WEIGHTS,
    edgeCase: avgLatencyMs == null ? "No latency; speed component defaulted to 0.5" : null,
  };
};

export const buildSessionCompletionScoringPayload = (
  input: AssessmentScoringInput
) => ({
  scoring: {
    ...calculateGameReadiness(input),
    formula: {
      version: ASSESSMENT_SCORING_CONTRACT_VERSION,
      expression: "readiness = 0.7*accuracy + 0.2*speed + 0.1*completion",
      weights: ASSESSMENT_COMPONENT_WEIGHTS,
      edgeCaseRules: [
        "totalQuestions <= 0 => readiness 0",
        "avgLatencyMs missing => speed 0.5",
        "completionRate = answeredCount / totalQuestions",
      ],
    },
  },
});

export const buildAggregateReadinessPayload = (
  items: AggregateReadinessInput[]
): AggregateReadinessPayload | null => {
  if (items.length === 0) {
    return null;
  }

  const weightedGames = items.length;
  let scoreSum = 0;
  let weightSum = 0;

  for (const item of items) {
    const gameWeight = ASSESSMENT_GAME_WEIGHTS[item.gameKey] ?? 1;
    scoreSum += item.readinessScore * gameWeight;
    weightSum += gameWeight;
  }

  if (weightSum <= 0) {
    return {
      readinessScore: 0,
      totalWeight: 0,
      weightedGames,
      formula:
        "Weighted average of normalized readiness scores using per-game weights",
    };
  }

  return {
    readinessScore: Math.round((scoreSum / weightSum) * 10) / 10,
    totalWeight: weightSum,
    weightedGames,
    formula: "Weighted average of readiness by GAME_WEIGHTS",
  };
};
