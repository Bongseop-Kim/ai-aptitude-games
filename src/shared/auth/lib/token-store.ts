import { expo } from "@/shared/db/client";
import type { AuthTokens } from "../model/auth-types";

type StoredTokenRow = {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  token_type: "Bearer";
  server_user_id: string;
};

const TOKEN_TABLE_NAME = "app_auth_tokens";
const TOKEN_KEY = "current";

let isTokenStoreInitialized = false;

const initializeTokenStore = () => {
  if (isTokenStoreInitialized) {
    return;
  }

  expo.execSync(`
    CREATE TABLE IF NOT EXISTS ${TOKEN_TABLE_NAME} (
      session_key TEXT PRIMARY KEY,
      access_token TEXT NOT NULL,
      refresh_token TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      token_type TEXT NOT NULL,
      server_user_id TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `);

  isTokenStoreInitialized = true;
};

export const loadAuthTokens = async (): Promise<AuthTokens | null> => {
  initializeTokenStore();

  const row = expo.getFirstSync<StoredTokenRow | null>(
    `SELECT access_token, refresh_token, expires_at, token_type, server_user_id FROM ${TOKEN_TABLE_NAME} WHERE session_key = ?`,
    TOKEN_KEY
  );

  if (row == null) {
    return null;
  }

  return {
    accessToken: row.access_token,
    refreshToken: row.refresh_token,
    expiresAt: row.expires_at,
    tokenType: row.token_type,
    serverUserId: row.server_user_id,
  };
};

export const saveAuthTokens = async (tokens: AuthTokens): Promise<void> => {
  initializeTokenStore();

  const now = Date.now();
  expo.runSync(
    `INSERT INTO ${TOKEN_TABLE_NAME} (
      session_key, access_token, refresh_token, expires_at, token_type, server_user_id, created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(session_key)
    DO UPDATE SET
      access_token = excluded.access_token,
      refresh_token = excluded.refresh_token,
      expires_at = excluded.expires_at,
      token_type = excluded.token_type,
      server_user_id = excluded.server_user_id,
      updated_at = excluded.updated_at`,
    TOKEN_KEY,
    tokens.accessToken,
    tokens.refreshToken,
    tokens.expiresAt,
    tokens.tokenType,
    tokens.serverUserId,
    now,
    now
  );
};

export const clearAuthTokens = async (): Promise<void> => {
  initializeTokenStore();
  expo.runSync(`DELETE FROM ${TOKEN_TABLE_NAME} WHERE session_key = ?`, TOKEN_KEY);
};

export type { AuthTokens };
