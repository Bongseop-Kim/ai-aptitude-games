import { VStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';
import { Card } from '../ui/Card';
import { Icon, type IconName } from '../ui/Icon';

export type StatTileProps = {
  icon: IconName;
  value: string;
  label: string;
};

export function StatTile({ icon, value, label }: StatTileProps) {
  return (
    <Card flex={1} p="x3">
      <VStack align="center" gap="x1">
        <Icon name={icon} color="fg.brand" size="small" />
        <Text textStyle="t5Bold" maxLines={1}>
          {value}
        </Text>
        <Text color="fg.neutralMuted" textStyle="t2Regular" maxLines={1}>
          {label}
        </Text>
      </VStack>
    </Card>
  );
}
