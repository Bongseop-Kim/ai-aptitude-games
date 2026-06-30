import { usePathname } from 'expo-router';

import { useDesignSystemTheme } from '../../design-system/provider';
import type { AppTheme } from '../../design-system/theme';

export type TabsFloatingActionRoute = 'interview' | 'reports';

const nativeTabBarReserveToken = 'x14';
const floatingActionLiftToken = 'x4';
const floatingActionButtonHeightToken = 'x14';

export function getTabsFloatingActionRoute(pathname: string): TabsFloatingActionRoute | null {
  if (pathname === '/interview') return 'interview';
  if (pathname === '/reports') return 'reports';
  return null;
}

export function getTabsFloatingActionBottomOffset(theme: AppTheme) {
  return theme.dimension.x[nativeTabBarReserveToken]
    + theme.dimension.x[floatingActionLiftToken]
    + theme.dimension.spacingY.screenBottom;
}

export function getTabsFloatingActionContentBottomReserve(theme: AppTheme) {
  return getTabsFloatingActionBottomOffset(theme)
    + theme.dimension.x[floatingActionButtonHeightToken];
}

export function useTabFloatingActionLayout(hasLocalFloatingAction: boolean) {
  const pathname = usePathname();
  const { theme } = useDesignSystemTheme();
  const hasRouteFloatingAction = getTabsFloatingActionRoute(pathname) != null;
  const hasFloatingAction = hasLocalFloatingAction || hasRouteFloatingAction;
  const bottomOffset = getTabsFloatingActionBottomOffset(theme);

  return {
    bottomOffset,
    contentBottomReserve: hasFloatingAction
      ? getTabsFloatingActionContentBottomReserve(theme)
      : 0,
  };
}
