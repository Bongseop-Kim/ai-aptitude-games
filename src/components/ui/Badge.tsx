import { Box } from '../../design-system/components/Box';
import { Text } from '../../design-system/components/Text';
import type { ColorToken } from '../../design-system/components/style-props';

export type BadgeTone = 'brand' | 'positive' | 'warning' | 'critical' | 'informative' | 'neutral';

export type BadgeProps = {
  label: string;
  tone?: BadgeTone;
  size?: 'small' | 'medium';
};

const badgeColors: Record<BadgeTone, { bg: ColorToken; color: ColorToken }> = {
  brand: { bg: 'bg.brandWeak', color: 'fg.brand' },
  critical: { bg: 'palette.red100', color: 'fg.critical' },
  informative: { bg: 'palette.blue100', color: 'fg.informative' },
  neutral: { bg: 'bg.neutralWeak', color: 'fg.neutralMuted' },
  positive: { bg: 'palette.green100', color: 'fg.positive' },
  warning: { bg: 'palette.yellow100', color: 'fg.warning' },
};

export function Badge({ label, tone = 'neutral', size = 'medium' }: BadgeProps) {
  const colors = badgeColors[tone];

  return (
    <Box bg={colors.bg} borderRadius="full" px={size === 'small' ? 'x2' : 'x2_5'} py="x1">
      <Text color={colors.color} textStyle={size === 'small' ? 't2Medium' : 't3Medium'} maxLines={1}>
        {label}
      </Text>
    </Box>
  );
}
