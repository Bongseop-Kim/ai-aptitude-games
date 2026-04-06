import { describe, expect, it } from "vitest";
import { getAbandonedTrialIndex } from "./nback-session-helpers";

describe("getAbandonedTrialIndex", () => {
  it("returns null before the first playable trial is presented", () => {
    expect(getAbandonedTrialIndex({ hasStarted: false, latestQuestionIndex: 0 })).toBeNull();
    expect(getAbandonedTrialIndex({ hasStarted: true, latestQuestionIndex: 0 })).toBeNull();
    expect(getAbandonedTrialIndex({ hasStarted: true, latestQuestionIndex: null })).toBeNull();
  });

  it("keeps the last presented trial index after play has begun", () => {
    expect(getAbandonedTrialIndex({ hasStarted: true, latestQuestionIndex: 1 })).toBe(1);
    expect(getAbandonedTrialIndex({ hasStarted: true, latestQuestionIndex: 3 })).toBe(3);
  });
});
