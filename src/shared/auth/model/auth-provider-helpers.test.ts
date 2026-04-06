import { describe, expect, it, vi } from "vitest";
import {
  persistSignedInSession,
  shouldApplyRefreshResult,
} from "@/shared/auth/model/auth-provider-helpers";

describe("auth-provider-helpers", () => {
  it("rolls back persisted auth state when token loading fails after sign-in", async () => {
    const session = { userId: "user-1", displayName: "Tester" };
    const saveSession = vi.fn().mockResolvedValue(session);
    const loadTokens = vi.fn().mockRejectedValue(new Error("token load failed"));
    const rollbackAuthState = vi.fn().mockResolvedValue(undefined);

    await expect(
      persistSignedInSession({
        displayName: "Tester",
        saveSession,
        loadTokens,
        rollbackAuthState,
      })
    ).rejects.toThrow("token load failed");

    expect(saveSession).toHaveBeenCalledWith("Tester");
    expect(loadTokens).toHaveBeenCalledTimes(1);
    expect(rollbackAuthState).toHaveBeenCalledTimes(1);
  });

  it("rolls back persisted auth state when sign-in leaves no usable tokens", async () => {
    const session = { userId: "user-1", displayName: "Tester" };
    const saveSession = vi.fn().mockResolvedValue(session);
    const loadTokens = vi.fn().mockResolvedValue(null);
    const rollbackAuthState = vi.fn().mockResolvedValue(undefined);

    await expect(
      persistSignedInSession({
        displayName: "Tester",
        saveSession,
        loadTokens,
        rollbackAuthState,
      })
    ).rejects.toThrow("missing valid auth tokens");

    expect(saveSession).toHaveBeenCalledWith("Tester");
    expect(loadTokens).toHaveBeenCalledTimes(1);
    expect(rollbackAuthState).toHaveBeenCalledTimes(1);
  });

  it("discards refresh results from a stale session generation", () => {
    expect(shouldApplyRefreshResult({ startedGeneration: 2, currentGeneration: 2 })).toBe(true);
    expect(shouldApplyRefreshResult({ startedGeneration: 2, currentGeneration: 3 })).toBe(false);
  });
});
