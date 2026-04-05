import { describe, expect, it } from "vitest";

import {
  PRACTICE_MODAL_I18N_KEYS,
  getPracticeModalCopy,
} from "./practice-modal-copy";

describe("practice-modal-copy", () => {
  it("returns Korean copy by default", () => {
    expect(getPracticeModalCopy(PRACTICE_MODAL_I18N_KEYS.title)).toBe(
      "연습 안내"
    );
  });

  it("returns requested locale when available", () => {
    expect(
      getPracticeModalCopy(PRACTICE_MODAL_I18N_KEYS.primaryAction, "en")
    ).toBe("Got it");
  });

  it("falls back to Korean when locale is missing", () => {
    expect(
      getPracticeModalCopy(PRACTICE_MODAL_I18N_KEYS.description, "ja")
    ).toBe(
      "내부 준비를 위한 연습 안내입니다. 제휴·후원·공식 연관을 의미하지 않습니다."
    );
  });
});
