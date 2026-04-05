import { beforeEach, describe, expect, it, vi } from "vitest";

const { execSyncMock, getFirstSyncMock, runSyncMock } = vi.hoisted(() => ({
  execSyncMock: vi.fn(),
  getFirstSyncMock: vi.fn(),
  runSyncMock: vi.fn(),
}));

vi.mock("@/shared/db/client", () => ({
  expo: {
    execSync: execSyncMock,
    getFirstSync: getFirstSyncMock,
    runSync: runSyncMock,
  },
}));

import {
  clearAuthTokens,
  loadAuthTokens,
  saveAuthTokens,
  type AuthTokens,
} from "./token-store";

describe("token-store", () => {
  beforeEach(() => {
    execSyncMock.mockReset();
    getFirstSyncMock.mockReset();
    runSyncMock.mockReset();
  });

  it("returns null when there are no stored tokens", async () => {
    getFirstSyncMock.mockReturnValueOnce(null);

    const tokens = await loadAuthTokens();

    expect(tokens).toBeNull();
  });

  it("loads stored tokens from sqlite", async () => {
    getFirstSyncMock.mockReturnValueOnce({
      access_token: "access-1",
      refresh_token: "refresh-1",
      expires_at: 12345,
      token_type: "Bearer",
      server_user_id: "server-user-1",
    });

    const tokens = await loadAuthTokens();

    expect(tokens).toEqual<AuthTokens>({
      accessToken: "access-1",
      refreshToken: "refresh-1",
      expiresAt: 12345,
      tokenType: "Bearer",
      serverUserId: "server-user-1",
    });
  });

  it("saves tokens with upsert semantics", async () => {
    const payload: AuthTokens = {
      accessToken: "access-2",
      refreshToken: "refresh-2",
      expiresAt: 56789,
      tokenType: "Bearer",
      serverUserId: "server-user-2",
    };

    await saveAuthTokens(payload);

    expect(runSyncMock).toHaveBeenCalledWith(
      expect.stringContaining("ON CONFLICT(session_key)"),
      expect.any(String),
      "access-2",
      "refresh-2",
      56789,
      "Bearer",
      "server-user-2",
      expect.any(Number),
      expect.any(Number)
    );
  });

  it("clears the stored token row", async () => {
    await clearAuthTokens();

    expect(runSyncMock).toHaveBeenCalledWith(
      expect.stringContaining("DELETE FROM"),
      expect.any(String)
    );
  });
});
