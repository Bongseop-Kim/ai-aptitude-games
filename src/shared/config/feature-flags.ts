const TRUTHY_VALUES = new Set(["1", "true", "yes", "on"]);
const PRACTICE_MODAL_FLAG_KEYS = [
  "app.delivery.t0_enabled",
  "ui.modals.whats_new_enabled",
  "comms.waitlist_batch_enabled",
  "app.delivery.rollback_enabled",
] as const;
const PRACTICE_MODAL_FLAG_KEY_SET = new Set<string>(PRACTICE_MODAL_FLAG_KEYS);
const ISO_TIMEZONE_SUFFIX_PATTERN = /(z|[+-]\d{2}:\d{2}|[+-]\d{4})$/i;

export const PRACTICE_MODAL_FLAG_ENV_KEY = "EXPO_PUBLIC_FLAG_PRACTICE_MODAL";
export const PRACTICE_MODAL_CONFIG_ENV_KEY = "EXPO_PUBLIC_PRACTICE_MODAL_CONFIG";
export const DEFAULT_AT_WINDOW_MINUTES = 60;

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

type DateParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
};

function hasExplicitTimezone(value: string): boolean {
  return ISO_TIMEZONE_SUFFIX_PATTERN.test(value);
}

function parseDateParts(value: string): DateParts | null {
  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2})(?::(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?)?)?$/
  );
  if (!match) {
    return null;
  }

  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
    hour: Number(match[4] ?? "0"),
    minute: Number(match[5] ?? "0"),
    second: Number(match[6] ?? "0"),
    millisecond: Number((match[7] ?? "0").padEnd(3, "0")),
  };
}

function toUtcTimestamp(parts: DateParts): number {
  return Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
    parts.millisecond
  );
}

function getTimeZoneParts(date: Date, timeZone: string): DateParts | null {
  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).formatToParts(date);

    const lookup = new Map(parts.map((part) => [part.type, part.value]));
    return {
      year: Number(lookup.get("year")),
      month: Number(lookup.get("month")),
      day: Number(lookup.get("day")),
      hour: Number(lookup.get("hour")) % 24,
      minute: Number(lookup.get("minute")),
      second: Number(lookup.get("second")),
      millisecond: 0,
    };
  } catch {
    return null;
  }
}

function parseDateInTimeZone(value: string, timeZone?: string): Date | null {
  if (!timeZone || hasExplicitTimezone(value)) {
    return parseDate(value);
  }

  const parts = parseDateParts(value);
  if (!parts) {
    return parseDate(value);
  }

  let timestamp = toUtcTimestamp(parts);
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const zonedParts = getTimeZoneParts(new Date(timestamp), timeZone);
    if (!zonedParts) {
      return parseDate(value);
    }

    const diffMs = toUtcTimestamp(parts) - toUtcTimestamp(zonedParts);
    if (diffMs === 0) {
      return new Date(timestamp);
    }
    timestamp += diffMs;
  }

  return new Date(timestamp);
}

function isWithinAtWindow(
  now: Date,
  windowSpec: PracticeModalWindowSpec,
  timeZone?: string
): boolean {
  const start = parseDateInTimeZone(windowSpec.at ?? "", timeZone);
  if (!start) {
    return false;
  }

  const end = new Date(start.getTime() + DEFAULT_AT_WINDOW_MINUTES * 60 * 1000);
  return now.getTime() >= start.getTime() && now.getTime() <= end.getTime();
}

function isWithinRangeWindow(
  now: Date,
  windowSpec: PracticeModalWindowSpec,
  timeZone?: string
): boolean {
  const start = parseDateInTimeZone(windowSpec.start ?? "", timeZone);
  const end = parseDateInTimeZone(windowSpec.end ?? "", timeZone);
  if (!start || !end) {
    return isWithinAtWindow(now, windowSpec, timeZone);
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
  const timeZone = windows.timezone;

  // t0 can span a launch window, while t3/t7 are evaluated as reminder points.
  if (windows.t0 && isWithinRangeWindow(now, windows.t0, timeZone)) {
    return true;
  }
  if (windows.t3 && isWithinAtWindow(now, windows.t3, timeZone)) {
    return true;
  }
  if (windows.t7 && isWithinAtWindow(now, windows.t7, timeZone)) {
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

  const entries = Object.entries(value);
  return entries.every(
    ([key, flag]) =>
      PRACTICE_MODAL_FLAG_KEY_SET.has(key) && typeof flag === "boolean"
  );
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
  parsedConfig: PracticeModalConfig | null
): PracticeModalSettings {
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
    return normalizePracticeModalSettings(now, parseConfig(configValue));
  }
  const configEnv = getPracticeModalConfigEnv();
  const parsedConfig = parseConfig(configEnv);
  if (parsedConfig) {
    return normalizePracticeModalSettings(now, parsedConfig);
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
