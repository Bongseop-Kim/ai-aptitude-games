import { HStack, VStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';
import { Icon, type IconName } from '../ui/Icon';

export type SubSectionHeadProps = {
  icon?: IconName;
  title: string;
  caption?: string;
};

export function SubSectionHead({ icon, title, caption }: SubSectionHeadProps) {
  return (
    <VStack gap="x0_5">
      <HStack align="center" justify="spaceBetween">
        <HStack align="center" gap="x1">
          {icon ? <Icon name={icon} color="fg.neutral" size="small" /> : null}
          <Text textStyle="t5Bold">{title}</Text>
        </HStack>
      </HStack>
      {caption ? (
        <Text color="fg.neutralMuted" textStyle="t2Regular" maxLines={1}>
          {caption}
        </Text>
      ) : null}
    </VStack>
  );
}
