import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const { insertValues, mockDb } = vi.hoisted(() => {
  const hoistedInsertValues = vi.fn();
  return {
    insertValues: hoistedInsertValues,
    mockDb: {
      insert: vi.fn(() => ({
        values: hoistedInsertValues,
      })),
      select: vi.fn(),
    },
  };
});

const buildSessionStreamChain = (events: unknown[]) => {
  const chain = {} as {
    from: ReturnType<typeof vi.fn>;
    where: ReturnType<typeof vi.fn>;
    orderBy: ReturnType<typeof vi.fn>;
    limit: ReturnType<typeof vi.fn>;
  };
  chain.from = vi.fn(() => chain);
  chain.where = vi.fn(() => chain);
  chain.orderBy = vi.fn(() => chain);
  chain.limit = vi.fn(async () => events);
  return chain;
};

const buildSessionIdsChain = (rows: unknown[]) => {
  const chain = {} as {
    from: ReturnType<typeof vi.fn>;
    where: ReturnType<typeof vi.fn>;
    groupBy: ReturnType<typeof vi.fn>;
    orderBy: ReturnType<typeof vi.fn>;
  };
  chain.from = vi.fn(() => chain);
  chain.where = vi.fn(() => chain);
  chain.groupBy = vi.fn(() => chain);
  chain.orderBy = vi.fn(async () => rows);
  return chain;
};

vi.mock("../db/client", () => ({
  db: mockDb,
}));

vi.mock("expo-constants", () => ({
  default: {
    expoConfig: {
      version: "1.2.3",
    },
  },
}));

vi.mock("react-native", () => ({
  Platform: {
    OS: "web",
  },
}));

vi.mock("../db/schema/assessment-telemetry", () => ({
  assessmentTelemetryEvents: {},
}));

vi.mock("../auth/auth-service", () => ({
  getStoredSession: vi.fn(),
}));

import {
  buildFixedDifficultySessionStartPayload,
  emitAssessmentEvent,
  emitSessionAbandonedIfNeeded,
  exportAssessmentSessionTrace,
  getAssessmentSessionEventStream,
  getAssessmentSessionIds,
} from "./telemetry";
import { getStoredSession } from "../auth/auth-service";

describe("telemetry", () => {
  beforeEach(() => {
    mockDb.select.mockReset();
    mockDb.insert.mockClear();
    insertValues.mockReset();
    insertValues.mockResolvedValue(undefined);
    vi.mocked(getStoredSession).mockResolvedValue(null);
  });

  it("maps telemetry rows into typed event payloads", async () => {
    mockDb.select.mockReturnValue(
      buildSessionStreamChain([
        {
          id: 1,
          eventId: "evt-1",
          event: "assessment.nback.trial_scored",
          sessionId: "session-123",
          userId: "user-1",
          timestamp: "2026-01-01T00:00:00.000Z",
          createdAt: 1,
          gameKey: "nback",
          difficultyTier: "easy",
          blockIndex: 0,
          trialIndex: 0,
          latencyMs: 250,
          isCorrect: true,
          device: "web",
          appVersion: "1.2.3",
          payload: '{"score":42}',
        },
      ])
    );

    const events = await getAssessmentSessionEventStream({
      sessionId: "session-123",
      direction: "asc",
    });

    expect(mockDb.select).toHaveBeenCalledTimes(1);
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      event: "assessment.nback.trial_scored",
      gameKey: "nback",
      difficultyTier: "easy",
      payload: { score: 42 },
    });
  });

  it("treats malformed telemetry payloads as undefined", async () => {
    mockDb.select.mockReturnValue(
      buildSessionStreamChain([
        {
          id: 2,
          eventId: "evt-bad",
          event: "assessment.numbers.trial_scored",
          sessionId: "session-bad",
          userId: "user-3",
          timestamp: "2026-01-01T00:00:00.000Z",
          createdAt: 3,
          gameKey: "numbers",
          difficultyTier: "easy",
          blockIndex: 0,
          trialIndex: 0,
          latencyMs: 50,
          isCorrect: true,
          device: "web",
          appVersion: "1.2.3",
          payload: "{not-json",
        },
      ])
    );

    const events = await getAssessmentSessionEventStream({
      sessionId: "session-bad",
      direction: "asc",
    });

    expect(events[0].payload).toBeUndefined();
  });

  it("returns latest session ids from grouped telemetry rows", async () => {
    mockDb.select.mockReturnValue(
      buildSessionIdsChain([
        { sessionId: "session-2", lastSeen: 1700000002 },
        { sessionId: "session-1", lastSeen: 1700000001 },
      ])
    );

    const ids = await getAssessmentSessionIds();

    expect(ids).toEqual(["session-2", "session-1"]);
  });

  it("exports a telemetry trace in deterministic JSON", async () => {
    mockDb.select.mockReturnValue(
      buildSessionStreamChain([
        {
          id: 1,
          eventId: "evt-2",
          event: "assessment.rps.session_completed",
          sessionId: "session-456",
          userId: "user-2",
          timestamp: "2026-01-01T00:00:00.000Z",
          createdAt: 2,
          gameKey: "rps",
          difficultyTier: "hard",
          blockIndex: 1,
          trialIndex: null,
          latencyMs: null,
          isCorrect: null,
          device: "web",
          appVersion: "1.2.3",
          payload: null,
        },
      ])
    );

    const trace = await exportAssessmentSessionTrace("session-456");
    const parsed = JSON.parse(trace);

    expect(parsed).toMatchObject({
      sessionId: "session-456",
      count: 1,
      events: [
        {
          event: "assessment.rps.session_completed",
          gameKey: "rps",
        },
      ],
    });
    expect(parsed.events[0].timestamp).toBe("2026-01-01T00:00:00.000Z");
  });

  it("persists emitted telemetry events with DB insert values", async () => {
    emitAssessmentEvent({
      gameKey: "stroop",
      sessionId: "session-789",
      eventType: "trial_presented",
      difficultyTier: "normal",
      blockIndex: 1,
      trialIndex: null,
      latencyMs: 120,
      isCorrect: null,
      payload: { isTrainingRound: true },
    });

    await Promise.resolve();
    await Promise.resolve();
    expect(insertValues).toHaveBeenCalledTimes(1);

    const payload = insertValues.mock.calls[0][0];
    expect(payload).toMatchObject({
      event: "assessment.stroop.trial_presented",
      sessionId: "session-789",
      gameKey: "stroop",
      userId: "demo-user",
      payload: JSON.stringify({ isTrainingRound: true }),
    });
  });

  it("returns fixed-difficulty baseline payload metadata", () => {
    expect(buildFixedDifficultySessionStartPayload("normal")).toEqual({
      difficultyMode: "fixed",
      initialDifficultyTier: "normal",
      supportsDifficultyChanges: false,
    });
  });

  it("emits session_abandoned only when started and not completed", async () => {
    const emitted = emitSessionAbandonedIfNeeded({
      gameKey: "nback",
      sessionId: "session-abandoned",
      difficultyTier: "hard",
      blockIndex: 2,
      trialIndex: 7,
      hasStarted: true,
      hasCompleted: false,
      payload: { reason: "unmount" },
    });

    await Promise.resolve();
    await Promise.resolve();

    expect(emitted).toBe(true);
    expect(insertValues).toHaveBeenCalledTimes(1);
    expect(insertValues.mock.calls[0][0]).toMatchObject({
      event: "assessment.nback.session_abandoned",
      sessionId: "session-abandoned",
      difficultyTier: "hard",
      blockIndex: 2,
      trialIndex: 7,
      payload: JSON.stringify({ reason: "unmount" }),
    });
  });

  it("does not emit session_abandoned when session not started or already completed", async () => {
    const whenNotStarted = emitSessionAbandonedIfNeeded({
      gameKey: "nback",
      sessionId: "session-open",
      difficultyTier: "normal",
      blockIndex: 0,
      trialIndex: null,
      hasStarted: false,
      hasCompleted: false,
    });
    const whenCompleted = emitSessionAbandonedIfNeeded({
      gameKey: "nback",
      sessionId: "session-done",
      difficultyTier: "normal",
      blockIndex: 0,
      trialIndex: null,
      hasStarted: true,
      hasCompleted: true,
    });

    await Promise.resolve();
    await Promise.resolve();

    expect(whenNotStarted).toBe(false);
    expect(whenCompleted).toBe(false);
    expect(insertValues).not.toHaveBeenCalled();
  });
});
