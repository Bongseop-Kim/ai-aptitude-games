import type { ReactNode } from 'react';

import { VStack } from '../../design-system/components/Stack';

export type ScreenProps = {
  children: ReactNode;
};

export function Screen({ children }: ScreenProps) {
  return (
    <VStack bg="bg.layerBasement" flex={1} px="spacingX.globalGutter" py="spacingY.componentDefault">
      {children}
    </VStack>
  );
}
