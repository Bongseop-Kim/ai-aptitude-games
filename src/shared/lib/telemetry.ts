import Constants from "expo-constants";
import { asc, desc, eq, max, sql } from "drizzle-orm";
import { Platform } from "react-native";
import { db } from "../db/client";
import { assessmentTelemetryEvents } from "../db/schema/assessment-telemetry";
import { getStoredSession } from "../auth/auth-service";

export type AssessmentGameKey =
  | "nback"
  | "gonogo"
  | "rotation"
  | "rps"
  | "promise"
  | "numbers"
  | "potion"
  | "stroop"
  | "taskswitch"
  | "arith"
  | "sequence"
  | "vsearch";
export type AssessmentDifficultyTier = "easy" | "normal" | "hard";
export type AssessmentDevice = "web" | "ios" | "android";
export type AssessmentEventType =
  | "session_started"
  | "trial_presented"
  | "response_submitted"
  | "trial_scored"
  | "difficulty_changed"
  | "session_completed"
  | "session_abandoned";

type AssessmentEventPayload = Record<string, unknown>;

export type AssessmentTelemetryEvent<K extends AssessmentGameKey = AssessmentGameKey> = {
  eventId: string;
  event: `assessment.${K}.${AssessmentEventType}`;
  sessionId: string;
  userId: string;
  timestamp: string;
  gameKey: K;
  difficultyTier: AssessmentDifficultyTier;
  blockIndex: number;
  trialIndex: number | null;
  latencyMs: number | null;
  isCorrect: boolean | null;
  device: AssessmentDevice;
  appVersion: string;
  payload?: AssessmentEventPayload;
};

const createEventId = () => {
  return `${Date.now().toString(36)}-${Math.floor(Math.random() * 1_000_000).toString(36)}`;
};

const resolveDevice = (): AssessmentDevice => {
  if (Platform.OS === "android") return "android";
  if (Platform.OS === "ios") return "ios";
  return "web";
};

const resolveAppVersion = () => {
  const version = Constants.expoConfig?.version;
  if (typeof version === "string" && version.length > 0) {
    return version;
  }

  return "0.0.0";
};

type OrderedTelemetryArgs = {
  sessionId: string;
  direction?: "asc" | "desc";
  limit?: number;
};

type AssessmentTelemetryRecord = {
  id: number;
  eventId: string;
  event: string;
  sessionId: string;
  userId: string;
  timestamp: string;
  createdAt: number;
  gameKey: string;
  difficultyTier: string;
  blockIndex: number;
  trialIndex: number | null;
  latencyMs: number | null;
  isCorrect: boolean | null;
  device: AssessmentDevice;
  appVersion: string;
  payload: string | null;
};

const parsePayload = (payload: string | null) => {
  if (payload == null || payload.length === 0) return undefined;
  try {
    return JSON.parse(payload) as AssessmentEventPayload;
  } catch {
    return undefined;
  }
};

const resolveUserId = async (userId?: string) => {
  if (userId != null && userId.trim().length > 0) {
    return userId;
  }

  const session = await getStoredSession();
  return session?.userId ?? "demo-user";
};

const mapRowToEvent = (row: AssessmentTelemetryRecord): AssessmentTelemetryEvent => ({
  eventId: row.eventId,
  event: row.event as AssessmentTelemetryEvent["event"],
  sessionId: row.sessionId,
  userId: row.userId,
  timestamp: row.timestamp,
  gameKey: row.gameKey as AssessmentTelemetryEvent["gameKey"],
  difficultyTier: row.difficultyTier as AssessmentTelemetryEvent["difficultyTier"],
  blockIndex: row.blockIndex,
  trialIndex: row.trialIndex,
  latencyMs: row.latencyMs,
  isCorrect: row.isCorrect,
  device: row.device,
  appVersion: row.appVersion,
  payload: parsePayload(row.payload),
});

const emitAssessmentEventAsync = async <K extends AssessmentGameKey>({
  gameKey,
  sessionId,
  eventType,
  difficultyTier,
  blockIndex,
  trialIndex,
  latencyMs,
  isCorrect,
  payload,
  userId,
}: {
  gameKey: K;
  sessionId: string;
  eventType: AssessmentEventType;
  difficultyTier: AssessmentDifficultyTier;
  blockIndex: number;
  trialIndex: number | null;
  latencyMs: number | null;
  isCorrect: boolean | null;
  payload?: AssessmentEventPayload;
  userId?: string;
}): Promise<void> => {
  const resolvedUserId = await resolveUserId(userId);
  const timestamp = new Date().toISOString();
  const createdAt = Date.now();
  const event: AssessmentTelemetryEvent<K> = {
    eventId: createEventId(),
    event: `assessment.${gameKey}.${eventType}`,
    sessionId,
    userId: resolvedUserId,
    timestamp,
    gameKey,
    difficultyTier,
    blockIndex,
    trialIndex,
    latencyMs,
    isCorrect,
    device: resolveDevice(),
    appVersion: resolveAppVersion(),
    ...(payload ? { payload } : {}),
  };

  console.log("[telemetry]", JSON.stringify(event));

  await db.insert(assessmentTelemetryEvents).values({
    eventId: event.eventId,
    event: event.event,
    sessionId: event.sessionId,
    userId: event.userId,
    timestamp: event.timestamp,
    createdAt,
    gameKey: event.gameKey,
    difficultyTier: event.difficultyTier,
    blockIndex: event.blockIndex,
    trialIndex: event.trialIndex,
    latencyMs: event.latencyMs,
    isCorrect: event.isCorrect,
    device: event.device,
    appVersion: event.appVersion,
    payload: event.payload == null ? null : JSON.stringify(event.payload),
  });
};

export const emitAssessmentEvent = <K extends AssessmentGameKey>({
  gameKey,
  sessionId,
  eventType,
  difficultyTier,
  blockIndex,
  trialIndex,
  latencyMs,
  isCorrect,
  payload,
  userId,
}: {
  gameKey: K;
  sessionId: string;
  eventType: AssessmentEventType;
  difficultyTier: AssessmentDifficultyTier;
  blockIndex: number;
  trialIndex: number | null;
  latencyMs: number | null;
  isCorrect: boolean | null;
  payload?: AssessmentEventPayload;
  userId?: string;
}) => {
  void emitAssessmentEventAsync({
    gameKey,
    sessionId,
    eventType,
    difficultyTier,
    blockIndex,
    trialIndex,
    latencyMs,
    isCorrect,
    payload,
    userId,
  }).catch((error) => {
    console.error("[telemetry] failed to persist event", error);
  });
};

export const buildFixedDifficultySessionStartPayload = (
  difficultyTier: AssessmentDifficultyTier
): AssessmentEventPayload => ({
  difficultyMode: "fixed",
  initialDifficultyTier: difficultyTier,
  supportsDifficultyChanges: false,
});

export const emitSessionAbandonedIfNeeded = <K extends AssessmentGameKey>({
  gameKey,
  sessionId,
  difficultyTier,
  blockIndex,
  trialIndex,
  hasStarted,
  hasCompleted,
  payload,
  userId,
}: {
  gameKey: K;
  sessionId: string;
  difficultyTier: AssessmentDifficultyTier;
  blockIndex: number;
  trialIndex: number | null;
  hasStarted: boolean;
  hasCompleted: boolean;
  payload?: AssessmentEventPayload;
  userId?: string;
}) => {
  if (!hasStarted || hasCompleted) {
    return false;
  }

  emitAssessmentEvent({
    gameKey,
    sessionId,
    eventType: "session_abandoned",
    difficultyTier,
    blockIndex,
    trialIndex,
    latencyMs: null,
    isCorrect: null,
    payload,
    userId,
  });

  return true;
};

export const getAssessmentSessionEventStream = async ({
  sessionId,
  direction = "asc",
  limit,
}: OrderedTelemetryArgs): Promise<AssessmentTelemetryEvent[]> => {
  const rows = await db
    .select()
    .from(assessmentTelemetryEvents)
    .where(eq(assessmentTelemetryEvents.sessionId, sessionId))
    .orderBy(
      direction === "desc"
        ? desc(assessmentTelemetryEvents.createdAt)
        : asc(assessmentTelemetryEvents.createdAt)
    )
    .limit(limit ?? Number.MAX_SAFE_INTEGER);

  return rows.map((row) => mapRowToEvent(row as AssessmentTelemetryRecord));
};

export const getAssessmentSessionIds = async (): Promise<string[]> => {
  const rows = await db
    .select({
      sessionId: assessmentTelemetryEvents.sessionId,
      lastSeen: max(assessmentTelemetryEvents.createdAt).as("lastSeen"),
    })
    .from(assessmentTelemetryEvents)
    .groupBy(assessmentTelemetryEvents.sessionId)
    .orderBy(desc(sql`lastSeen`));

  return rows.map((row) => row.sessionId);
};

export const exportAssessmentSessionTrace = async (
  sessionId: string
): Promise<string> => {
  const events = await getAssessmentSessionEventStream({ sessionId, direction: "asc" });
  return JSON.stringify(
    {
      sessionId,
      exportedAt: new Date().toISOString(),
      events,
      count: events.length,
    },
    null,
    2
  );
};
