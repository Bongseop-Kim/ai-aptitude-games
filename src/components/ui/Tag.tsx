import { Box } from '../../design-system/components/Box';
import { Text } from '../../design-system/components/Text';
import type { BadgeTone } from './Badge';
import type { ColorToken } from '../../design-system/components/style-props';

export type TagProps = {
  label: string;
  tone?: BadgeTone;
  selected?: boolean;
};

const tagTextColor: Record<BadgeTone, ColorToken> = {
  brand: 'fg.brand',
  critical: 'fg.critical',
  informative: 'fg.informative',
  neutral: 'fg.neutralMuted',
  positive: 'fg.positive',
  warning: 'fg.warning',
};

export function Tag({ label, tone = 'neutral', selected = false }: TagProps) {
  return (
    <Box
      bg={selected ? 'bg.brandWeak' : 'bg.layerDefault'}
      borderColor={selected ? 'stroke.brandWeak' : 'stroke.neutralWeak'}
      borderRadius="full"
      borderWidth="thin"
      px="x3"
      py="x1_5"
    >
      <Text color={selected ? 'fg.brand' : tagTextColor[tone]} textStyle="t3Medium" maxLines={1}>
        {label}
      </Text>
    </Box>
  );
}
