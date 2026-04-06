import { describe, expect, it } from "vitest";
import {
  getAuthStatus,
  isTokenExpired,
  shouldRefreshToken,
  type AuthStatus,
} from "./auth-session";
import type { AuthTokens } from "./auth-types";

const sampleTokens: AuthTokens = {
  accessToken: "access-1",
  refreshToken: "refresh-1",
  expiresAt: 2_000_000,
  tokenType: "Bearer",
  serverUserId: "server-user-1",
};

describe("auth-session model", () => {
  it("detects expired tokens", () => {
    expect(isTokenExpired(2_000_000, 2_100_000, 0)).toBe(true);
    expect(isTokenExpired(2_000_000, 1_900_000, 0)).toBe(false);
  });

  it("requires refresh when token is near expiry", () => {
    expect(shouldRefreshToken(sampleTokens, 1_950_000, 60_000)).toBe(true);
    expect(shouldRefreshToken(sampleTokens, 1_000_000, 60_000)).toBe(false);
    expect(shouldRefreshToken(null, 1_000_000, 60_000)).toBe(false);
  });

  it("returns expected auth status for loading/authenticated/refreshing/expired/unauthenticated", () => {
    const statuses: AuthStatus[] = [
      getAuthStatus({
        isLoading: true,
        hasSession: false,
        requiresRefresh: false,
        refreshFailed: false,
      }),
      getAuthStatus({
        isLoading: false,
        hasSession: true,
        requiresRefresh: false,
        refreshFailed: false,
      }),
      getAuthStatus({
        isLoading: false,
        hasSession: true,
        requiresRefresh: true,
        refreshFailed: false,
      }),
      getAuthStatus({
        isLoading: false,
        hasSession: true,
        requiresRefresh: true,
        refreshFailed: true,
      }),
      getAuthStatus({
        isLoading: false,
        hasSession: false,
        requiresRefresh: false,
        refreshFailed: false,
      }),
    ];

    expect(statuses).toEqual([
      "loading",
      "authenticated",
      "refreshing",
      "expired",
      "unauthenticated",
    ]);
  });
});
