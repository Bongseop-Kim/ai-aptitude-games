const TRUTHY_VALUES = new Set(["1", "true", "yes", "on"]);

export const PRACTICE_MODAL_FLAG_ENV_KEY = "EXPO_PUBLIC_FLAG_PRACTICE_MODAL";

export function isPracticeModalEnabled(flagValue = process.env.EXPO_PUBLIC_FLAG_PRACTICE_MODAL): boolean {
  if (!flagValue) {
    return false;
  }

  return TRUTHY_VALUES.has(flagValue.trim().toLowerCase());
}
