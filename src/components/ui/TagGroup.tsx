import { Fragment } from 'react';

import { HStack } from '../../design-system/components/Stack';
import { Text, type TextStyleName } from '../../design-system/components/Text';
import type { ColorToken } from '../../design-system/components/style-props';
import { Icon, type IconName } from './Icon';

type TagGroupSize = 't2' | 't3' | 't4';
export type TagGroupTone = 'neutralSubtle' | 'neutral' | 'brand';
export type TagGroupWeight = 'regular' | 'bold';

type BaseTagGroupItem = {
  label: string;
};

export type TagGroupItem =
  | (BaseTagGroupItem & { prefixIcon?: IconName; suffixIcon?: never })
  | (BaseTagGroupItem & { prefixIcon?: never; suffixIcon?: IconName });

export type TagGroupProps = {
  items: TagGroupItem[];
  size?: TagGroupSize;
  tone?: TagGroupTone;
  weight?: TagGroupWeight;
};

const toneColor: Record<TagGroupTone, ColorToken> = {
  brand: 'fg.brand',
  neutral: 'fg.neutral',
  neutralSubtle: 'fg.neutralSubtle',
};

const textStyleBySizeAndWeight: Record<TagGroupSize, Record<TagGroupWeight, TextStyleName>> = {
  t2: {
    bold: 't2Bold',
    regular: 't2Regular',
  },
  t3: {
    bold: 't3Bold',
    regular: 't3Regular',
  },
  t4: {
    bold: 't4Bold',
    regular: 't4Regular',
  },
};

export function TagGroup({ items, size = 't2', tone = 'neutralSubtle', weight = 'regular' }: TagGroupProps) {
  if (items.length === 0) return null;

  const color = toneColor[tone];
  const textStyle = textStyleBySizeAndWeight[size][weight];

  return (
    <HStack align="center" gap="x1_5" flexWrap="wrap">
      {items.map((item, index) => {
        return (
          <Fragment key={`${item.label}-${index}`}>
            {index > 0 ? (
              <Text color="fg.neutralMuted" textStyle={textStyle}>
                ·
              </Text>
            ) : null}
            <HStack align="center" gap="x0_5">
              {item.prefixIcon ? <Icon name={item.prefixIcon} color={color} size="small" /> : null}
              <Text color={color} textStyle={textStyle} maxLines={1}>
                {item.label}
              </Text>
              {item.suffixIcon ? <Icon name={item.suffixIcon} color={color} size="small" /> : null}
            </HStack>
          </Fragment>
        );
      })}
    </HStack>
  );
}
