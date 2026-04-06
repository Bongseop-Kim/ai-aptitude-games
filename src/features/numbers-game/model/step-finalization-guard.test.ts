import { describe, expect, it } from "vitest";
import {
  resetStepFinalizationLock,
  tryLockStepFinalization,
} from "@/features/numbers-game/model/step-finalization-guard";

describe("step-finalization-guard", () => {
  it("locks only the first finalize attempt until reset", () => {
    const lock = { current: false };

    expect(tryLockStepFinalization(lock)).toBe(true);
    expect(tryLockStepFinalization(lock)).toBe(false);

    resetStepFinalizationLock(lock);

    expect(tryLockStepFinalization(lock)).toBe(true);
  });
});
