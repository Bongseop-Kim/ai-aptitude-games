import { Text } from '../../design-system/components/Text';
import { VStack } from '../../design-system/components/Stack';
import type { Tone } from '../../domain/types';
import { toneColors } from '../../domain/tone';
import { Card } from '../ui/Card';

export type MiniStatProps = {
  label: string;
  value: string;
  tone?: Tone;
};

export function MiniStat({ label, value, tone = 'neutral' }: MiniStatProps) {
  const colors = toneColors[tone];

  return (
    <VStack flex={1}>
      <Card bg={colors.bg} borderColor={colors.border} p="x3">
        <VStack gap="x1">
          <Text color={colors.fg} textStyle="t3Medium" maxLines={1}>
            {label}
          </Text>
          <Text color="fg.neutral" textStyle="t5Bold" maxLines={1}>
            {value}
          </Text>
        </VStack>
      </Card>
    </VStack>
  );
}
