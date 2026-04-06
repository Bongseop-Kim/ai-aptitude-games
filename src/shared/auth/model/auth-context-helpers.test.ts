import { describe, expect, it, vi } from "vitest";
import {
  buildBootstrapFailureState,
  buildRefreshFailureState,
  cleanupDiscardedRefreshResult,
  clearPersistedAuthStateBestEffort,
} from "@/shared/auth/model/auth-context-helpers";

describe("auth-context-helpers", () => {
  it("preserves the stored session when bootstrap refresh fails", () => {
    const storedSession = {
      userId: "user-1",
      displayName: "Tester",
      createdAt: "2026-04-06T00:00:00.000Z",
    };

    expect(buildBootstrapFailureState(storedSession)).toEqual({
      storedSession,
      hasValidToken: false,
      didRefreshFail: true,
    });
  });

  it("preserves the current session when refresh fails for the current generation", () => {
    const session = {
      userId: "user-1",
      displayName: "Tester",
      createdAt: "2026-04-06T00:00:00.000Z",
    };

    expect(
      buildRefreshFailureState({
        session,
        startedGeneration: 2,
        currentGeneration: 2,
      })
    ).toEqual({
      session,
      hasValidAccessToken: false,
      refreshFailed: true,
    });

    expect(
      buildRefreshFailureState({
        session,
        startedGeneration: 2,
        currentGeneration: 3,
      })
    ).toBeNull();
  });

  it("cleans up persisted auth state when a saved refresh result is discarded", async () => {
    const clearPersistedAuthState = vi.fn<() => Promise<void>>().mockResolvedValue();
    const logError = vi.fn();

    await expect(
      cleanupDiscardedRefreshResult({
        startedGeneration: 2,
        currentGeneration: 3,
        clearPersistedAuthState,
        logError,
        context: "refreshIfNeeded",
      })
    ).resolves.toBe(true);

    expect(clearPersistedAuthState).toHaveBeenCalledTimes(1);
    expect(logError).not.toHaveBeenCalled();
  });

  it("skips persisted auth cleanup when the refresh result still belongs to the current generation", async () => {
    const clearPersistedAuthState = vi.fn<() => Promise<void>>().mockResolvedValue();
    const logError = vi.fn();

    await expect(
      cleanupDiscardedRefreshResult({
        startedGeneration: 2,
        currentGeneration: 2,
        clearPersistedAuthState,
        logError,
        context: "refreshIfNeeded",
      })
    ).resolves.toBe(false);

    expect(clearPersistedAuthState).not.toHaveBeenCalled();
    expect(logError).not.toHaveBeenCalled();
  });

  it("swallows persisted cleanup failures after logging", async () => {
    const clearPersistedAuthState = vi
      .fn<() => Promise<void>>()
      .mockRejectedValue(new Error("delete failed"));
    const logError = vi.fn();

    await expect(
      clearPersistedAuthStateBestEffort({
        clearPersistedAuthState,
        logError,
        context: "bootstrap",
      })
    ).resolves.toBeUndefined();

    expect(clearPersistedAuthState).toHaveBeenCalledTimes(1);
    expect(logError).toHaveBeenCalledWith(
      "bootstrap: failed to clear persisted auth state",
      expect.any(Error)
    );
  });
});
