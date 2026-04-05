export const PRACTICE_MODAL_I18N_KEYS = {
  title: "copy.practice_modal.title",
  body: "copy.practice_modal.body",
  bullet1: "copy.practice_modal.bullet_1",
  bullet2: "copy.practice_modal.bullet_2",
  bullet3: "copy.practice_modal.bullet_3",
  ctaPrimary: "copy.practice_modal.cta_primary",
  ctaSecondary: "copy.practice_modal.cta_secondary",
  footer: "copy.practice_modal.footer",
  shortTitle: "copy.practice_modal.short_title",
  shortBody: "copy.practice_modal.short_body",
  bannerText: "copy.practice_modal.banner_text",
  bannerCta: "copy.practice_modal.banner_cta",
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
    [PRACTICE_MODAL_I18N_KEYS.body]:
      "앱 내 경험을 준비하기 위한 연습용 안내입니다. 내부 준비 목적일 뿐이며 어떤 제휴나 보증을 의미하지 않습니다.",
    [PRACTICE_MODAL_I18N_KEYS.bullet1]:
      "연습용 안내입니다. 현재 앱 사용에는 변화가 없습니다.",
    [PRACTICE_MODAL_I18N_KEYS.bullet2]:
      "표시는 내부 설정이 활성화된 경우에만 나타납니다.",
    [PRACTICE_MODAL_I18N_KEYS.bullet3]:
      "지금 하실 일은 없습니다.",
    [PRACTICE_MODAL_I18N_KEYS.ctaPrimary]: "확인",
    [PRACTICE_MODAL_I18N_KEYS.ctaSecondary]: "준비 상세 보기",
    [PRACTICE_MODAL_I18N_KEYS.footer]:
      "내부 준비를 위한 연습 안내이며, 제휴나 보증을 의미하지 않습니다.",
    [PRACTICE_MODAL_I18N_KEYS.shortTitle]: "안내: 연습 메시지",
    [PRACTICE_MODAL_I18N_KEYS.shortBody]:
      "내부 준비용 메시지입니다. 제휴나 보증을 의미하지 않습니다.",
    [PRACTICE_MODAL_I18N_KEYS.bannerText]:
      "내부 준비를 위한 연습 메시지 — 제휴나 보증을 의미하지 않습니다. 표시는 내부 설정으로 제어됩니다.",
    [PRACTICE_MODAL_I18N_KEYS.bannerCta]: "닫기",
  },
  en: {
    [PRACTICE_MODAL_I18N_KEYS.title]: "Practice Notice",
    [PRACTICE_MODAL_I18N_KEYS.body]:
      "This is a practice message to prepare our in-app experience. It is for internal readiness only and does not indicate any affiliation or endorsement.",
    [PRACTICE_MODAL_I18N_KEYS.bullet1]:
      "Practice-only message; no changes to your current app.",
    [PRACTICE_MODAL_I18N_KEYS.bullet2]:
      "Live notices appear only when the internal setting is enabled.",
    [PRACTICE_MODAL_I18N_KEYS.bullet3]:
      "Nothing to do right now.",
    [PRACTICE_MODAL_I18N_KEYS.ctaPrimary]: "Got it",
    [PRACTICE_MODAL_I18N_KEYS.ctaSecondary]: "Read prep details",
    [PRACTICE_MODAL_I18N_KEYS.footer]:
      "This is a practice message for internal readiness; it is not an affiliation or endorsement.",
    [PRACTICE_MODAL_I18N_KEYS.shortTitle]: "Heads-up: Practice Message",
    [PRACTICE_MODAL_I18N_KEYS.shortBody]:
      "Internal readiness message. Not an affiliation or endorsement.",
    [PRACTICE_MODAL_I18N_KEYS.bannerText]:
      "Practice message for internal readiness — not an affiliation or endorsement. Live notices appear only in the internal window.",
    [PRACTICE_MODAL_I18N_KEYS.bannerCta]: "Dismiss",
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
