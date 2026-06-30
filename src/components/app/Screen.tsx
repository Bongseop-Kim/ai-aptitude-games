import type { ReactNode } from 'react';
import { type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Float } from '../../design-system/components/Float';
import { VStack } from '../../design-system/components/Stack';
import { useDesignSystemTheme } from '../../design-system/provider';
import type { ColorToken, TokenLength } from '../../design-system/components/style-props';

export type ScreenSafeEdge = 'top' | 'bottom' | 'left' | 'right';

export type ScreenProps = {
  bg?: ColorToken;
  children: ReactNode;
  contentPb?: TokenLength;
  floatingAction?: ReactNode;
  safeEdges?: readonly ScreenSafeEdge[];
};

const defaultSafeEdges: readonly ScreenSafeEdge[] = ['top', 'bottom', 'left', 'right'];

export function Screen({
  bg = 'bg.layerBasement',
  children,
  contentPb = 'spacingY.componentDefault',
  floatingAction,
  safeEdges = defaultSafeEdges,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useDesignSystemTheme();
  const safeEdgeSet = new Set(safeEdges);
  const floatingActionOffsetX = (safeEdgeSet.has('right') ? insets.right : 0) + theme.dimension.spacingX.globalGutter;
  const floatingActionOffsetY = insets.bottom + theme.dimension.spacingY.screenBottom;
  const safeAreaStyle: ViewStyle = {
    paddingTop: safeEdgeSet.has('top') ? insets.top : 0,
    paddingRight: safeEdgeSet.has('right') ? insets.right : 0,
    paddingBottom: safeEdgeSet.has('bottom') ? insets.bottom : 0,
    paddingLeft: safeEdgeSet.has('left') ? insets.left : 0,
  };

  return (
    <VStack bg={bg} flex={1} position="relative" style={safeAreaStyle}>
      <VStack flex={1} px="spacingX.globalGutter" pt="spacingY.componentDefault" pb={contentPb}>
        {children}
      </VStack>
      {floatingAction ? (
        <Float
          placement="bottom-end"
          offsetX={floatingActionOffsetX}
          offsetY={floatingActionOffsetY}
          zIndex={2}
        >
          {floatingAction}
        </Float>
      ) : null}
    </VStack>
  );
}
