import type { ReactNode } from 'react';

import { HStack, VStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';
import { IconButton } from '../ui/IconButton';
import type { IconName } from '../ui/Icon';
import { Logo } from './Logo';

export type HeaderAction = {
  icon: IconName;
  label: string;
  onPress?: () => void;
  disabled?: boolean;
};

export type HeaderProps = {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: HeaderAction;
};

export function Header({ title, subtitle, children, showBack = false, onBack, rightAction }: HeaderProps) {
  return (
    <VStack gap="x2" py="x2">
      <HStack align="center" gap="x3" justify="spaceBetween">
        <HStack align="center" flex={1} gap="x2">
          {showBack ? <IconButton name="ArrowLeft" label="뒤로" onPress={onBack} /> : <Logo showText={false} />}
          <VStack flex={1} gap="x0_5">
            <Text textStyle="t7Bold" maxLines={1}>
              {title}
            </Text>
            {subtitle ? (
              <Text color="fg.neutralMuted" textStyle="t3Regular" maxLines={1}>
                {subtitle}
              </Text>
            ) : null}
          </VStack>
        </HStack>
        {rightAction?.onPress ? (
          <IconButton
            name={rightAction.icon}
            label={rightAction.label}
            disabled={rightAction.disabled}
            onPress={rightAction.onPress}
          />
        ) : null}
      </HStack>
      {children}
    </VStack>
  );
}
