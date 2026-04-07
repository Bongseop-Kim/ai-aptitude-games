import { expo } from "@/shared/db/client";
import { emitAuthTelemetryEvent } from "@/shared/lib/auth-telemetry";

export type AuthSession = {
  userId: string;
  displayName: string;
};

const SESSION_TABLE_NAME = "app_user_session";
const SESSION_KEY = "current";

type StoredSessionRow = {
  user_id: string;
  display_name: string;
};

let isStoreInitialized = false;

const initializeSessionStore = () => {
  if (isStoreInitialized) {
    return;
  }

  expo.execSync(`
    CREATE TABLE IF NOT EXISTS ${SESSION_TABLE_NAME} (
      session_key TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      display_name TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `);

  isStoreInitialized = true;
};

const normalizeDisplayName = (value: string) => value.trim().slice(0, 40);

const createSessionId = () =>
  `user_${Date.now().toString(36)}_${Math.floor(Math.random() * 1_000_000)}`;

export const getStoredSession = async (): Promise<AuthSession | null> => {
  initializeSessionStore();

  const row = expo.getFirstSync<StoredSessionRow | null>(
    `SELECT user_id, display_name FROM ${SESSION_TABLE_NAME} WHERE session_key = ?`,
    SESSION_KEY
  );

  if (row == null) {
    return null;
  }

  return { userId: row.user_id, displayName: row.display_name };
};

export const bootstrapAuthSession = async (): Promise<AuthSession | null> => {
  const session = await getStoredSession();
  if (session != null) {
    try {
      await emitAuthTelemetryEvent({
        eventType: "auth_restored",
        userId: session.userId,
        payload: { displayName: session.displayName },
      });
    } catch (error) {
      console.error("[telemetry] failed to persist auth event", error);
    }
  }
  return session;
};

export const saveAuthSession = async (
  displayName: string
): Promise<AuthSession> => {
  const normalizedDisplayName = normalizeDisplayName(displayName);
  if (normalizedDisplayName.length === 0) {
    throw new Error("displayName must not be empty");
  }

  initializeSessionStore();

  const now = Date.now();
  const session: AuthSession = {
    userId: createSessionId(),
    displayName: normalizedDisplayName,
  };

  expo.runSync(
    `INSERT INTO ${SESSION_TABLE_NAME} (session_key, user_id, display_name, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(session_key)
    DO UPDATE SET
      user_id = excluded.user_id,
      display_name = excluded.display_name,
      updated_at = excluded.updated_at`,
    SESSION_KEY,
    session.userId,
    session.displayName,
    now,
    now
  );

  try {
    await emitAuthTelemetryEvent({
      eventType: "auth_signed_in",
      userId: session.userId,
      payload: { displayName: session.displayName },
    });
  } catch (error) {
    console.error("[telemetry] failed to persist auth event", error);
  }

  return session;
};

export const clearAuthSession = async (): Promise<void> => {
  initializeSessionStore();

  const priorSession = expo.getFirstSync<StoredSessionRow | null>(
    `SELECT user_id, display_name FROM ${SESSION_TABLE_NAME} WHERE session_key = ?`,
    SESSION_KEY
  );

  expo.runSync(
    `DELETE FROM ${SESSION_TABLE_NAME} WHERE session_key = ?`,
    SESSION_KEY
  );

  if (priorSession == null) {
    return;
  }

  try {
    await emitAuthTelemetryEvent({
      eventType: "auth_signed_out",
      userId: priorSession.user_id,
      payload: { displayName: priorSession.display_name },
    });
  } catch (error) {
    console.error("[telemetry] failed to persist auth event", error);
  }
};
