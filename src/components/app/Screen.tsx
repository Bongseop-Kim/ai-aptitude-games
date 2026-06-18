import type { ReactNode } from 'react';
import { type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { VStack } from '../../design-system/components/Stack';
import type { ColorToken, TokenLength } from '../../design-system/components/style-props';

export type ScreenSafeEdge = 'top' | 'bottom' | 'left' | 'right';

export type ScreenProps = {
  bg?: ColorToken;
  children: ReactNode;
  contentPb?: TokenLength;
  safeEdges?: readonly ScreenSafeEdge[];
};

const defaultSafeEdges: readonly ScreenSafeEdge[] = ['top', 'bottom', 'left', 'right'];

export function Screen({
  bg = 'bg.layerBasement',
  children,
  contentPb = 'spacingY.componentDefault',
  safeEdges = defaultSafeEdges,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const safeEdgeSet = new Set(safeEdges);
  const safeAreaStyle: ViewStyle = {
    paddingTop: safeEdgeSet.has('top') ? insets.top : 0,
    paddingRight: safeEdgeSet.has('right') ? insets.right : 0,
    paddingBottom: safeEdgeSet.has('bottom') ? insets.bottom : 0,
    paddingLeft: safeEdgeSet.has('left') ? insets.left : 0,
  };

  return (
    <VStack bg={bg} flex={1} style={safeAreaStyle}>
      <VStack flex={1} px="spacingX.globalGutter" pt="spacingY.componentDefault" pb={contentPb}>
        {children}
      </VStack>
    </VStack>
  );
}
