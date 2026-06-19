import { Pressable, StyleSheet } from 'react-native';

import { Box } from '../../design-system/components/Box';
import { HStack, VStack } from '../../design-system/components/Stack';
import { Text, type TextStyleName } from '../../design-system/components/Text';
import type { ColorToken, TokenSize } from '../../design-system/components/style-props';

export type TabsVariant = 'line' | 'chip';
export type TabsLineSize = 'small' | 'medium';
export type TabsChipSize = 'medium' | 'large';

export type TabItem<Value extends string> = {
  label: string;
  value: Value;
  disabled?: boolean;
  accessibilityLabel?: string;
};

type TabsBaseProps<Value extends string> = {
  items: readonly TabItem<Value>[];
  value: Value;
  onChange: (value: Value) => void;
  accessibilityLabel?: string;
  disabled?: boolean;
  fullWidth?: boolean;
};

export type TabsProps<Value extends string> =
  | (TabsBaseProps<Value> & {
      size?: TabsLineSize;
      variant?: 'line';
    })
  | (TabsBaseProps<Value> & {
      size?: TabsChipSize;
      variant: 'chip';
    });

type SizeStyle = {
  minHeight: TokenSize;
  px: TokenSize;
  py: TokenSize;
  textStyle: TextStyleName;
};

const lineSizeStyles = {
  small: {
    minHeight: 'x9',
    px: 'x3',
    py: 'x2',
    textStyle: 't4Bold',
  },
  medium: {
    minHeight: 'x11',
    px: 'x4',
    py: 'x2_5',
    textStyle: 't5Bold',
  },
} as const satisfies Record<TabsLineSize, SizeStyle>;

const chipSizeStyles = {
  medium: {
    minHeight: 'x9',
    px: 'x4',
    py: 'x2',
    textStyle: 't4Bold',
  },
  large: {
    minHeight: 'x10',
    px: 'x5',
    py: 'x2',
    textStyle: 't5Bold',
  },
} as const satisfies Record<TabsChipSize, SizeStyle>;

function tabTextColor(selected: boolean, disabled: boolean): ColorToken {
  if (disabled) return 'fg.disabled';
  return selected ? 'fg.neutral' : 'fg.neutralMuted';
}

function chipBackgroundColor(selected: boolean, pressed: boolean, disabled: boolean): ColorToken {
  if (disabled) return selected ? 'bg.disabled' : 'bg.neutralWeak';
  if (selected) return pressed ? 'bg.brandSolidPressed' : 'bg.brandSolid';
  if (pressed) return 'bg.layerDefaultPressed';
  return 'bg.neutralWeak';
}

function chipTextColor(selected: boolean, disabled: boolean): ColorToken {
  if (disabled) return 'fg.disabled';
  return selected ? 'fg.neutralInverted' : 'fg.neutralMuted';
}

export function Tabs<Value extends string>({
  items,
  value,
  onChange,
  accessibilityLabel,
  disabled = false,
  fullWidth = false,
  size,
  variant = 'line',
}: TabsProps<Value>) {
  const sizeStyle =
    variant === 'chip'
      ? chipSizeStyles[size === 'large' ? 'large' : 'medium']
      : lineSizeStyles[size === 'medium' ? 'medium' : 'small'];

  return (
    <HStack
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="tablist"
      borderBottomWidth={variant === 'line' ? 'thin' : undefined}
      borderColor={variant === 'line' ? 'stroke.neutralSubtle' : undefined}
      gap={variant === 'chip' ? 'x2' : undefined}
      width={fullWidth ? 'full' : undefined}
    >
      {items.map((item) => {
        const selected = item.value === value;
        const itemDisabled = disabled || Boolean(item.disabled);

        return (
          <Pressable
            key={item.value}
            accessibilityLabel={item.accessibilityLabel ?? item.label}
            accessibilityRole="tab"
            accessibilityState={{ disabled: itemDisabled, selected }}
            disabled={itemDisabled}
            onPress={() => onChange(item.value)}
            style={fullWidth ? styles.fullWidthItem : undefined}
          >
            {({ pressed }) =>
              variant === 'chip' ? (
                <HStack
                  align="center"
                  bg={chipBackgroundColor(selected, pressed, itemDisabled)}
                  borderRadius="full"
                  justify="center"
                  minHeight={sizeStyle.minHeight}
                  px={sizeStyle.px}
                  py={sizeStyle.py}
                  width={fullWidth ? 'full' : undefined}
                >
                  <Text
                    align="center"
                    color={chipTextColor(selected, itemDisabled)}
                    maxLines={1}
                    textStyle={sizeStyle.textStyle}
                  >
                    {item.label}
                  </Text>
                </HStack>
              ) : (
                <VStack
                  align="center"
                  justify="center"
                  minHeight={sizeStyle.minHeight}
                  px={sizeStyle.px}
                  py={sizeStyle.py}
                  width={fullWidth ? 'full' : undefined}
                >
                  <Text
                    align="center"
                    color={tabTextColor(selected, itemDisabled)}
                    maxLines={1}
                    textStyle={sizeStyle.textStyle}
                  >
                    {item.label}
                  </Text>
                  <Box
                    bg={selected && !itemDisabled ? 'bg.brandSolid' : 'bg.transparent'}
                    borderRadius="full"
                    bottom={0}
                    height="x0_5"
                    left={0}
                    position="absolute"
                    right={0}
                  />
                </VStack>
              )
            }
          </Pressable>
        );
      })}
    </HStack>
  );
}

const styles = StyleSheet.create({
  fullWidthItem: {
    flex: 1,
  },
});
