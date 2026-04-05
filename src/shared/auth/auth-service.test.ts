import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  execSyncMock,
  getFirstSyncMock,
  runSyncMock,
  emitAuthTelemetryEventMock,
  fetchMock,
} = vi.hoisted(() => ({
  execSyncMock: vi.fn(),
  getFirstSyncMock: vi.fn(),
  runSyncMock: vi.fn(),
  emitAuthTelemetryEventMock: vi.fn(),
  fetchMock: vi.fn(),
}));

vi.mock("@/shared/db/client", () => ({
  expo: {
    execSync: execSyncMock,
    getFirstSync: getFirstSyncMock,
    runSync: runSyncMock,
  },
}));

vi.mock("@/shared/lib/auth-telemetry", () => ({
  emitAuthTelemetryEvent: emitAuthTelemetryEventMock,
}));

import {
  bootstrapAuthSession,
  clearAuthSession,
  saveAuthSession,
} from "./auth-service";

describe("auth-service telemetry instrumentation", () => {
  beforeEach(() => {
    process.env.EXPO_PUBLIC_API_BASE_URL = "http://localhost:4000";
    vi.stubGlobal("fetch", fetchMock);
    execSyncMock.mockReset();
    getFirstSyncMock.mockReset();
    runSyncMock.mockReset();
    emitAuthTelemetryEventMock.mockReset();
    fetchMock.mockReset();
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        userId: "server-user-1",
        displayName: "New User",
      }),
    } as Response);
  });

  it("emits auth_restored when an existing session is restored", async () => {
    getFirstSyncMock.mockReturnValueOnce({
      user_id: "user-restored",
      display_name: "Restored User",
    });

    const session = await bootstrapAuthSession();

    expect(session).toMatchObject({
      userId: "user-restored",
      displayName: "Restored User",
    });
    expect(emitAuthTelemetryEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "auth_restored",
        userId: "user-restored",
      })
    );
  });

  it("emits auth_signed_in when signIn session is saved", async () => {
    const session = await saveAuthSession("  New User  ");

    expect(session.userId).toBe("server-user-1");
    expect(session.displayName).toBe("New User");
    expect(runSyncMock).toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(emitAuthTelemetryEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "auth_signed_in",
        userId: "server-user-1",
      })
    );
  });

  it("prefers serverUserId for session and telemetry when provided", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        userId: "legacy-user-id",
        serverUserId: "server-user-preferred",
        displayName: "Server Preferred User",
      }),
    } as Response);

    const session = await saveAuthSession("Server Preferred User");

    expect(session.userId).toBe("server-user-preferred");
    expect(runSyncMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      "server-user-preferred",
      expect.any(String),
      expect.any(Number),
      expect.any(Number)
    );
    expect(emitAuthTelemetryEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "auth_signed_in",
        userId: "server-user-preferred",
      })
    );
  });

  it("retries twice on 5xx and then succeeds", async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: async () => ({}),
      } as Response)
      .mockResolvedValueOnce({
        ok: false,
        status: 502,
        json: async () => ({}),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          userId: "server-user-retry",
          displayName: "Retry User",
        }),
      } as Response);

    const session = await saveAuthSession("Retry User");

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(session.userId).toBe("server-user-retry");
  });

  it("throws offline error when fetch fails without response", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("Network request failed"));

    await expect(saveAuthSession("Offline User")).rejects.toEqual(
      expect.objectContaining({
        code: "offline",
      })
    );
    expect(runSyncMock).not.toHaveBeenCalled();
  });

  it("emits auth_signed_out with prior user when clearing a session", async () => {
    getFirstSyncMock.mockReturnValueOnce({
      user_id: "user-signout",
      display_name: "Signout User",
    });

    await clearAuthSession();

    expect(runSyncMock).toHaveBeenCalled();
    expect(emitAuthTelemetryEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "auth_signed_out",
        userId: "user-signout",
      })
    );
  });
});
