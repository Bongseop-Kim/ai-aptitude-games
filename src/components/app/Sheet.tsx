import type { ReactNode } from 'react';
import { ScrollView, useWindowDimensions } from 'react-native';
import { BottomSheet, RNHostView } from '@expo/ui';

import { VStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';

export type SheetProps = {
  visible: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
};

const SHEET_MAX_HEIGHT_RATIO = 0.8;

export function Sheet({ visible, title, subtitle, onClose, children }: SheetProps) {
  const { height } = useWindowDimensions();

  return (
    <BottomSheet isPresented={visible} onDismiss={onClose}>
      {/* RN content must be hosted via RNHostView to receive touches inside the
          native sheet. matchContents reports the ScrollView's resolved height,
          so the sheet fits short content and caps at maxHeight (scrolling) when
          content is taller — e.g. the job-posting catalog list. */}
      <RNHostView matchContents>
        <ScrollView nestedScrollEnabled style={{ maxHeight: height * SHEET_MAX_HEIGHT_RATIO }}>
          <VStack gap="x3" pb="x8">
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
        </ScrollView>
      </RNHostView>
    </BottomSheet>
  );
}
