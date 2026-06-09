import type { DeepPartial, ShadowToken, TimingFunctionToken } from './types';

export function toTimingFunction(css: string): TimingFunctionToken {
  const bezier = css
    .match(/-?\d*\.?\d+/g)
    ?.map((value) => Number(value)) as
    | [number, number, number, number]
    | undefined;

  if (!bezier || bezier.length !== 4) {
    throw new Error(`Cannot parse timing function token: ${css}`);
  }

  return { css, bezier };
}

export function toShadow(
  offsetX: number,
  offsetY: number,
  blurRadius: number,
  color: string,
  opacity = 1,
): ShadowToken {
  return {
    shadowColor: color,
    shadowOffset: { width: offsetX, height: offsetY },
    shadowOpacity: opacity,
    shadowRadius: blurRadius,
    elevation: Math.max(1, Math.round(blurRadius / 2)),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function deepMerge<T>(base: T, overrides?: DeepPartial<T>): T {
  if (overrides === undefined) return base;
  if (!isRecord(base) || !isRecord(overrides)) return overrides as T;

  const merged: Record<string, unknown> = { ...base };

  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) continue;
    merged[key] = deepMerge(merged[key], value as DeepPartial<unknown>);
  }

  return merged as T;
}
