import type { ReactNode } from 'react';
import { ScrollView } from 'react-native';

import { VStack } from '../../design-system/components/Stack';
import { useDesignSystemTheme } from '../../design-system/provider';
import { resolveLength } from '../../design-system/components/style-props';

export type BodyProps = {
  children: ReactNode;
};

export function Body({ children }: BodyProps) {
  const { theme } = useDesignSystemTheme();
  const verticalPadding = resolveLength(theme, 'spacingY.componentDefault');

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{
        flexGrow: 1,
        paddingVertical: typeof verticalPadding === 'number' ? verticalPadding : undefined,
      }}
      showsVerticalScrollIndicator={false}
    >
      <VStack gap="spacingY.componentDefault">{children}</VStack>
    </ScrollView>
  );
}
