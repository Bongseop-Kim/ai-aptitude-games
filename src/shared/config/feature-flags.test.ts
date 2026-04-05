import { describe, expect, it } from "vitest";

import { isPracticeModalEnabled } from "./feature-flags";

describe("feature-flags", () => {
  const prevFlagEnv = process.env.EXPO_PUBLIC_FLAG_PRACTICE_MODAL;
  const prevConfigEnv = process.env.EXPO_PUBLIC_PRACTICE_MODAL_CONFIG;

  afterEach(() => {
    process.env.EXPO_PUBLIC_FLAG_PRACTICE_MODAL = prevFlagEnv;
    process.env.EXPO_PUBLIC_PRACTICE_MODAL_CONFIG = prevConfigEnv;
  });

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

  it("supports full practice modal config with variant and windows", () => {
    process.env.EXPO_PUBLIC_PRACTICE_MODAL_CONFIG =
      JSON.stringify({
        flags: {
          "app.delivery.t0_enabled": true,
          "ui.modals.whats_new_enabled": true,
          "comms.waitlist_batch_enabled": true,
          "app.delivery.rollback_enabled": false,
        },
        practice_modal: {
          variant: "v3",
          windows: {
            t0: {
              start: "2026-04-07T01:00:00Z",
              end: "2026-04-07T03:00:00Z",
            },
          },
        },
      });

    expect(isPracticeModalEnabled(undefined, new Date("2026-04-07T01:30:00Z"))).toBe(
      true
    );
    expect(isPracticeModalEnabled(undefined, new Date("2026-04-07T04:00:00Z"))).toBe(
      false
    );
  });
});
