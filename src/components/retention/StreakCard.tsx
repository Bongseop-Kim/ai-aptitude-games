import { HStack, VStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';
import { ProgressBar } from '../readiness/ProgressBar';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';

export type StreakCardProps = {
  days: number;
};

export function StreakCard({ days }: StreakCardProps) {
  return (
    <Card gap="x3">
      <HStack align="center" justify="spaceBetween">
        <VStack gap="x1">
          <Text color="fg.neutralMuted" textStyle="t3Medium">
            스트릭
          </Text>
          <Text textStyle="t8Bold">{days}일 연속</Text>
        </VStack>
        <Badge label="방패 2개" tone="warning" />
      </HStack>
      <ProgressBar value={Math.min(100, days * 14)} tone="warning" />
    </Card>
  );
}
