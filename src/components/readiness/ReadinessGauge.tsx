import { HStack, VStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';
import { readinessLabel, readinessTone } from '../../domain/readiness';
import { Card } from '../ui/Card';
import { ProgressBar } from './ProgressBar';
import { ReadinessChip } from './ReadinessChip';

export type ReadinessGaugeProps = {
  score: number;
  label?: string;
};

export function ReadinessGauge({ score, label = readinessLabel(score) }: ReadinessGaugeProps) {
  return (
    <VStack>
      <Card>
        <VStack gap="x4">
          <HStack align="center" justify="spaceBetween">
            <VStack gap="x1">
              <Text color="fg.neutralMuted" textStyle="t3Medium">
                면접 준비도
              </Text>
              <Text textStyle="t10Bold">{score}°</Text>
            </VStack>
            <ReadinessChip score={score} />
          </HStack>
          <ProgressBar value={score} tone={readinessTone(score)} />
          <Text color="fg.neutralMuted" textStyle="t4Regular">
            {label}
          </Text>
        </VStack>
      </Card>
    </VStack>
  );
}
