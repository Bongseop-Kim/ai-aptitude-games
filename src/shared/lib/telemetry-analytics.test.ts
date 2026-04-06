import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockDb } = vi.hoisted(() => {
  return {
    mockDb: {
      select: vi.fn(),
    },
  };
});

const makeQueryChain = (result: unknown[]) => {
  const chain: {
    from: ReturnType<typeof vi.fn>;
    where: ReturnType<typeof vi.fn>;
    lt: ReturnType<typeof vi.fn>;
    orderBy: ReturnType<typeof vi.fn>;
    groupBy: ReturnType<typeof vi.fn>;
    then: ReturnType<typeof vi.fn>;
  } = {
    from: vi.fn(() => chain),
    where: vi.fn(() => chain),
    lt: vi.fn(() => chain),
    orderBy: vi.fn(() => chain),
    groupBy: vi.fn(() => chain),
    then: vi.fn(async (onFulfilled: (value: unknown[]) => unknown) => {
      return onFulfilled == null ? result : onFulfilled(result);
    }),
  };

  return chain;
};

vi.mock("@/shared/db/client", () => ({
  db: mockDb,
}));

const telemetryRow = ({
  sessionId,
  userId,
  createdAt,
  event,
  gameKey = "rps",
  trialIndex,
  latencyMs = null,
  isCorrect = null,
}: {
  sessionId: string;
  userId: string;
  createdAt: number;
  event: string;
  gameKey?: string;
  trialIndex?: number | null;
  latencyMs?: number | null;
  isCorrect?: boolean | null;
}) => ({
  sessionId,
  userId,
  createdAt,
  event,
  gameKey,
  difficultyTier: "normal",
  blockIndex: 0,
  trialIndex,
  latencyMs,
  isCorrect,
  device: "web",
  appVersion: "1.2.3",
});

import { getAssessmentTelemetryKpiSnapshot } from "@/shared/lib/telemetry-analytics";

describe("telemetry-analytics", () => {
  beforeEach(() => {
    mockDb.select.mockReset();
  });

  it("marks response-scoring latency below 100ms as invalid", async () => {
    const asOf = new Date("2026-01-10T00:00:00.000Z");
    const currentSessionAt = asOf.getTime() - 12 * 60 * 60 * 1000;

    mockDb.select
      .mockImplementationOnce(() =>
        makeQueryChain([
          telemetryRow({
            sessionId: "s-1",
            userId: "u-1",
            createdAt: currentSessionAt + 100,
            event: "assessment.rps.session_started",
            trialIndex: null,
            latencyMs: null,
            isCorrect: null,
          }),
          telemetryRow({
            sessionId: "s-1",
            userId: "u-1",
            createdAt: currentSessionAt + 200,
            event: "assessment.rps.response_submitted",
            trialIndex: 0,
            latencyMs: 50,
            isCorrect: true,
          }),
          telemetryRow({
            sessionId: "s-2",
            userId: "u-2",
            createdAt: currentSessionAt + 300,
            event: "assessment.rps.session_started",
            trialIndex: null,
            latencyMs: null,
            isCorrect: null,
          }),
          telemetryRow({
            sessionId: "s-2",
            userId: "u-2",
            createdAt: currentSessionAt + 400,
            event: "assessment.rps.response_submitted",
            trialIndex: 0,
            latencyMs: 100,
            isCorrect: true,
          }),
        ])
      )
      .mockImplementationOnce(() => makeQueryChain([]));

    const snapshot = await getAssessmentTelemetryKpiSnapshot({
      asOf,
      windowDays: 1,
    });

    expect(snapshot.current.overall.invalidEventRatioPct).toBe(25);
  });

  it("marks response-scoring latency above 60s as invalid", async () => {
    const asOf = new Date("2026-01-10T00:00:00.000Z");
    const currentSessionAt = asOf.getTime() - 12 * 60 * 60 * 1000;

    mockDb.select
      .mockImplementationOnce(() =>
        makeQueryChain([
          telemetryRow({
            sessionId: "s-1",
            userId: "u-1",
            createdAt: currentSessionAt + 100,
            event: "assessment.rps.session_started",
            trialIndex: null,
            latencyMs: null,
            isCorrect: null,
          }),
          telemetryRow({
            sessionId: "s-1",
            userId: "u-1",
            createdAt: currentSessionAt + 200,
            event: "assessment.rps.response_submitted",
            trialIndex: 0,
            latencyMs: 60001,
            isCorrect: true,
          }),
          telemetryRow({
            sessionId: "s-2",
            userId: "u-2",
            createdAt: currentSessionAt + 300,
            event: "assessment.rps.session_started",
            trialIndex: null,
            latencyMs: null,
            isCorrect: null,
          }),
          telemetryRow({
            sessionId: "s-2",
            userId: "u-2",
            createdAt: currentSessionAt + 400,
            event: "assessment.rps.response_submitted",
            trialIndex: 0,
            latencyMs: 60000,
            isCorrect: true,
          }),
        ])
      )
      .mockImplementationOnce(() => makeQueryChain([]));

    const snapshot = await getAssessmentTelemetryKpiSnapshot({
      asOf,
      windowDays: 1,
    });

    expect(snapshot.current.overall.invalidEventRatioPct).toBe(25);
  });

  it("counts sessions with at least one retry as retry sessions", async () => {
    const asOf = new Date("2026-01-10T00:00:00.000Z");
    const currentSessionAt = asOf.getTime() - 12 * 60 * 60 * 1000;

    mockDb.select
      .mockImplementationOnce(() =>
        makeQueryChain([
          telemetryRow({
            sessionId: "s-retry",
            userId: "u-1",
            createdAt: currentSessionAt + 100,
            event: "assessment.rps.session_started",
            trialIndex: null,
            latencyMs: null,
            isCorrect: null,
          }),
          telemetryRow({
            sessionId: "s-retry",
            userId: "u-1",
            createdAt: currentSessionAt + 200,
            event: "assessment.rps.response_submitted",
            trialIndex: 0,
            latencyMs: 200,
            isCorrect: true,
          }),
          telemetryRow({
            sessionId: "s-retry",
            userId: "u-1",
            createdAt: currentSessionAt + 250,
            event: "assessment.rps.response_submitted",
            trialIndex: 0,
            latencyMs: 220,
            isCorrect: true,
          }),
          telemetryRow({
            sessionId: "s-normal-1",
            userId: "u-2",
            createdAt: currentSessionAt + 300,
            event: "assessment.rps.session_started",
            trialIndex: null,
            latencyMs: null,
            isCorrect: null,
          }),
          telemetryRow({
            sessionId: "s-normal-1",
            userId: "u-2",
            createdAt: currentSessionAt + 400,
            event: "assessment.rps.response_submitted",
            trialIndex: 0,
            latencyMs: 200,
            isCorrect: true,
          }),
          telemetryRow({
            sessionId: "s-normal-2",
            userId: "u-3",
            createdAt: currentSessionAt + 500,
            event: "assessment.rps.session_started",
            trialIndex: null,
            latencyMs: null,
            isCorrect: null,
          }),
          telemetryRow({
            sessionId: "s-normal-2",
            userId: "u-3",
            createdAt: currentSessionAt + 600,
            event: "assessment.rps.response_submitted",
            trialIndex: 0,
            latencyMs: 200,
            isCorrect: true,
          }),
        ])
      )
      .mockImplementationOnce(() => makeQueryChain([]));

    const snapshot = await getAssessmentTelemetryKpiSnapshot({
      asOf,
      windowDays: 1,
    });

    expect(snapshot.current.overall.retryRatePct).toBe(33.33);
  });

  it("segments game_mode by telemetry gameKey values", async () => {
    const asOf = new Date("2026-01-10T00:00:00.000Z");
    const currentSessionAt = asOf.getTime() - 12 * 60 * 60 * 1000;

    mockDb.select
      .mockImplementationOnce(() =>
        makeQueryChain([
          telemetryRow({
            sessionId: "s-game-a",
            userId: "u-1",
            createdAt: currentSessionAt + 100,
            event: "assessment.rps.session_started",
            gameKey: "gameA",
            trialIndex: null,
            latencyMs: null,
            isCorrect: null,
          }),
          telemetryRow({
            sessionId: "s-game-a",
            userId: "u-1",
            createdAt: currentSessionAt + 200,
            event: "assessment.rps.session_completed",
            gameKey: "gameA",
            trialIndex: null,
            latencyMs: null,
            isCorrect: null,
          }),
          telemetryRow({
            sessionId: "s-game-b",
            userId: "u-2",
            createdAt: currentSessionAt + 300,
            event: "assessment.stroop.session_started",
            gameKey: "gameB",
            trialIndex: null,
            latencyMs: null,
            isCorrect: null,
          }),
          telemetryRow({
            sessionId: "s-game-b",
            userId: "u-2",
            createdAt: currentSessionAt + 400,
            event: "assessment.stroop.session_completed",
            gameKey: "gameB",
            trialIndex: null,
            latencyMs: null,
            isCorrect: null,
          }),
        ])
      )
      .mockImplementationOnce(() => makeQueryChain([]));

    const snapshot = await getAssessmentTelemetryKpiSnapshot({
      asOf,
      windowDays: 1,
    });

    expect(Object.keys(snapshot.current.segments.game_mode).sort()).toEqual([
      "gameA",
      "gameB",
    ]);
  });

  it("triggers completion drop alerts at exactly 15 percentage points", async () => {
    const asOf = new Date("2026-01-10T00:00:00.000Z");
    const currentSessionAt = asOf.getTime() - 12 * 60 * 60 * 1000;
    const previousSessionAt = asOf.getTime() - 36 * 60 * 60 * 1000;

    mockDb.select
      .mockImplementationOnce(() =>
        makeQueryChain([
          telemetryRow({
            sessionId: "current-complete-1",
            userId: "u-1",
            createdAt: currentSessionAt + 100,
            event: "assessment.rps.session_started",
            trialIndex: null,
            latencyMs: null,
            isCorrect: null,
          }),
          telemetryRow({
            sessionId: "current-complete-1",
            userId: "u-1",
            createdAt: currentSessionAt + 200,
            event: "assessment.rps.session_completed",
            trialIndex: null,
            latencyMs: null,
            isCorrect: null,
          }),
          telemetryRow({
            sessionId: "current-complete-2",
            userId: "u-2",
            createdAt: currentSessionAt + 300,
            event: "assessment.rps.session_started",
            trialIndex: null,
            latencyMs: null,
            isCorrect: null,
          }),
          telemetryRow({
            sessionId: "current-complete-2",
            userId: "u-2",
            createdAt: currentSessionAt + 400,
            event: "assessment.rps.session_completed",
            trialIndex: null,
            latencyMs: null,
            isCorrect: null,
          }),
          telemetryRow({
            sessionId: "current-complete-3",
            userId: "u-3",
            createdAt: currentSessionAt + 500,
            event: "assessment.rps.session_started",
            trialIndex: null,
            latencyMs: null,
            isCorrect: null,
          }),
          telemetryRow({
            sessionId: "current-complete-3",
            userId: "u-3",
            createdAt: currentSessionAt + 600,
            event: "assessment.rps.session_completed",
            trialIndex: null,
            latencyMs: null,
            isCorrect: null,
          }),
          telemetryRow({
            sessionId: "current-incomplete-1",
            userId: "u-4",
            createdAt: currentSessionAt + 800,
            event: "assessment.rps.session_started",
            trialIndex: null,
            latencyMs: null,
            isCorrect: null,
          }),
          telemetryRow({
            sessionId: "current-incomplete-2",
            userId: "u-5",
            createdAt: currentSessionAt + 900,
            event: "assessment.rps.session_started",
            trialIndex: null,
            latencyMs: null,
            isCorrect: null,
          }),
          telemetryRow({
            sessionId: "previous-complete-1",
            userId: "u-6",
            createdAt: previousSessionAt + 100,
            event: "assessment.rps.session_started",
            trialIndex: null,
            latencyMs: null,
            isCorrect: null,
          }),
          telemetryRow({
            sessionId: "previous-complete-1",
            userId: "u-6",
            createdAt: previousSessionAt + 200,
            event: "assessment.rps.session_completed",
            trialIndex: null,
            latencyMs: null,
            isCorrect: null,
          }),
          telemetryRow({
            sessionId: "previous-complete-2",
            userId: "u-7",
            createdAt: previousSessionAt + 300,
            event: "assessment.rps.session_started",
            trialIndex: null,
            latencyMs: null,
            isCorrect: null,
          }),
          telemetryRow({
            sessionId: "previous-complete-2",
            userId: "u-7",
            createdAt: previousSessionAt + 400,
            event: "assessment.rps.session_completed",
            trialIndex: null,
            latencyMs: null,
            isCorrect: null,
          }),
          telemetryRow({
            sessionId: "previous-complete-3",
            userId: "u-8",
            createdAt: previousSessionAt + 500,
            event: "assessment.rps.session_started",
            trialIndex: null,
            latencyMs: null,
            isCorrect: null,
          }),
          telemetryRow({
            sessionId: "previous-complete-3",
            userId: "u-8",
            createdAt: previousSessionAt + 600,
            event: "assessment.rps.session_completed",
            trialIndex: null,
            latencyMs: null,
            isCorrect: null,
          }),
          telemetryRow({
            sessionId: "previous-incomplete-1",
            userId: "u-9",
            createdAt: previousSessionAt + 700,
            event: "assessment.rps.session_started",
            trialIndex: null,
            latencyMs: null,
            isCorrect: null,
          }),
        ])
      )
      .mockImplementationOnce(() => makeQueryChain([]));

    const snapshot = await getAssessmentTelemetryKpiSnapshot({
      asOf,
      windowDays: 1,
    });

    expect(snapshot.current.overall.completionRatePct).toBe(60);
    expect(snapshot.previous.overall.completionRatePct).toBe(75);
    expect(snapshot.alerts.completionRateDrop.triggered).toBe(true);
  });

  it("limits first-seen aggregation to users in the active comparison windows", async () => {
    const asOf = new Date("2026-01-10T00:00:00.000Z");
    const currentSessionAt = asOf.getTime() - 12 * 60 * 60 * 1000;
    const currentRowsQuery = makeQueryChain([
      telemetryRow({
        sessionId: "s-1",
        userId: "u-1",
        createdAt: currentSessionAt + 100,
        event: "assessment.rps.session_started",
        trialIndex: null,
        latencyMs: null,
        isCorrect: null,
      }),
      telemetryRow({
        sessionId: "s-1",
        userId: "u-1",
        createdAt: currentSessionAt + 200,
        event: "assessment.rps.session_completed",
        trialIndex: null,
        latencyMs: null,
        isCorrect: null,
      }),
      telemetryRow({
        sessionId: "s-2",
        userId: "u-2",
        createdAt: currentSessionAt + 300,
        event: "assessment.rps.session_started",
        trialIndex: null,
        latencyMs: null,
        isCorrect: null,
      }),
    ]);
    const firstSeenQuery = makeQueryChain([]);

    mockDb.select
      .mockImplementationOnce(() => currentRowsQuery)
      .mockImplementationOnce(() => firstSeenQuery);

    await getAssessmentTelemetryKpiSnapshot({
      asOf,
      windowDays: 1,
    });

    expect(firstSeenQuery.where).toHaveBeenCalledTimes(1);
  });

  it("treats isCorrect on completion events as invalid", async () => {
    const asOf = new Date("2026-01-10T00:00:00.000Z");
    const currentSessionAt = asOf.getTime() - 12 * 60 * 60 * 1000;

    mockDb.select
      .mockImplementationOnce(() =>
        makeQueryChain([
          telemetryRow({
            sessionId: "s-invalid-complete",
            userId: "u-1",
            createdAt: currentSessionAt + 100,
            event: "assessment.rps.session_started",
            trialIndex: null,
            latencyMs: null,
            isCorrect: null,
          }),
          telemetryRow({
            sessionId: "s-invalid-complete",
            userId: "u-1",
            createdAt: currentSessionAt + 200,
            event: "assessment.rps.session_completed",
            trialIndex: null,
            latencyMs: null,
            isCorrect: false,
          }),
        ])
      )
      .mockImplementationOnce(() => makeQueryChain([]));

    const snapshot = await getAssessmentTelemetryKpiSnapshot({
      asOf,
      windowDays: 1,
    });

    expect(snapshot.current.overall.invalidEventCount).toBe(1);
    expect(snapshot.current.overall.invalidEventRatioPct).toBe(50);
  });

  it("keeps previous-window sessions out of current metrics when later events arrive in the current window", async () => {
    const asOf = new Date("2026-01-10T00:00:00.000Z");
    const previousSessionAt = asOf.getTime() - 36 * 60 * 60 * 1000;
    const currentSessionAt = asOf.getTime() - 12 * 60 * 60 * 1000;

    mockDb.select
      .mockImplementationOnce(() =>
        makeQueryChain([
          telemetryRow({
            sessionId: "previous-session",
            userId: "u-1",
            createdAt: previousSessionAt + 100,
            event: "assessment.rps.session_started",
            trialIndex: null,
            latencyMs: null,
            isCorrect: null,
          }),
          telemetryRow({
            sessionId: "previous-session",
            userId: "u-1",
            createdAt: currentSessionAt + 100,
            event: "assessment.rps.session_completed",
            trialIndex: null,
            latencyMs: null,
            isCorrect: null,
          }),
          telemetryRow({
            sessionId: "current-session",
            userId: "u-2",
            createdAt: currentSessionAt + 200,
            event: "assessment.rps.session_started",
            trialIndex: null,
            latencyMs: null,
            isCorrect: null,
          }),
          telemetryRow({
            sessionId: "current-session",
            userId: "u-2",
            createdAt: currentSessionAt + 300,
            event: "assessment.rps.session_completed",
            trialIndex: null,
            latencyMs: null,
            isCorrect: null,
          }),
        ])
      )
      .mockImplementationOnce(() => makeQueryChain([]));

    const snapshot = await getAssessmentTelemetryKpiSnapshot({
      asOf,
      windowDays: 1,
    });

    expect(snapshot.previous.overall.sessionCount).toBe(1);
    expect(snapshot.previous.overall.completedSessionCount).toBe(0);
    expect(snapshot.current.overall.sessionCount).toBe(1);
    expect(snapshot.current.overall.completedSessionCount).toBe(1);
  });

  it("formats alert messages with the requested comparison window", async () => {
    const asOf = new Date("2026-01-10T00:00:00.000Z");
    const currentSessionAt = asOf.getTime() - 2 * 24 * 60 * 60 * 1000;
    const previousSessionAt = asOf.getTime() - 5 * 24 * 60 * 60 * 1000;

    mockDb.select
      .mockImplementationOnce(() =>
        makeQueryChain([
          telemetryRow({
            sessionId: "current-session",
            userId: "u-1",
            createdAt: currentSessionAt,
            event: "assessment.rps.session_started",
            trialIndex: null,
            latencyMs: null,
            isCorrect: null,
          }),
          telemetryRow({
            sessionId: "current-session",
            userId: "u-1",
            createdAt: currentSessionAt + 500,
            event: "assessment.rps.session_completed",
            trialIndex: null,
            latencyMs: null,
            isCorrect: null,
          }),
          telemetryRow({
            sessionId: "previous-session",
            userId: "u-2",
            createdAt: previousSessionAt,
            event: "assessment.rps.session_started",
            trialIndex: null,
            latencyMs: null,
            isCorrect: null,
          }),
          telemetryRow({
            sessionId: "previous-session",
            userId: "u-2",
            createdAt: previousSessionAt + 400,
            event: "assessment.rps.session_completed",
            trialIndex: null,
            latencyMs: null,
            isCorrect: null,
          }),
        ])
      )
      .mockImplementationOnce(() => makeQueryChain([]));

    const snapshot = await getAssessmentTelemetryKpiSnapshot({
      asOf,
      windowDays: 3,
    });

    expect(snapshot.alerts.completionRateDrop.message).toContain("3일");
    expect(snapshot.alerts.p50CompletionIncrease.message).toContain("3일");
    expect(snapshot.alerts.completionRateDrop.message).not.toContain("전 주");
    expect(snapshot.alerts.p50CompletionIncrease.message).not.toContain("7일 기준");
  });
});
