import { describe, expect, it, vi } from "vitest";
import {
  buildBootstrapFailureState,
  buildRefreshFailureState,
  clearPersistedAuthStateBestEffort,
} from "@/shared/auth/model/auth-context-helpers";

describe("auth-context-helpers", () => {
  it("returns a safe bootstrap fallback state", () => {
    expect(buildBootstrapFailureState()).toEqual({
      storedSession: null,
      hasValidToken: false,
      didRefreshFail: true,
    });
  });

  it("returns refresh cleanup state only for the current session generation", () => {
    expect(
      buildRefreshFailureState({
        startedGeneration: 2,
        currentGeneration: 2,
      })
    ).toEqual({
      session: null,
      hasValidAccessToken: false,
      refreshFailed: true,
    });

    expect(
      buildRefreshFailureState({
        startedGeneration: 2,
        currentGeneration: 3,
      })
    ).toBeNull();
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
