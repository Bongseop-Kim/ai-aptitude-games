import type { ReactNode } from 'react';
import { Pressable, type PressableProps } from 'react-native';

import { HStack, VStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';
import { Icon, type IconName } from './Icon';

export type ListItemProps = Omit<PressableProps, 'children'> & {
  title: string;
  description?: string;
  leadingIcon?: IconName;
  trailing?: ReactNode;
  showChevron?: boolean;
};

export function ListItem({
  title,
  description,
  leadingIcon,
  trailing,
  showChevron = false,
  ...props
}: ListItemProps) {
  return (
    <Pressable accessibilityRole={props.onPress ? 'button' : undefined} {...props}>
      <HStack align="center" gap="x3" py="x3">
        {leadingIcon ? <Icon name={leadingIcon} color="fg.brand" /> : null}
        <VStack flex={1} gap="x0_5">
          <Text textStyle="t4Medium" maxLines={1}>
            {title}
          </Text>
          {description ? (
            <Text color="fg.neutralMuted" textStyle="t3Regular" maxLines={2}>
              {description}
            </Text>
          ) : null}
        </VStack>
        {typeof trailing === 'string' ? (
          <Text color="fg.neutralMuted" textStyle="t3Medium" maxLines={1}>
            {trailing}
          </Text>
        ) : (
          trailing
        )}
        {showChevron ? <Icon name="chevron-right" size="small" /> : null}
      </HStack>
    </Pressable>
  );
}
