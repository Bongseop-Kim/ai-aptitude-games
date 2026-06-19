import { Pressable, StyleSheet } from 'react-native';

import { HStack } from '../../design-system/components/Stack';
import { Text, type TextStyleName } from '../../design-system/components/Text';
import type { ColorToken, TokenSize } from '../../design-system/components/style-props';

export type SegmentedControlSize = 'small' | 'medium';
export type SegmentedControlItemRole = 'radio' | 'tab';

export type SegmentedControlItem<Value extends string> = {
  label: string;
  value: Value;
  disabled?: boolean;
  accessibilityLabel?: string;
};

export type SegmentedControlProps<Value extends string> = {
  items: readonly SegmentedControlItem<Value>[];
  value: Value;
  onValueChange: (value: Value) => void;
  accessibilityLabel?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  itemRole?: SegmentedControlItemRole;
  minItemWidth?: TokenSize;
  size?: SegmentedControlSize;
};

type SizeStyle = {
  minHeight: TokenSize;
  minWidth?: TokenSize;
  px: TokenSize;
  py: TokenSize;
  textStyle: TextStyleName;
};

const sizeStyles = {
  small: {
    minHeight: 'x8',
    minWidth: undefined,
    px: 'x3',
    py: 'x1_5',
    textStyle: 't3Bold',
  },
  medium: {
    minHeight: 'x9',
    minWidth: 'x23',
    px: 'x6',
    py: 'x1_5',
    textStyle: 't5Bold',
  },
} as const satisfies Record<SegmentedControlSize, SizeStyle>;

function itemBackgroundColor(selected: boolean, pressed: boolean, disabled: boolean): ColorToken {
  if (disabled) return selected ? 'bg.disabled' : 'bg.transparent';
  if (selected) return pressed ? 'bg.layerDefaultPressed' : 'bg.layerFloating';
  if (pressed) return 'bg.layerDefaultPressed';
  return 'bg.transparent';
}

function itemBorderColor(selected: boolean, pressed: boolean, disabled: boolean): ColorToken {
  if (disabled || (!selected && !pressed)) return 'bg.transparent';
  return 'stroke.neutralSubtle';
}

function itemTextColor(selected: boolean, disabled: boolean): ColorToken {
  if (disabled) return 'fg.disabled';
  return selected ? 'fg.neutral' : 'fg.neutralSubtle';
}

export function SegmentedControl<Value extends string>({
  items,
  value,
  onValueChange,
  accessibilityLabel,
  disabled = false,
  fullWidth = false,
  itemRole = 'radio',
  minItemWidth,
  size = 'medium',
}: SegmentedControlProps<Value>) {
  const controlSize = sizeStyles[size];

  return (
    <HStack
      accessibilityLabel={accessibilityLabel}
      align="center"
      bg="bg.neutralWeak"
      borderRadius="full"
      gap="x1"
      p="x1"
      width={fullWidth ? 'full' : undefined}
    >
      {items.map((item) => {
        const selected = item.value === value;
        const itemDisabled = disabled || Boolean(item.disabled);

        return (
          <Pressable
            key={item.value}
            accessibilityLabel={item.accessibilityLabel ?? item.label}
            accessibilityRole={itemRole}
            accessibilityState={{ disabled: itemDisabled, selected }}
            disabled={itemDisabled}
            onPress={() => onValueChange(item.value)}
            style={fullWidth ? styles.fullWidthItem : undefined}
          >
            {({ pressed }) => (
              <HStack
                align="center"
                bg={itemBackgroundColor(selected, pressed, itemDisabled)}
                borderColor={itemBorderColor(selected, pressed, itemDisabled)}
                borderRadius="full"
                borderWidth="thin"
                justify="center"
                minHeight={controlSize.minHeight}
                minWidth={fullWidth ? undefined : (minItemWidth ?? controlSize.minWidth)}
                px={controlSize.px}
                py={controlSize.py}
                width={fullWidth ? 'full' : undefined}
              >
                <Text
                  align="center"
                  color={itemTextColor(selected, itemDisabled)}
                  maxLines={1}
                  textStyle={controlSize.textStyle}
                >
                  {item.label}
                </Text>
              </HStack>
            )}
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
