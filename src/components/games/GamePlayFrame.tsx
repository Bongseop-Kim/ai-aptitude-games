import type { ReactNode } from 'react';

import { Box } from '../../design-system/components/Box';
import { VStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';
import { Card } from '../ui/Card';

export type GamePlayFrameProps = {
  title: string;
  prompt: string;
  children: ReactNode;
};

export function GamePlayFrame({ title, prompt, children }: GamePlayFrameProps) {
  return (
    <Card gap="x4" elevated>
      <VStack gap="x1">
        <Text textStyle="t6Bold">{title}</Text>
        <Text color="fg.neutralMuted" textStyle="t4Regular">
          {prompt}
        </Text>
      </VStack>
      <Box bg="bg.neutralWeak" borderRadius="r4" minHeight="x16" p="x4">
        {children}
      </Box>
    </Card>
  );
}
