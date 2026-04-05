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

function parseConfig(value: FlagValues): PracticeModalConfig | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as PracticeModalConfig;
    return parsed;
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
      flags: {},
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
): boolean {
  const settings = getPracticeModalSettings(now);
  if (settings.enabled) {
    return true;
  }

  const configValue = getPracticeModalConfigEnv();
  const hasConfig =
    configValue != null && parseConfig(configValue) !== null;
  if (hasConfig) {
    return false;
  }

  return toBooleanValue(flagValue);
}
