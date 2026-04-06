import Constants from "expo-constants";
import { desc } from "drizzle-orm";
import { Platform } from "react-native";
import { db } from "../db/client";
import { authTelemetryEvents } from "../db/schema/auth-telemetry";

export type AuthEventType = "auth_signed_in" | "auth_signed_out" | "auth_restored";

type AuthEventPayload = Record<string, unknown>;

export type AuthTelemetryEvent = {
  eventId: string;
  event: AuthEventType;
  userId: string;
  timestamp: string;
  device: "web" | "ios" | "android";
  appVersion: string;
  payload?: AuthEventPayload;
};

const createEventId = () => {
  return `${Date.now().toString(36)}-${Math.floor(Math.random() * 1_000_000).toString(36)}`;
};

const resolveDevice = (): "web" | "ios" | "android" => {
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

export const emitAuthTelemetryEvent = async ({
  eventType,
  userId,
  payload,
}: {
  eventType: AuthEventType;
  userId: string;
  payload?: AuthEventPayload;
}) => {
  const event: AuthTelemetryEvent = {
    eventId: createEventId(),
    event: eventType,
    userId,
    timestamp: new Date().toISOString(),
    device: resolveDevice(),
    appVersion: resolveAppVersion(),
    ...(payload ? { payload } : {}),
  };

  console.log("[telemetry]", JSON.stringify(event));

  await db.insert(authTelemetryEvents).values({
    eventId: event.eventId,
    event: event.event,
    userId: event.userId,
    timestamp: event.timestamp,
    createdAt: Date.now(),
    device: event.device,
    appVersion: event.appVersion,
    payload: event.payload == null ? null : JSON.stringify(event.payload),
  });
};

export const getRecentAuthTelemetryEvents = async (
  limit = 20
): Promise<AuthTelemetryEvent[]> => {
  const rows = await db
    .select()
    .from(authTelemetryEvents)
    .orderBy(desc(authTelemetryEvents.createdAt))
    .limit(limit);

  return rows.map((row) => ({
    eventId: row.eventId,
    event: row.event as AuthEventType,
    userId: row.userId,
    timestamp: row.timestamp,
    device: row.device as AuthTelemetryEvent["device"],
    appVersion: row.appVersion,
    payload:
      row.payload == null
        ? undefined
        : (() => {
            try {
              return JSON.parse(row.payload) as AuthEventPayload;
            } catch {
              return undefined;
            }
          })(),
  }));
};
