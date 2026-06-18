import type { ReportResilienceCurvePoint } from './report';

export type PressureRecoveryInput = {
  actualScore: number;
  difficulty: number;
  gameId: string;
};

export type PressureRecoveryImpact = 'none' | 'small' | 'partial' | 'continued' | 'unmeasured';

export type PressureRecoverySummary = {
  event: ReportResilienceCurvePoint | null;
  next: ReportResilienceCurvePoint | null;
  impact: PressureRecoveryImpact;
};

const EXPECTED_DIFFICULTY_WEIGHT = 0.35;
export const PRESSURE_SCORE_GAP_THRESHOLD = -15;
export const DIFFICULTY_JUMP_THRESHOLD = 12;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function average(values: readonly number[]) {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function buildPressureRecoveryCurve(
  inputs: readonly PressureRecoveryInput[],
): ReportResilienceCurvePoint[] {
  if (inputs.length === 0) {
    return [];
  }

  const baselineScore = average(inputs.map((input) => input.actualScore));
  const baselineDifficulty = average(inputs.map((input) => input.difficulty));

  const points = inputs.map((input, index) => {
    const difficulty = clamp(input.difficulty, 0, 100);
    const expectedScore = clamp(
      baselineScore - (difficulty - baselineDifficulty) * EXPECTED_DIFFICULTY_WEIGHT,
      20,
      100,
    );
    const actualScore = clamp(input.actualScore, 0, 100);
    const scoreGap = actualScore - expectedScore;
    const previousDifficulty = inputs[index - 1]?.difficulty ?? difficulty;
    const difficultyJump = difficulty - previousDifficulty;

    return {
      game_id: input.gameId,
      segment: index,
      value: actualScore,
      difficulty,
      expected_score: expectedScore,
      actual_score: actualScore,
      score_gap: scoreGap,
      difficulty_jump: difficultyJump,
      is_pressure_event: scoreGap <= PRESSURE_SCORE_GAP_THRESHOLD,
      next_game_gap: null,
    };
  });

  return points.map((point, index) => ({
    ...point,
    next_game_gap: point.is_pressure_event ? points[index + 1]?.score_gap ?? null : null,
  }));
}

export function resolvePressureRecoverySummary(
  curve: readonly ReportResilienceCurvePoint[],
): PressureRecoverySummary {
  if (curve.length === 0) {
    return { event: null, next: null, impact: 'none' };
  }

  const pressureEvents = curve.filter((point) => point.is_pressure_event);
  const event =
    pressureEvents.find((point) => (point.difficulty_jump ?? 0) >= DIFFICULTY_JUMP_THRESHOLD) ??
    pressureEvents[0] ??
    null;

  if (!event) {
    return { event: null, next: null, impact: 'none' };
  }

  const next = curve[event.segment + 1] ?? null;
  if (!next) {
    return { event, next: null, impact: 'unmeasured' };
  }

  const nextGap = next.score_gap ?? 0;
  if (nextGap >= -7) {
    return { event, next, impact: 'small' };
  }
  if (nextGap >= PRESSURE_SCORE_GAP_THRESHOLD) {
    return { event, next, impact: 'partial' };
  }
  return { event, next, impact: 'continued' };
}
