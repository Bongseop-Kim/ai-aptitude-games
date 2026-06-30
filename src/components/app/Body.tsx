import type { ReactNode } from 'react';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Box } from '../../design-system/components/Box';
import { VStack } from '../../design-system/components/Stack';
import { useDesignSystemTheme } from '../../design-system/provider';
import { resolveLength, type TokenLength } from '../../design-system/components/style-props';

export type BodyProps = {
  bottomPad?: TokenLength;
  bottomReserve?: number;
  children: ReactNode;
};

export function Body({ bottomPad = 0, bottomReserve = 0, children }: BodyProps) {
  const { theme } = useDesignSystemTheme();
  const insets = useSafeAreaInsets();
  const bottomPadding = resolveLength(theme, bottomPad);
  const insetBottom = Math.max(
    typeof bottomPadding === 'number' ? bottomPadding : 0,
    bottomReserve,
  );

  return (
    <Box flex={1}>
      <ScrollView
        style={{ flex: 1 }}
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: insetBottom + insets.bottom,
        }}
        showsVerticalScrollIndicator={false}
      >
        <VStack gap="spacingY.componentDefault" py="spacingY.componentDefault">
          {children}
        </VStack>
      </ScrollView>
    </Box>
  );
}
