import type { ReactNode } from 'react';
import { ScrollView } from 'react-native';

import { Box } from '../../design-system/components/Box';
import { VStack } from '../../design-system/components/Stack';
import { useDesignSystemTheme } from '../../design-system/provider';
import { resolveLength, type TokenLength } from '../../design-system/components/style-props';

export type BodyProps = {
  bottomPad?: TokenLength;
  children: ReactNode;
};

export function Body({ bottomPad = 0, children }: BodyProps) {
  const { theme } = useDesignSystemTheme();
  const bottomPadding = resolveLength(theme, bottomPad);
  const insetBottom = typeof bottomPadding === 'number' ? bottomPadding : 0;

  return (
    <Box flex={1}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: insetBottom,
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
