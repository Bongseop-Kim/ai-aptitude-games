import { buildFoundation, createTokenReference } from './foundation';
import { deepMerge } from './foundation/utils';
import type { AppThemeMode, DeepPartial } from './foundation';

function buildAppTheme(mode: AppThemeMode) {
  const foundation = buildFoundation(mode);

  return {
    ...foundation,
    reference: createTokenReference(foundation),
  };
}

export type AppTheme = ReturnType<typeof buildAppTheme>;
export type AppThemeOverrides = DeepPartial<Omit<AppTheme, 'mode' | 'reference'>> & {
  reference?: Partial<AppTheme['reference']>;
};
export type AppThemeModeOverrides = Partial<Record<AppThemeMode, AppThemeOverrides>>;

export function createAppTheme(mode: AppThemeMode, overrides?: AppThemeOverrides): AppTheme {
  const baseTheme = buildAppTheme(mode);
  const theme = deepMerge(baseTheme, overrides);

  return {
    ...theme,
    mode,
    reference: {
      ...createTokenReference(theme),
      ...overrides?.reference,
    } as AppTheme['reference'],
  };
}

export function createAppThemes(overrides: AppThemeModeOverrides = {}) {
  return {
    light: createAppTheme('light', overrides.light),
    dark: createAppTheme('dark', overrides.dark),
  };
}

export const appThemes = createAppThemes();
