import { Pressable, type PressableProps } from 'react-native';

import { HStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';
import { Icon, type IconName } from '../ui/Icon';

export type SectionHeadProps = {
  icon?: IconName;
  title: string;
  actionLabel?: string;
  actionAccessibilityLabel?: string;
  onActionPress?: PressableProps['onPress'];
};

export function SectionHead({ icon, title, actionLabel, actionAccessibilityLabel, onActionPress }: SectionHeadProps) {
  const action = actionLabel ? (
    <HStack align="center" gap="x0_5">
      <Text color="fg.neutralSubtle" textStyle="t3Medium">
        {actionLabel}
      </Text>
      <Icon name="ChevronRight" color="fg.neutralSubtle" size="small" />
    </HStack>
  ) : null;

  return (
    <HStack align="center" justify="spaceBetween">
      <HStack align="center" gap="x1">
        {icon ? <Icon name={icon} color="fg.neutral" size="small" /> : null}
        <Text textStyle="t6Bold">{title}</Text>
      </HStack>
      {onActionPress && action ? (
        <Pressable
          accessibilityLabel={actionAccessibilityLabel ?? `${title} ${actionLabel}`}
          accessibilityRole="button"
          onPress={onActionPress}
        >
          {action}
        </Pressable>
      ) : (
        action
      )}
    </HStack>
  );
}
