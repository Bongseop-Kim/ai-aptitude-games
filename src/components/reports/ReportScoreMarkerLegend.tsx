import { Box } from '../../design-system/components/Box';
import { HStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';

export function ReportScoreMarkerLegend({ label }: { label: string }) {
  return (
    <HStack align="center" gap="x1_5" justify="flexEnd" width="full">
      <Box bg="fg.neutral" height="x3" width="x1" />
      <Text color="fg.neutralMuted" textStyle="t1Regular">
        기준선: {label}
      </Text>
    </HStack>
  );
}
