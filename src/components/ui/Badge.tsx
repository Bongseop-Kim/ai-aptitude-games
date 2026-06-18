import { Box } from '../../design-system/components/Box';
import { Text } from '../../design-system/components/Text';
import type { ColorToken } from '../../design-system/components/style-props';
import type { BadgeTone } from '../../shared/types';

export type { BadgeTone } from '../../shared/types';

export type BadgeVariantTone = BadgeTone | 'brandSolid';

export type BadgeProps = {
  label: string;
  tone?: BadgeVariantTone;
  size?: 'xs' | 'small' | 'medium';
};

const badgeColors: Record<BadgeVariantTone, { bg: ColorToken; color: ColorToken }> = {
  brand: { bg: 'bg.brandWeak', color: 'fg.brand' },
  brandSolid: { bg: 'bg.brandSolid', color: 'fg.neutralInverted' },
  critical: { bg: 'palette.red100', color: 'fg.critical' },
  informative: { bg: 'palette.blue100', color: 'fg.informative' },
  neutral: { bg: 'bg.neutralWeak', color: 'fg.neutralMuted' },
  positive: { bg: 'palette.green100', color: 'fg.positive' },
  warning: { bg: 'palette.yellow100', color: 'fg.warning' },
};

export function Badge({ label, tone = 'neutral', size = 'medium' }: BadgeProps) {
  const colors = badgeColors[tone];
  const px = size === 'xs' ? 'x1_5' : size === 'small' ? 'x2' : 'x2_5';
  const py = size === 'xs' ? 'x0_5' : 'x1';
  const textStyle = size === 'xs' ? 't1Medium' : size === 'small' ? 't2Medium' : 't3Medium';

  return (
    <Box bg={colors.bg} borderRadius="full" px={px} py={py}>
      <Text color={colors.color} textStyle={textStyle} maxLines={1}>
        {label}
      </Text>
    </Box>
  );
}
