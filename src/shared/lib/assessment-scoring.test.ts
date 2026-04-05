import { describe, expect, it } from "vitest";

import {
  ASSESSMENT_SCORING_CONTRACT_VERSION,
  calculateGameReadiness,
  buildAggregateReadinessPayload,
} from "./assessment-scoring";

describe("assessment-scoring", () => {
  it("returns zeroed values for empty question sets", () => {
    const result = calculateGameReadiness({
      gameKey: "nback",
      difficultyTier: "normal",
      totalQuestions: 0,
      correctCount: 0,
      answeredCount: 0,
      avgLatencyMs: null,
    });

    expect(result).toEqual({
      gameKey: "nback",
      difficultyTier: "normal",
      version: ASSESSMENT_SCORING_CONTRACT_VERSION,
      totalQuestions: 0,
      answeredCount: 0,
      correctCount: 0,
      accuracy: 0,
      completionRate: 0,
      speedScore: 0,
      speedCapMs: 0,
      readinessScore: 0,
      weights: {
        accuracy: 0.7,
        speed: 0.2,
        completion: 0.1,
      },
      edgeCase: "No question data available",
    });
  });

  it("computes readiness with weighting and clamped speed", () => {
    const result = calculateGameReadiness({
      gameKey: "rps",
      difficultyTier: "hard",
      totalQuestions: 20,
      correctCount: 10,
      answeredCount: 20,
      avgLatencyMs: 10_000,
    });

    expect(result.version).toBe(ASSESSMENT_SCORING_CONTRACT_VERSION);
    expect(result.readinessScore).toBe(45);
    expect(result.speedScore).toBe(0);
    expect(result.accuracy).toBe(0.5);
    expect(result.completionRate).toBe(1);
    expect(result.speedCapMs).toBe(3_000);
    expect(result.edgeCase).toBeNull();
  });

  it("builds weighted aggregate readiness", () => {
    const aggregate = buildAggregateReadinessPayload([
      {
        gameKey: "nback",
        difficultyTier: "normal",
        totalQuestions: 10,
        correctCount: 10,
        answeredCount: 10,
        avgLatencyMs: 100,
        readinessScore: 80,
      },
      {
        gameKey: "stroop",
        difficultyTier: "hard",
        totalQuestions: 10,
        correctCount: 5,
        answeredCount: 10,
        avgLatencyMs: null,
        readinessScore: 50,
      },
    ]);

    expect(aggregate).toEqual({
      readinessScore: 65,
      totalWeight: 2,
      weightedGames: 2,
      formula: "Weighted average of readiness by GAME_WEIGHTS",
    });
  });

  it("normalizes nback game scores using the shared contract", () => {
    const result = calculateGameReadiness({
      gameKey: "nback",
      difficultyTier: "normal",
      totalQuestions: 20,
      correctCount: 14,
      answeredCount: 18,
      avgLatencyMs: 2500,
    });

    expect(result).toMatchObject({
      gameKey: "nback",
      difficultyTier: "normal",
      totalQuestions: 20,
      answeredCount: 18,
      correctCount: 14,
      accuracy: 0.7,
      completionRate: 0.9,
      speedScore: 0.2857142857142857,
      speedCapMs: 3_500,
      readinessScore: 63.7,
    });
  });

  it("normalizes stroop game scores using the shared contract", () => {
    const result = calculateGameReadiness({
      gameKey: "stroop",
      difficultyTier: "easy",
      totalQuestions: 10,
      correctCount: 9,
      answeredCount: 8,
      avgLatencyMs: 1200,
    });

    expect(result).toMatchObject({
      gameKey: "stroop",
      difficultyTier: "easy",
      totalQuestions: 10,
      answeredCount: 8,
      correctCount: 9,
      accuracy: 0.9,
      completionRate: 0.8,
      speedScore: 0.6,
      speedCapMs: 3_000,
      readinessScore: 83,
    });
  });

  it("normalizes rps game scores using the shared contract", () => {
    const result = calculateGameReadiness({
      gameKey: "rps",
      difficultyTier: "hard",
      totalQuestions: 12,
      correctCount: 5,
      answeredCount: 12,
      avgLatencyMs: 3000,
    });

    expect(result).toMatchObject({
      gameKey: "rps",
      difficultyTier: "hard",
      totalQuestions: 12,
      answeredCount: 12,
      correctCount: 5,
      accuracy: 0.4166666666666667,
      completionRate: 1,
      speedScore: 0,
      speedCapMs: 3_000,
      readinessScore: 39.2,
    });
  });

  it("normalizes rotation game scores using the shared contract", () => {
    const result = calculateGameReadiness({
      gameKey: "rotation",
      difficultyTier: "normal",
      totalQuestions: 10,
      correctCount: 8,
      answeredCount: 10,
      avgLatencyMs: 4500,
    });

    expect(result).toMatchObject({
      gameKey: "rotation",
      difficultyTier: "normal",
      totalQuestions: 10,
      answeredCount: 10,
      correctCount: 8,
      accuracy: 0.8,
      completionRate: 1,
      speedScore: 0.25,
      speedCapMs: 6_000,
      readinessScore: 71,
    });
  });

  it("normalizes potion game scores using the shared contract", () => {
    const result = calculateGameReadiness({
      gameKey: "potion",
      difficultyTier: "hard",
      totalQuestions: 15,
      correctCount: 12,
      answeredCount: 14,
      avgLatencyMs: 6000,
    });

    expect(result).toMatchObject({
      gameKey: "potion",
      difficultyTier: "hard",
      totalQuestions: 15,
      answeredCount: 14,
      correctCount: 12,
      accuracy: 0.8,
      completionRate: 0.9333333333333333,
      speedScore: 0.25,
      speedCapMs: 8_000,
      readinessScore: 70.3,
    });
  });

  it("clamps extreme completion and latency values safely", () => {
    const result = calculateGameReadiness({
      gameKey: "numbers",
      difficultyTier: "easy",
      totalQuestions: 5,
      correctCount: 2,
      answeredCount: 20,
      avgLatencyMs: -250,
    });

    expect(result).toMatchObject({
      gameKey: "numbers",
      difficultyTier: "easy",
      totalQuestions: 5,
      answeredCount: 20,
      correctCount: 2,
      accuracy: 0.4,
      completionRate: 1,
      speedScore: 1,
      speedCapMs: 6_000,
      readinessScore: 58,
    });
  });
});
