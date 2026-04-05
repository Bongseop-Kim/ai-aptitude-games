import Constants from "expo-constants";
import { Platform } from "react-native";

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
  const resolvedUserId = userId ?? "demo-user";

  const event: AssessmentTelemetryEvent<K> = {
    eventId: createEventId(),
    event: `assessment.${gameKey}.${eventType}`,
    sessionId,
    userId: resolvedUserId,
    timestamp: new Date().toISOString(),
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
};
