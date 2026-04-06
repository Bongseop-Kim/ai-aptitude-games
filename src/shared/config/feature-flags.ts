const TRUTHY_VALUES = new Set(["1", "true", "yes", "on"]);

export const PRACTICE_MODAL_FLAG_ENV_KEY = "EXPO_PUBLIC_FLAG_PRACTICE_MODAL";
export const PRACTICE_MODAL_CONFIG_ENV_KEY = "EXPO_PUBLIC_PRACTICE_MODAL_CONFIG";

export type PracticeModalVariant = "v1" | "v2" | "v3";

export type PracticeModalWindowSpec = {
  start?: string;
  end?: string;
  at?: string;
};

export type PracticeModalWindows = {
  timezone?: string;
  t0?: PracticeModalWindowSpec;
  t3?: PracticeModalWindowSpec;
  t7?: PracticeModalWindowSpec;
};

type PracticeModalFlagConfig = {
  "app.delivery.t0_enabled"?: boolean;
  "ui.modals.whats_new_enabled"?: boolean;
  "comms.waitlist_batch_enabled"?: boolean;
  "app.delivery.rollback_enabled"?: boolean;
};

export type PracticeModalConfig = {
  flags?: PracticeModalFlagConfig;
  practice_modal?: {
    variant?: PracticeModalVariant;
    windows?: PracticeModalWindows;
  };
};

export type PracticeModalSettings = {
  enabled: boolean;
  variant: PracticeModalVariant;
  windows: PracticeModalWindows;
  flags: PracticeModalFlagConfig;
};

type FlagValues = string | undefined;

const getPracticeModalConfigEnv = () => process.env.EXPO_PUBLIC_PRACTICE_MODAL_CONFIG;
const getPracticeModalFlagEnv = () => process.env.EXPO_PUBLIC_FLAG_PRACTICE_MODAL;

const DEFAULT_PRACTICE_MODAL_SETTINGS: Omit<
  PracticeModalSettings,
  "enabled"
> = {
  variant: "v1",
  windows: {},
  flags: {},
};

function toBooleanValue(raw: FlagValues): boolean {
  if (raw == null) {
    return false;
  }

  return TRUTHY_VALUES.has(raw.trim().toLowerCase());
}

function parseDate(value?: string): Date | null {
  if (!value) {
    return null;
  }
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) {
    return null;
  }
  return new Date(parsed);
}

function isWithinAtWindow(now: Date, windowSpec: PracticeModalWindowSpec): boolean {
  const start = parseDate(windowSpec.at);
  if (!start) {
    return false;
  }

  const defaultAtWindowMinutes = 60;
  const end = new Date(start.getTime() + defaultAtWindowMinutes * 60 * 1000);
  return now.getTime() >= start.getTime() && now.getTime() <= end.getTime();
}

function isWithinRangeWindow(
  now: Date,
  windowSpec: PracticeModalWindowSpec
): boolean {
  const start = parseDate(windowSpec.start);
  const end = parseDate(windowSpec.end);
  if (!start || !end) {
    return isWithinAtWindow(now, windowSpec);
  }
  return now.getTime() >= start.getTime() && now.getTime() <= end.getTime();
}

function isWithinPracticeModalWindow(
  now: Date,
  windows?: PracticeModalWindows
): boolean {
  if (!windows) {
    return false;
  }

  // t0 can span a launch window, while t3/t7 are evaluated as reminder points.
  if (windows.t0 && isWithinRangeWindow(now, windows.t0)) {
    return true;
  }
  if (windows.t3 && isWithinAtWindow(now, windows.t3)) {
    return true;
  }
  if (windows.t7 && isWithinAtWindow(now, windows.t7)) {
    return true;
  }

  return false;
}

function isPracticeModalWindowSpec(value: unknown): value is PracticeModalWindowSpec {
  if (value == null || typeof value !== "object") {
    return false;
  }

  const candidate = value as PracticeModalWindowSpec;
  return (
    (candidate.start === undefined || typeof candidate.start === "string") &&
    (candidate.end === undefined || typeof candidate.end === "string") &&
    (candidate.at === undefined || typeof candidate.at === "string")
  );
}

function isPracticeModalWindows(value: unknown): value is PracticeModalWindows {
  if (value == null || typeof value !== "object") {
    return false;
  }

  const candidate = value as PracticeModalWindows;
  return (
    (candidate.timezone === undefined || typeof candidate.timezone === "string") &&
    (candidate.t0 === undefined || isPracticeModalWindowSpec(candidate.t0)) &&
    (candidate.t3 === undefined || isPracticeModalWindowSpec(candidate.t3)) &&
    (candidate.t7 === undefined || isPracticeModalWindowSpec(candidate.t7))
  );
}

function isPracticeModalFlagConfig(value: unknown): value is PracticeModalFlagConfig {
  if (value == null || typeof value !== "object") {
    return false;
  }

  return Object.values(value).every((flag) => typeof flag === "boolean");
}

function isPracticeModalConfig(value: unknown): value is PracticeModalConfig {
  if (value == null || typeof value !== "object") {
    return false;
  }

  const candidate = value as PracticeModalConfig;
  const practiceModal = candidate.practice_modal;

  return (
    (candidate.flags === undefined || isPracticeModalFlagConfig(candidate.flags)) &&
    (practiceModal === undefined ||
      (practiceModal != null &&
        typeof practiceModal === "object" &&
        (practiceModal.variant === undefined ||
          practiceModal.variant === "v1" ||
          practiceModal.variant === "v2" ||
          practiceModal.variant === "v3") &&
        (practiceModal.windows === undefined ||
          isPracticeModalWindows(practiceModal.windows))))
  );
}

function parseConfig(value: FlagValues): PracticeModalConfig | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value);
    return isPracticeModalConfig(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function normalizePracticeModalSettings(
  now: Date,
  configValue: FlagValues = getPracticeModalConfigEnv()
): PracticeModalSettings {
  const parsedConfig = parseConfig(configValue);
  if (!parsedConfig) {
    return {
      ...DEFAULT_PRACTICE_MODAL_SETTINGS,
      enabled: false,
    };
  }

  const flags = parsedConfig.flags ?? {};
  const windows = parsedConfig.practice_modal?.windows ?? {};
  const variant =
    parsedConfig.practice_modal?.variant === "v2" ||
    parsedConfig.practice_modal?.variant === "v3"
      ? parsedConfig.practice_modal.variant
      : "v1";

  const t0Enabled = flags["app.delivery.t0_enabled"] === true;
  const uiModalEnabled = flags["ui.modals.whats_new_enabled"] === true;
  const commsEnabled = flags["comms.waitlist_batch_enabled"] === true;
  const rollbackEnabled = flags["app.delivery.rollback_enabled"] === true;
  const inWindow = isWithinPracticeModalWindow(now, windows);

  return {
    ...DEFAULT_PRACTICE_MODAL_SETTINGS,
    enabled:
      t0Enabled &&
      uiModalEnabled &&
      commsEnabled &&
      !rollbackEnabled &&
      inWindow,
    variant,
    windows,
    flags,
  };
}

export function getPracticeModalSettings(
  now: Date = new Date(),
  configValue?: FlagValues
): PracticeModalSettings {
  if (configValue !== undefined) {
    return normalizePracticeModalSettings(now, configValue);
  }
  const configEnv = getPracticeModalConfigEnv();
  const parsedConfig = parseConfig(configEnv);
  if (parsedConfig) {
    return normalizePracticeModalSettings(now, configEnv);
  }
  return {
    ...DEFAULT_PRACTICE_MODAL_SETTINGS,
    enabled: toBooleanValue(getPracticeModalFlagEnv()),
    flags: {},
    windows: {},
  };
}

export function isPracticeModalEnabled(
  flagValue: FlagValues = getPracticeModalFlagEnv(),
  now: Date = new Date(),
  configValue: FlagValues = getPracticeModalConfigEnv()
): boolean {
  const settings = getPracticeModalSettings(now, configValue);
  if (settings.enabled) {
    return true;
  }

  const hasConfig =
    configValue != null && parseConfig(configValue) !== null;
  if (hasConfig) {
    return false;
  }

  return toBooleanValue(flagValue);
}
