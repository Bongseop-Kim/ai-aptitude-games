import { Box } from '../../design-system/components/Box';
import type { Tone } from '../../domain/types';
import { toneColors } from '../../domain/tone';

export type ProgressBarProps = {
  value: number;
  tone?: Tone;
  layout?: 'block' | 'inline';
};

export function ProgressBar({ value, tone = 'brand', layout = 'block' }: ProgressBarProps) {
  const colors = toneColors[tone];
  const clamped = Math.max(0, Math.min(100, value));
  const isInline = layout === 'inline';

  return (
    <Box
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: clamped }}
      bg="bg.neutralWeak"
      borderRadius="full"
      flex={isInline ? 1 : undefined}
      height="x1_5"
      overflow="hidden"
      width={isInline ? undefined : 'full'}
    >
      <Box bg={colors.fg} height="full" width={`${clamped}%`} />
    </Box>
  );
}
