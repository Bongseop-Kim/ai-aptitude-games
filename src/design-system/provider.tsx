import {
  createContext,
  use,
  useMemo,
  type PropsWithChildren,
} from 'react';
import { useColorScheme } from 'react-native';

import { appThemes } from './theme';
import { useAppFonts } from './fonts';
import type { AppTheme } from './theme';
import type { AppThemeMode } from './foundation/types';

type DesignSystemContextValue = {
  fontFamily?: ReturnType<typeof useAppFonts>['fontFamily'];
  fontsLoaded: boolean;
  mode: AppThemeMode;
  theme: AppTheme;
};

const DesignSystemContext = createContext<DesignSystemContextValue | null>(null);

type DesignSystemProviderProps = PropsWithChildren<{
  mode?: AppThemeMode;
}>;

export function DesignSystemProvider({ children, mode }: DesignSystemProviderProps) {
  const systemMode = useColorScheme();
  const { fontFamily, fontsLoaded } = useAppFonts();
  const resolvedMode = mode ?? (systemMode === 'dark' ? 'dark' : 'light');

  const value = useMemo(
    () => ({
      fontFamily,
      fontsLoaded,
      mode: resolvedMode,
      theme: appThemes[resolvedMode],
    }),
    [fontFamily, fontsLoaded, resolvedMode],
  );

  return (
    <DesignSystemContext.Provider value={value}>
      {children}
    </DesignSystemContext.Provider>
  );
}

export function useDesignSystemTheme() {
  const value = use(DesignSystemContext);

  if (!value) {
    throw new Error('useDesignSystemTheme must be used within DesignSystemProvider.');
  }

  return value;
}
