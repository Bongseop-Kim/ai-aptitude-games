import { Box } from '../../design-system/components/Box';
import { HStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';
import { Badge } from '../ui/Badge';

export type PlanFeatureRowProps = {
  label: string;
  freeValue: string;
  proValue: string;
};

export function PlanFeatureRow({ label, freeValue, proValue }: PlanFeatureRowProps) {
  return (
    <HStack align="center" gap="x2" py="x2">
      <Box flex={1}>
        <Text textStyle="t4Medium">{label}</Text>
      </Box>
      <Text color="fg.neutralMuted" textStyle="t3Regular">
        {freeValue}
      </Text>
      <Badge label={proValue} tone="brand" />
    </HStack>
  );
}
