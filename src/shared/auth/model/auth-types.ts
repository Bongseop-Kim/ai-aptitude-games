export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  tokenType: "Bearer";
  serverUserId: string;
};

export type AuthIdentity = {
  userId: string;
  displayName: string;
};

export type AuthSessionState = {
  identity: AuthIdentity | null;
  tokens: AuthTokens | null;
};

export type AuthErrorCode =
  | "offline"
  | "invalid_credentials"
  | "invalid_token"
  | "forbidden"
  | "server_unavailable";
