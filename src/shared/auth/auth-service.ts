import { expo } from "@/shared/db/client";
import { getApiBaseUrlFromEnv } from "../config/api";
import {
  initializeTokenStore,
  TOKEN_KEY,
  TOKEN_TABLE_NAME,
} from "@/shared/auth/lib/token-store";
import { emitAuthTelemetryEvent } from "@/shared/lib/auth-telemetry";

export type AuthSession = {
  userId: string;
  displayName: string;
};

export type AuthErrorCode =
  | "offline"
  | "invalid_credentials"
  | "server_unavailable";

export class AuthServiceError extends Error {
  code: AuthErrorCode;

  constructor(code: AuthErrorCode, message?: string) {
    super(message ?? code);
    this.name = "AuthServiceError";
    this.code = code;
  }
}

const SESSION_TABLE_NAME = "app_user_session";
const SESSION_KEY = "current";
const AUTH_SIGN_IN_PATH = "/api/v1/auth/sign-in";
const MAX_SERVER_RETRY_COUNT = 2;
const RETRY_BASE_DELAY_MS = 300;
const DEFAULT_TIMEOUT_MS = 10000;

type StoredSessionRow = {
  user_id: string;
  display_name: string;
};

let isStoreInitialized = false;

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

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

const createSessionId = () => {
  return `user_${Date.now().toString(36)}_${Math.floor(Math.random() * 1_000_000)}`;
};

const getApiTimeoutMs = () => {
  const raw = process.env.EXPO_PUBLIC_API_TIMEOUT_MS;
  if (!raw) {
    return DEFAULT_TIMEOUT_MS;
  }

  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_TIMEOUT_MS;
  }

  return parsed;
};

const parseSignInPayload = async (response: Response) => {
  try {
    return (await response.json()) as {
      userId?: string;
      serverUserId?: string;
      displayName?: string;
    } | null;
  } catch {
    return null;
  }
};

const isOfflineError = (error: unknown) => {
  if (!(error instanceof Error)) {
    return false;
  }
  return error.name === "AbortError" || error.name === "TypeError";
};

const requestServerSignIn = async (
  displayName: string
): Promise<AuthSession> => {
  const baseUrl = getApiBaseUrlFromEnv();
  const endpoint = `${baseUrl}${AUTH_SIGN_IN_PATH}`;
  const timeoutMs = getApiTimeoutMs();

  for (let attempt = 0; attempt <= MAX_SERVER_RETRY_COUNT; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ displayName }),
        signal: controller.signal,
      });

      if (response.status === 401 || response.status === 403) {
        throw new AuthServiceError("invalid_credentials");
      }

      if (response.status >= 500) {
        if (attempt < MAX_SERVER_RETRY_COUNT) {
          await wait(RETRY_BASE_DELAY_MS * 2 ** attempt);
          continue;
        }
        throw new AuthServiceError("server_unavailable");
      }

      if (!response.ok) {
        throw new AuthServiceError("server_unavailable");
      }

      const payload = await parseSignInPayload(response);
      const payloadUserId = payload?.serverUserId?.trim() || payload?.userId?.trim();
      const payloadDisplayName = normalizeDisplayName(payload?.displayName ?? displayName);

      return {
        userId: payloadUserId && payloadUserId.length > 0 ? payloadUserId : createSessionId(),
        displayName: payloadDisplayName.length > 0 ? payloadDisplayName : displayName,
      };
    } catch (error) {
      if (error instanceof AuthServiceError) {
        throw error;
      }

      if (isOfflineError(error)) {
        throw new AuthServiceError("offline");
      }

      throw new AuthServiceError("server_unavailable");
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw new AuthServiceError("server_unavailable");
};

export const getStoredSession = async (): Promise<AuthSession | null> => {
  initializeSessionStore();

  const row = expo.getFirstSync<StoredSessionRow | null>(
    `SELECT user_id, display_name FROM ${SESSION_TABLE_NAME} WHERE session_key = ?`,
    SESSION_KEY
  );

  if (row == null) {
    return null;
  }

  return {
    userId: row.user_id,
    displayName: row.display_name,
  };
};

export const bootstrapAuthSession = async (): Promise<AuthSession | null> => {
  const session = await getStoredSession();
  if (session != null) {
    try {
      await emitAuthTelemetryEvent({
        eventType: "auth_restored",
        userId: session.userId,
        payload: {
          displayName: session.displayName,
        },
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
  const session = await requestServerSignIn(normalizedDisplayName);

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
      payload: {
        displayName: session.displayName,
      },
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
      payload: {
        displayName: priorSession.display_name,
      },
    });
  } catch (error) {
    console.error("[telemetry] failed to persist auth event", error);
  }
};

export const clearPersistedAuthState = async (): Promise<void> => {
  initializeSessionStore();
  initializeTokenStore();

  const priorSession = expo.getFirstSync<StoredSessionRow | null>(
    `SELECT user_id, display_name FROM ${SESSION_TABLE_NAME} WHERE session_key = ?`,
    SESSION_KEY
  );

  try {
    expo.execSync("BEGIN IMMEDIATE");
    expo.runSync(
      `DELETE FROM ${SESSION_TABLE_NAME} WHERE session_key = ?`,
      SESSION_KEY
    );
    expo.runSync(
      `DELETE FROM ${TOKEN_TABLE_NAME} WHERE session_key = ?`,
      TOKEN_KEY
    );
    expo.execSync("COMMIT");
  } catch (error) {
    try {
      expo.execSync("ROLLBACK");
    } catch {
      // Ignore rollback failures so the original storage error is preserved.
    }
    throw error;
  }

  if (priorSession == null) {
    return;
  }

  try {
    await emitAuthTelemetryEvent({
      eventType: "auth_signed_out",
      userId: priorSession.user_id,
      payload: {
        displayName: priorSession.display_name,
      },
    });
  } catch (error) {
    console.error("[telemetry] failed to persist auth event", error);
  }
};
