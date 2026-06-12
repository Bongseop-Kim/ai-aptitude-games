import type { ReactNode } from 'react';
import { Modal, Pressable } from 'react-native';

import { Box } from '../../design-system/components/Box';
import { VStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';

export type SheetProps = {
  visible: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
};

export function Sheet({ visible, title, subtitle, onClose, children }: SheetProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Box flex={1}>
        <Pressable accessibilityRole="button" style={{ flex: 1 }} onPress={onClose}>
          <Box bg="bg.overlay" flex={1} />
        </Pressable>
        <Box
          bg="bg.layerFloating"
          borderTopLeftRadius="r5"
          borderTopRightRadius="r5"
          boxShadow="floating"
          px="spacingX.globalGutter"
          pb="x8"
          pt="x3"
        >
          <VStack gap="x3">
            <Box alignSelf="center" bg="stroke.neutralWeak" borderRadius="full" height="x1" width="x10" />
            <VStack gap="x0_5">
              <Text textStyle="t7Bold">{title}</Text>
              {subtitle ? (
                <Text color="fg.neutralMuted" textStyle="t3Regular">
                  {subtitle}
                </Text>
              ) : null}
            </VStack>
            {children}
          </VStack>
        </Box>
      </Box>
    </Modal>
  );
}
