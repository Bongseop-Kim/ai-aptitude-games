import { HStack, VStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';
import { IconButton } from '../ui/IconButton';
import type { IconName } from '../ui/Icon';
import { Logo } from './Logo';

export type HeaderProps = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightIcon?: IconName;
  onBack?: () => void;
  onRightPress?: () => void;
};

export function Header({ title, subtitle, showBack = false, rightIcon, onBack, onRightPress }: HeaderProps) {
  return (
    <HStack align="center" gap="x3" justify="spaceBetween" py="x2">
      <HStack align="center" flex={1} gap="x2">
        {showBack ? <IconButton name="arrow-left" label="뒤로" onPress={onBack} /> : <Logo showText={false} />}
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
      {rightIcon ? <IconButton name={rightIcon} label={title} onPress={onRightPress} /> : null}
    </HStack>
  );
}
