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
      getPracticeModalCopy(PRACTICE_MODAL_I18N_KEYS.ctaPrimary, "en")
    ).toBe("Got it");
  });

  it("falls back to Korean when locale is missing", () => {
    expect(
      getPracticeModalCopy(PRACTICE_MODAL_I18N_KEYS.body, "ja")
    ).toBe(
      "앱 내 경험을 준비하기 위한 연습용 안내입니다. 내부 준비 목적일 뿐이며 어떤 제휴나 보증을 의미하지 않습니다."
    );
  });
});
