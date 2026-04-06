import type { AuthTokens } from "./auth-types";

export type AuthStatus =
  | "loading"
  | "refreshing"
  | "authenticated"
  | "expired"
  | "unauthenticated";

type AuthStatusInput = {
  isLoading: boolean;
  hasSession: boolean;
  requiresRefresh: boolean;
  refreshFailed: boolean;
};

export const isTokenExpired = (
  expiresAt: number,
  now = Date.now(),
  skewMs = 60_000
) => expiresAt <= now + skewMs;

export const shouldRefreshToken = (
  tokens: AuthTokens | null,
  now = Date.now(),
  skewMs = 60_000
) => {
  if (tokens == null) {
    return false;
  }
  return isTokenExpired(tokens.expiresAt, now, skewMs);
};

export const getAuthStatus = (input: AuthStatusInput): AuthStatus => {
  if (input.isLoading) {
    return "loading";
  }
  if (!input.hasSession) {
    return "unauthenticated";
  }
  if (input.refreshFailed) {
    return "expired";
  }
  if (input.requiresRefresh) {
    return "refreshing";
  }
  return "authenticated";
};
