import { Box } from '../../design-system/components/Box';
import { Text, type TextProps } from '../../design-system/components/Text';
import type { BoxStyleProps, ColorToken } from '../../design-system/components/style-props';
import type { BadgeTone } from '../../shared/types';

export type { BadgeTone } from '../../shared/types';

export type BadgeVariantTone = BadgeTone | 'brandSolid';
export type BadgeVariant = 'weak' | 'solid' | 'outline';
export type BadgeSize = 'xs' | 'small' | 'medium' | 'large';

export type BadgeProps = {
  label: string;
  tone?: BadgeVariantTone;
  variant?: BadgeVariant;
  size?: BadgeSize;
};

type BadgeRootStyle = {
  bg: ColorToken;
  borderColor?: ColorToken;
  color: ColorToken;
};

type BadgeSizeStyle = {
  borderRadius: BoxStyleProps['borderRadius'];
  fontSize: TextProps['fontSize'];
  lineHeight: TextProps['lineHeight'];
  maxWidth: BoxStyleProps['maxWidth'];
  minHeight: BoxStyleProps['minHeight'];
  px: BoxStyleProps['px'];
  py: BoxStyleProps['py'];
};

const badgeSizeStyles: Record<'medium' | 'large', BadgeSizeStyle> = {
  medium: {
    borderRadius: 'r1',
    fontSize: 't1',
    lineHeight: 't1',
    maxWidth: 'x27_5',
    minHeight: 'x5',
    px: 'x1_5',
    py: 'x0_5',
  },
  large: {
    borderRadius: 'r1_5',
    fontSize: 't2',
    lineHeight: 't2',
    maxWidth: 'x29',
    minHeight: 'x6',
    px: 'x2',
    py: 'x1',
  },
};

const badgeColors: Record<BadgeVariant, Record<BadgeTone, BadgeRootStyle>> = {
  weak: {
    brand: { bg: 'bg.brandWeak', color: 'fg.brand' },
    critical: { bg: 'palette.red100', color: 'fg.critical' },
    informative: { bg: 'palette.blue100', color: 'fg.informative' },
    neutral: { bg: 'bg.neutralWeak', color: 'fg.neutralMuted' },
    positive: { bg: 'palette.green100', color: 'fg.positive' },
    warning: { bg: 'palette.yellow100', color: 'fg.warning' },
  },
  solid: {
    brand: { bg: 'bg.brandSolid', color: 'fg.neutralInverted' },
    critical: { bg: 'palette.red700', color: 'palette.staticWhite' },
    informative: { bg: 'palette.blue700', color: 'palette.staticWhite' },
    neutral: { bg: 'bg.neutralSolid', color: 'fg.neutralInverted' },
    positive: { bg: 'palette.green700', color: 'palette.staticWhite' },
    warning: { bg: 'palette.yellow700', color: 'palette.gray1000' },
  },
  outline: {
    brand: { bg: 'bg.transparent', borderColor: 'stroke.brandWeak', color: 'fg.brand' },
    critical: { bg: 'bg.transparent', borderColor: 'palette.red100', color: 'fg.critical' },
    informative: { bg: 'bg.transparent', borderColor: 'palette.blue100', color: 'fg.informative' },
    neutral: { bg: 'bg.transparent', borderColor: 'stroke.neutralMuted', color: 'fg.neutralMuted' },
    positive: { bg: 'bg.transparent', borderColor: 'palette.green100', color: 'fg.positive' },
    warning: { bg: 'bg.transparent', borderColor: 'palette.yellow100', color: 'fg.warning' },
  },
};

function normalizeBadgeTone(
  tone: BadgeVariantTone,
  variant: BadgeVariant | undefined,
): { tone: BadgeTone; variant: BadgeVariant } {
  if (tone === 'brandSolid') {
    return { tone: 'brand', variant: 'solid' };
  }

  return { tone, variant: variant ?? 'weak' };
}

function normalizeBadgeSize(size: BadgeSize): keyof typeof badgeSizeStyles {
  if (size === 'xs') return 'medium';
  if (size === 'small') return 'medium';

  return size;
}

export function Badge({ label, tone = 'neutral', variant, size = 'medium' }: BadgeProps) {
  const normalized = normalizeBadgeTone(tone, variant);
  const colors = badgeColors[normalized.variant][normalized.tone];
  const sizeStyle = badgeSizeStyles[normalizeBadgeSize(size)];

  return (
    <Box
      alignItems="center"
      bg={colors.bg}
      borderColor={colors.borderColor}
      borderRadius={sizeStyle.borderRadius}
      borderWidth={normalized.variant === 'outline' ? 'thin' : 0}
      flexDirection="row"
      maxWidth={sizeStyle.maxWidth}
      minHeight={sizeStyle.minHeight}
      overflow="hidden"
      px={sizeStyle.px}
      py={sizeStyle.py}
    >
      <Text
        color={colors.color}
        fontSize={sizeStyle.fontSize}
        fontWeight={normalized.variant === 'weak' ? 'medium' : 'bold'}
        lineHeight={sizeStyle.lineHeight}
        maxLines={1}
      >
        {label}
      </Text>
    </Box>
  );
}
