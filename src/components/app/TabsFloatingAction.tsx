import { useLayoutEffect, useState } from 'react';
import { usePathname, useRouter } from 'expo-router';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Float } from '../../design-system/components/Float';
import { useDesignSystemTheme } from '../../design-system/provider';
import { FloatingActionButton } from '../ui/FloatingActionButton';
import {
  getTabsFloatingActionBottomOffset,
  getTabsFloatingActionRoute,
  type TabsFloatingActionRoute,
} from './tabsFloatingActionLayout';

type FloatingActionRoute = {
  accessibilityLabel: string;
  onPress: () => void;
};

export function TabsFloatingAction() {
  const pathname = usePathname();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useDesignSystemTheme();
  const route = getTabsFloatingActionRoute(pathname);
  const [visibleRoute, setVisibleRoute] = useState<TabsFloatingActionRoute | null>(route);
  if (route && route !== visibleRoute) {
    setVisibleRoute(route);
  }

  const displayedRoute = route ?? visibleRoute;
  const action = displayedRoute ? floatingActionRoute(displayedRoute, router) : null;
  const bottomOffset = getTabsFloatingActionBottomOffset(theme);
  const progress = useSharedValue(route ? 1 : 0);
  const hiddenTranslateY = theme.dimension.x.x3;
  const animatedStyle = useAnimatedStyle(() => {
    const currentProgress = progress.get();

    return {
      opacity: currentProgress,
      transform: [{ translateY: (1 - currentProgress) * hiddenTranslateY }],
    };
  });

  useLayoutEffect(() => {
    progress.set(
      withTiming(route ? 1 : 0, {
        duration: route ? theme.duration.d3 : theme.duration.d2,
      }),
    );
  }, [progress, route, theme.duration.d2, theme.duration.d3]);

  if (!action) return null;

  return (
    <Float
      placement="bottom-end"
      offsetX={insets.right + theme.dimension.spacingX.globalGutter}
      offsetY={bottomOffset}
      pointerEvents={route ? 'box-none' : 'none'}
      zIndex={2}
    >
      <Animated.View
        accessibilityElementsHidden={!route}
        importantForAccessibility={route ? 'auto' : 'no-hide-descendants'}
        pointerEvents={route ? 'auto' : 'none'}
        style={animatedStyle}
      >
        <FloatingActionButton
          label="시작하기"
          accessibilityLabel={action.accessibilityLabel}
          icon="Plus"
          onPress={action.onPress}
        />
      </Animated.View>
    </Float>
  );
}

function floatingActionRoute(
  route: TabsFloatingActionRoute,
  router: ReturnType<typeof useRouter>,
): FloatingActionRoute | null {
  if (route === 'interview') {
    return {
      accessibilityLabel: '면접 시작하기',
      onPress: () => router.push('/interview/new' as never),
    };
  }

  if (route === 'reports') {
    return {
      accessibilityLabel: '모의고사 시작하기',
      onPress: () => router.push({ pathname: '/mock-exam' } as never),
    };
  }

  return null;
}
