import { describe, expect, it } from "vitest";

import { isPracticeModalEnabled } from "./feature-flags";

describe("feature-flags", () => {
  it("returns false by default", () => {
    expect(isPracticeModalEnabled(undefined)).toBe(false);
  });

  it("accepts truthy values", () => {
    expect(isPracticeModalEnabled("1")).toBe(true);
    expect(isPracticeModalEnabled("true")).toBe(true);
    expect(isPracticeModalEnabled("TRUE")).toBe(true);
    expect(isPracticeModalEnabled(" yes ")).toBe(true);
  });

  it("rejects non-truthy values", () => {
    expect(isPracticeModalEnabled("0")).toBe(false);
    expect(isPracticeModalEnabled("false")).toBe(false);
    expect(isPracticeModalEnabled("off")).toBe(false);
    expect(isPracticeModalEnabled("")).toBe(false);
  });
});
