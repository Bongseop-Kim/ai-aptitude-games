export const PRACTICE_MODAL_I18N_KEYS = {
  title: "practice_modal.title",
  description: "practice_modal.description",
  primaryAction: "practice_modal.primary_action",
} as const;

type PracticeModalCopyKey =
  (typeof PRACTICE_MODAL_I18N_KEYS)[keyof typeof PRACTICE_MODAL_I18N_KEYS];
type PracticeModalLocale = "ko" | "en";

const PRACTICE_MODAL_COPY: Record<
  PracticeModalLocale,
  Record<PracticeModalCopyKey, string>
> = {
  ko: {
    [PRACTICE_MODAL_I18N_KEYS.title]: "연습 안내",
    [PRACTICE_MODAL_I18N_KEYS.description]:
      "내부 준비를 위한 연습 안내입니다. 제휴·후원·공식 연관을 의미하지 않습니다.",
    [PRACTICE_MODAL_I18N_KEYS.primaryAction]: "확인",
  },
  en: {
    [PRACTICE_MODAL_I18N_KEYS.title]: "Practice Notice",
    [PRACTICE_MODAL_I18N_KEYS.description]:
      "This is a practice message for internal readiness. It does not imply any affiliation or endorsement.",
    [PRACTICE_MODAL_I18N_KEYS.primaryAction]: "Got it",
  },
};

export function getPracticeModalCopy(
  key: PracticeModalCopyKey,
  locale: string = "ko"
): string {
  const normalizedLocale = locale.toLowerCase();
  const resolvedLocale: PracticeModalLocale =
    normalizedLocale === "en" ? "en" : "ko";

  return PRACTICE_MODAL_COPY[resolvedLocale][key];
}
