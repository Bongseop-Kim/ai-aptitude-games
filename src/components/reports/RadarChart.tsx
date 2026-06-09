import { HStack, VStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';
import type { ReportCompetency } from '../../domain/types';
import { ProgressBar } from '../readiness/ProgressBar';
import { Card } from '../ui/Card';

export type RadarChartProps = {
  competencies: ReportCompetency[];
};

export function RadarChart({ competencies }: RadarChartProps) {
  return (
    <Card gap="x3">
      <Text textStyle="t5Bold">5대 역량 레이더</Text>
      <VStack gap="x3">
        {competencies.map((competency) => (
          <HStack key={competency.key} align="center" gap="x3">
            <Text textStyle="t3Medium" maxLines={1}>
              {competency.label}
            </Text>
            <ProgressBar value={competency.score} tone={competency.tone} layout="inline" />
            <Text textStyle="t3Bold">{competency.score}</Text>
          </HStack>
        ))}
      </VStack>
    </Card>
  );
}
