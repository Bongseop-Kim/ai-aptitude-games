import { and, gte, lt, min } from "drizzle-orm";
import { db } from "../db/client";
import { assessmentTelemetryEvents } from "../db/schema/assessment-telemetry";

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_WINDOW_DAYS = 7;
const ROUNDING_DIGITS = 2;

type RawTelemetryRow = {
  sessionId: string;
  userId: string;
  createdAt: number;
  event: string;
  difficultyTier: string;
  blockIndex: number | null;
  trialIndex: number | null;
  latencyMs: number | null;
  isCorrect: boolean | null;
  device: string;
  appVersion: string;
};

type AggregatedSession = {
  sessionId: string;
  userId: string;
  firstEventAt: number;
  gameMode: string;
  device: string;
  appVersion: string;
  startedAt: number | null;
  completedAt: number | null;
  hasStarted: boolean;
  hasCompleted: boolean;
  hasAbandoned: boolean;
  hasRetry: boolean;
  responseSubmissionAttemptsByTrial: Record<number, number>;
  eventCount: number;
  invalidEventCount: number;
};

type KpiWindow = {
  from: number;
  to: number;
};

export type AssessmentTelemetryKpiValues = {
  completionRatePct: number;
  p50CompletionSec: number | null;
  invalidEventRatioPct: number;
  retryRatePct: number;
  sessionCount: number;
  completedSessionCount: number;
  invalidEventCount: number;
  eventCount: number;
};

export type AssessmentTelemetryKpiSegments = {
  device_os: Record<string, AssessmentTelemetryKpiValues>;
  app_version: Record<string, AssessmentTelemetryKpiValues>;
  first_time_user: Record<string, AssessmentTelemetryKpiValues>;
  game_mode: Record<string, AssessmentTelemetryKpiValues>;
};

export type AssessmentTelemetryKpiWindowSummary = {
  rangeFrom: string;
  rangeTo: string;
  overall: AssessmentTelemetryKpiValues;
  segments: AssessmentTelemetryKpiSegments;
};

export type AssessmentTelemetryKpiAlert = {
  triggered: boolean;
  current: number;
  previous: number | null;
  delta: number;
  threshold: number;
  message: string;
};

export type AssessmentTelemetryKpiSnapshot = {
  generatedAt: string;
  currentWindow: {
    from: string;
    to: string;
  };
  previousWindow: {
    from: string;
    to: string;
  };
  current: AssessmentTelemetryKpiWindowSummary;
  previous: AssessmentTelemetryKpiWindowSummary;
  alerts: {
    completionRateDrop: AssessmentTelemetryKpiAlert;
    p50CompletionIncrease: AssessmentTelemetryKpiAlert;
    invalidEventRatio: AssessmentTelemetryKpiAlert;
  };
};

const KNOWN_EVENT_TYPES = new Set([
  "session_started",
  "trial_presented",
  "response_submitted",
  "trial_scored",
  "difficulty_changed",
  "session_completed",
  "session_abandoned",
]);

const MIN_VALID_LATENCY_MS = 100;
const MAX_VALID_LATENCY_MS = 60_000;

type SnapshotOptions = {
  asOf?: Date;
  windowDays?: number;
};

const roundTo = (value: number) => {
  const factor = 10 ** ROUNDING_DIGITS;
  return Math.round(value * factor) / factor;
};

const toPercent = (numerator: number, denominator: number) => {
  if (denominator <= 0) return 0;
  return roundTo((numerator / denominator) * 100);
};

const toPercentDelta = (current: number, previous: number) => roundTo(current - previous);

const parseEventType = (rawEvent: string) => {
  const parts = rawEvent.split(".");
  if (parts.length < 3 || parts[0] !== "assessment") {
    return "invalid";
  }

  return parts[2] ?? "invalid";
};

const normalizeSegmentValue = (value: string | null | undefined) => {
  if (typeof value !== "string") return "unknown";
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : "unknown";
};

const isInvalidEvent = (eventType: string, row: RawTelemetryRow) => {
  if (!KNOWN_EVENT_TYPES.has(eventType)) return true;
  if (row.blockIndex == null || row.blockIndex < 0) return true;

  if (eventType === "session_started") {
    return row.trialIndex != null || row.latencyMs != null || row.isCorrect != null;
  }

  if (eventType === "trial_presented") {
    return row.trialIndex == null;
  }

  if (eventType === "response_submitted" || eventType === "trial_scored") {
    return (
      row.trialIndex == null ||
      row.latencyMs == null ||
      row.latencyMs < MIN_VALID_LATENCY_MS ||
      row.latencyMs > MAX_VALID_LATENCY_MS ||
      row.latencyMs < 0 ||
      row.isCorrect == null
    );
  }

  if (eventType === "difficulty_changed") {
    return row.trialIndex == null;
  }

  if (eventType === "session_completed" || eventType === "session_abandoned") {
    return row.trialIndex != null || row.latencyMs != null;
  }

  return false;
};

const calculateP50 = (values: number[]) => {
  if (values.length === 0) return null;
  const sorted = values.slice().sort((a, b) => a - b);
  const idx = Math.floor((sorted.length - 1) * 0.5);
  return roundTo(sorted[idx]);
};

const buildSession = (row: RawTelemetryRow): AggregatedSession => ({
  sessionId: row.sessionId,
  userId: row.userId,
  firstEventAt: row.createdAt,
  gameMode: normalizeSegmentValue(row.difficultyTier),
  device: normalizeSegmentValue(row.device),
  appVersion: normalizeSegmentValue(row.appVersion),
  startedAt: null,
  completedAt: null,
  hasStarted: false,
  hasCompleted: false,
  hasAbandoned: false,
  hasRetry: false,
  responseSubmissionAttemptsByTrial: {},
  eventCount: 0,
  invalidEventCount: 0,
});

const trackRetry = (acc: AggregatedSession, trialIndex: number | null) => {
  if (trialIndex == null) {
    return;
  }

  acc.responseSubmissionAttemptsByTrial[trialIndex] =
    (acc.responseSubmissionAttemptsByTrial[trialIndex] ?? 0) + 1;

  if (acc.responseSubmissionAttemptsByTrial[trialIndex] > 1) {
    acc.hasRetry = true;
  }
};

const aggregateSession = (acc: AggregatedSession, row: RawTelemetryRow) => {
  const eventType = parseEventType(row.event);

  if (row.createdAt < acc.firstEventAt) {
    acc.firstEventAt = row.createdAt;
  }

  acc.eventCount += 1;
  if (isInvalidEvent(eventType, row)) {
    acc.invalidEventCount += 1;
  }

  if (eventType === "session_started") {
    acc.hasStarted = true;
    if (acc.startedAt == null || row.createdAt < acc.startedAt) {
      acc.startedAt = row.createdAt;
    }
    return;
  }

  if (eventType === "session_completed") {
    acc.hasCompleted = true;
    if (acc.completedAt == null || row.createdAt > acc.completedAt) {
      acc.completedAt = row.createdAt;
    }
    return;
  }

  if (eventType === "session_abandoned") {
    acc.hasAbandoned = true;
    return;
  }

  if (eventType === "response_submitted") {
    trackRetry(acc, row.trialIndex);
  }
};

const summarizeSessions = (sessions: AggregatedSession[]) => {
  let sessionCount = 0;
  let completedSessionCount = 0;
  let retrySessionCount = 0;
  let invalidEventCount = 0;
  let eventCount = 0;
  const completionSeconds: number[] = [];

  for (const session of sessions) {
    eventCount += session.eventCount;
    invalidEventCount += session.invalidEventCount;

    if (!session.hasStarted) continue;

    sessionCount += 1;

    if (session.hasCompleted) {
      completedSessionCount += 1;
      if (session.startedAt != null && session.completedAt != null) {
        const elapsed = session.completedAt - session.startedAt;
        if (elapsed >= 0) {
          completionSeconds.push(elapsed / 1000);
        }
      }
    }

    if (session.hasRetry) {
      retrySessionCount += 1;
    }
  }

  return {
    completionRatePct: toPercent(completedSessionCount, sessionCount),
    p50CompletionSec: calculateP50(completionSeconds),
    invalidEventRatioPct: toPercent(invalidEventCount, eventCount),
    retryRatePct: toPercent(retrySessionCount, sessionCount),
    sessionCount,
    completedSessionCount,
    invalidEventCount,
    eventCount,
  };
};

const buildDimensionSegments = (
  sessions: AggregatedSession[],
  firstSeenAtMap: Map<string, number>,
  toDimension: (session: AggregatedSession, isFirstTime: () => string) => string
): Record<string, AssessmentTelemetryKpiValues> => {
  const grouped = new Map<string, AggregatedSession[]>();

  for (const session of sessions) {
    const firstTime = firstSeenAtMap.get(session.userId);
    const isFirstTime = () => {
      if (firstTime == null) return "returning";
      const firstEventAt = session.startedAt ?? session.firstEventAt;
      return firstEventAt <= firstTime ? "first_time" : "returning";
    };

    const dimensionValue = toDimension(session, isFirstTime);
    const list = grouped.get(dimensionValue);
    if (list == null) {
      grouped.set(dimensionValue, [session]);
      continue;
    }
    list.push(session);
  }

  const output: Record<string, AssessmentTelemetryKpiValues> = {};
  for (const [dimension, group] of grouped) {
    output[dimension] = summarizeSessions(group);
  }
  return output;
};

const buildWindowSummary = (
  sessions: AggregatedSession[],
  firstSeenAtMap: Map<string, number>,
  range: KpiWindow
): AssessmentTelemetryKpiWindowSummary => {
  const segments = {
    device_os: buildDimensionSegments(
      sessions,
      firstSeenAtMap,
      (session) => session.device
    ),
    app_version: buildDimensionSegments(
      sessions,
      firstSeenAtMap,
      (session) => session.appVersion
    ),
    first_time_user: buildDimensionSegments(
      sessions,
      firstSeenAtMap,
      (_session, isFirstTime) => isFirstTime()
    ),
    game_mode: buildDimensionSegments(sessions, firstSeenAtMap, (session) => session.gameMode),
  };

  return {
    rangeFrom: new Date(range.from).toISOString(),
    rangeTo: new Date(range.to).toISOString(),
    overall: summarizeSessions(sessions),
    segments,
  };
};

const mapWindow = (session: AggregatedSession, current: KpiWindow, previous: KpiWindow) => {
  const anchor = session.startedAt ?? session.firstEventAt;

  if (anchor >= current.from && anchor < current.to) {
    return "current";
  }

  if (anchor >= previous.from && anchor < previous.to) {
    return "previous";
  }

  return null;
};

export const getAssessmentTelemetryKpiSnapshot = async ({
  asOf = new Date(),
  windowDays = DEFAULT_WINDOW_DAYS,
}: SnapshotOptions = {}): Promise<AssessmentTelemetryKpiSnapshot> => {
  const nowMs = asOf.getTime();
  const dayMs = windowDays * DAY_MS;
  const currentRange: KpiWindow = {
    from: nowMs - dayMs,
    to: nowMs,
  };
  const previousRange: KpiWindow = {
    from: nowMs - dayMs * 2,
    to: nowMs - dayMs,
  };

  const rows = await db
    .select()
    .from(assessmentTelemetryEvents)
    .where(and(gte(assessmentTelemetryEvents.createdAt, previousRange.from), lt(assessmentTelemetryEvents.createdAt, nowMs)))
    .then((rows) => rows as RawTelemetryRow[]);

  const firstSeenRows = await db
    .select({
      userId: assessmentTelemetryEvents.userId,
      firstSeenAt: min(assessmentTelemetryEvents.createdAt).as(
        "firstSeenAt"
      ),
    })
    .from(assessmentTelemetryEvents)
    .groupBy(assessmentTelemetryEvents.userId);

  const firstSeenAtMap = new Map<string, number>(
    firstSeenRows.map((row) => [row.userId, Number(row.firstSeenAt)])
  );

  const sessionMap = new Map<string, AggregatedSession>();

  for (const row of rows) {
    const rowSession = sessionMap.get(row.sessionId);
    if (rowSession == null) {
      const session = buildSession(row);
      sessionMap.set(row.sessionId, session);
      aggregateSession(session, row);
      continue;
    }
    aggregateSession(rowSession, row);
  }

  const currentWindowSessions: AggregatedSession[] = [];
  const previousWindowSessions: AggregatedSession[] = [];

  for (const session of sessionMap.values()) {
    const bucket = mapWindow(session, currentRange, previousRange);
    if (bucket === "current") {
      currentWindowSessions.push(session);
      continue;
    }
    if (bucket === "previous") {
      previousWindowSessions.push(session);
    }
  }

  const current = buildWindowSummary(currentWindowSessions, firstSeenAtMap, currentRange);
  const previous = buildWindowSummary(previousWindowSessions, firstSeenAtMap, previousRange);

  const completionDrop = toPercentDelta(
    current.overall.completionRatePct,
    previous.overall.completionRatePct
  );
  const completionRateDrop: AssessmentTelemetryKpiAlert = {
    triggered:
      previous.overall.completionRatePct > 0 &&
      previous.overall.completionRatePct - current.overall.completionRatePct > 15,
    current: current.overall.completionRatePct,
    previous: previous.overall.completionRatePct,
    delta: completionDrop,
    threshold: -15,
    message:
      "완료율이 전 주 대비 15%p 이상 하락하면 경보를 표시합니다.",
  };

  const p50Current = current.overall.p50CompletionSec;
  const p50Previous = previous.overall.p50CompletionSec;
  const p50IncreaseDelta = p50Current != null && p50Previous != null && p50Previous > 0
    ? roundTo(((p50Current - p50Previous) / p50Previous) * 100)
    : 0;
  const p50CompletionIncrease: AssessmentTelemetryKpiAlert = {
    triggered:
      p50Current != null &&
      p50Previous != null &&
      p50Previous > 0 &&
      p50Current > p50Previous * 1.25,
    current: p50Current ?? 0,
    previous: p50Previous,
    delta: p50IncreaseDelta,
    threshold: 25,
    message: "p50 완료 시간 7일 기준 25% 초과 상승 시 경보를 표시합니다.",
  };

  const invalidEventRatio: AssessmentTelemetryKpiAlert = {
    triggered: current.overall.invalidEventRatioPct > 2,
    current: current.overall.invalidEventRatioPct,
    previous: previous.overall.invalidEventRatioPct,
    delta: toPercentDelta(
      current.overall.invalidEventRatioPct,
      previous.overall.invalidEventRatioPct
    ),
    threshold: 2,
    message: "invalid 이벤트 비율이 2% 초과 시 경보를 표시합니다.",
  };

  return {
    generatedAt: asOf.toISOString(),
    currentWindow: {
      from: new Date(currentRange.from).toISOString(),
      to: new Date(currentRange.to).toISOString(),
    },
    previousWindow: {
      from: new Date(previousRange.from).toISOString(),
      to: new Date(previousRange.to).toISOString(),
    },
    current,
    previous,
    alerts: {
      completionRateDrop,
      p50CompletionIncrease,
      invalidEventRatio,
    },
  };
};
