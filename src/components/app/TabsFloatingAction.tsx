import { usePathname, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Float } from '../../design-system/components/Float';
import { useDesignSystemTheme } from '../../design-system/provider';
import { FloatingActionButton } from '../ui/FloatingActionButton';

const nativeTabBarReserveToken = 'x14';
const floatingActionLiftToken = 'x4';

type FloatingActionRoute = {
  accessibilityLabel: string;
  onPress: () => void;
};

export function TabsFloatingAction() {
  const pathname = usePathname();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useDesignSystemTheme();
  const action = floatingActionRoute(pathname, router);
  const bottomOffset = theme.dimension.x[nativeTabBarReserveToken]
    + theme.dimension.x[floatingActionLiftToken]
    + theme.dimension.spacingY.screenBottom;

  if (!action) return null;

  return (
    <Float
      placement="bottom-end"
      offsetX={insets.right + theme.dimension.spacingX.globalGutter}
      offsetY={bottomOffset}
      pointerEvents="box-none"
      zIndex={2}
    >
      <FloatingActionButton
        label="시작하기"
        accessibilityLabel={action.accessibilityLabel}
        icon="Plus"
        onPress={action.onPress}
      />
    </Float>
  );
}

function floatingActionRoute(
  pathname: string,
  router: ReturnType<typeof useRouter>,
): FloatingActionRoute | null {
  if (pathname === '/interview') {
    return {
      accessibilityLabel: '면접 시작하기',
      onPress: () => router.push('/interview/new' as never),
    };
  }

  if (pathname === '/reports') {
    return {
      accessibilityLabel: '모의고사 시작하기',
      onPress: () => router.push({ pathname: '/mock-exam' } as never),
    };
  }

  return null;
}
