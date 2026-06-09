import { HStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';
import type { ReportCompetency } from '../../domain/types';
import { ProgressBar } from '../readiness/ProgressBar';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';

export type ReportMetricCardProps = {
  competency: ReportCompetency;
};

export function ReportMetricCard({ competency }: ReportMetricCardProps) {
  return (
    <Card gap="x2" p="x3">
      <HStack align="center" justify="spaceBetween">
        <Text textStyle="t5Bold">{competency.label}</Text>
        <Badge label={`${competency.score}`} tone={competency.tone} />
      </HStack>
      <Text color="fg.neutralMuted" textStyle="t3Regular">
        {competency.description}
      </Text>
      <ProgressBar value={competency.score} tone={competency.tone} />
    </Card>
  );
}
