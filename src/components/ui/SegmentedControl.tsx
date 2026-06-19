import { useLayoutEffect, useState } from 'react';
import { Pressable, StyleSheet, type LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Box } from '../../design-system/components/Box';
import { HStack } from '../../design-system/components/Stack';
import { Text, type TextStyleName } from '../../design-system/components/Text';
import type { ColorToken, TokenSize } from '../../design-system/components/style-props';
import { useDesignSystemTheme } from '../../design-system/provider';

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

type IndicatorFrame = {
  height: number;
  width: number;
  x: number;
  y: number;
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
  if (disabled || selected) return 'bg.transparent';
  if (pressed) return 'bg.layerDefaultPressed';
  return 'bg.transparent';
}

function itemBorderColor(selected: boolean, pressed: boolean, disabled: boolean): ColorToken {
  if (disabled || selected || !pressed) return 'bg.transparent';
  return 'stroke.neutralMuted';
}

function itemTextColor(selected: boolean, disabled: boolean): ColorToken {
  if (disabled) return 'fg.disabled';
  return selected ? 'fg.neutral' : 'fg.neutralSubtle';
}

function indicatorBackgroundColor(pressed: boolean, disabled: boolean): ColorToken {
  if (disabled) return 'bg.disabled';
  return pressed ? 'palette.gray100' : 'palette.gray00';
}

function isSameFrame(currentFrame: IndicatorFrame | undefined, nextFrame: IndicatorFrame) {
  return (
    currentFrame?.height === nextFrame.height &&
    currentFrame.width === nextFrame.width &&
    currentFrame.x === nextFrame.x &&
    currentFrame.y === nextFrame.y
  );
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
  const { theme } = useDesignSystemTheme();
  const controlSize = sizeStyles[size];
  const trackBackgroundColor = 'palette.staticBlackAlpha200';
  const [itemFrames, setItemFrames] = useState<Record<string, IndicatorFrame>>({});
  const [pressedValue, setPressedValue] = useState<Value | null>(null);
  const selectedFrame = itemFrames[value];
  const selectedFrameX = selectedFrame?.x;
  const selectedFrameY = selectedFrame?.y;
  const selectedItem = items.find((item) => item.value === value);
  const selectedItemDisabled = disabled || Boolean(selectedItem?.disabled);
  const selectedItemPressed = pressedValue === value && !selectedItemDisabled;
  const indicatorTranslateX = useSharedValue(0);
  const indicatorTranslateY = useSharedValue(0);
  const indicatorOpacity = useSharedValue(0);
  const indicatorPositioned = useSharedValue(false);
  const indicatorAnimatedStyle = useAnimatedStyle(() => ({
    opacity: indicatorOpacity.get(),
    transform: [{ translateX: indicatorTranslateX.get() }, { translateY: indicatorTranslateY.get() }],
  }));

  useLayoutEffect(() => {
    if (selectedFrameX === undefined || selectedFrameY === undefined) {
      indicatorOpacity.set(withTiming(0, { duration: theme.duration.d2 }));
      return;
    }

    if (!indicatorPositioned.get()) {
      indicatorTranslateX.set(selectedFrameX);
      indicatorTranslateY.set(selectedFrameY);
      indicatorOpacity.set(1);
      indicatorPositioned.set(true);
      return;
    }

    indicatorTranslateX.set(withTiming(selectedFrameX, { duration: theme.duration.d4 }));
    indicatorTranslateY.set(withTiming(selectedFrameY, { duration: theme.duration.d4 }));
    indicatorOpacity.set(withTiming(1, { duration: theme.duration.d2 }));
  }, [
    indicatorOpacity,
    indicatorPositioned,
    indicatorTranslateX,
    indicatorTranslateY,
    selectedFrameX,
    selectedFrameY,
    theme.duration.d2,
    theme.duration.d4,
  ]);

  const handleItemLayout = (itemValue: Value, event: LayoutChangeEvent) => {
    const { height, width, x, y } = event.nativeEvent.layout;
    const nextFrame = { height, width, x, y };

    setItemFrames((currentFrames) => {
      if (isSameFrame(currentFrames[itemValue], nextFrame)) return currentFrames;

      return {
        ...currentFrames,
        [itemValue]: nextFrame,
      };
    });
  };

  return (
    <HStack
      accessibilityLabel={accessibilityLabel}
      align="center"
      bg={trackBackgroundColor}
      borderRadius="full"
      gap="x1"
      overflow="hidden"
      p="x1"
      position="relative"
      width={fullWidth ? 'full' : undefined}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          styles.indicator,
          {
            height: selectedFrame?.height ?? 0,
            width: selectedFrame?.width ?? 0,
          },
          indicatorAnimatedStyle,
        ]}
      >
        <Box
          bg={indicatorBackgroundColor(selectedItemPressed, selectedItemDisabled)}
          borderRadius="full"
          height="full"
          width="full"
        />
      </Animated.View>
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
            onLayout={(event) => handleItemLayout(item.value, event)}
            onPress={() => onValueChange(item.value)}
            onPressIn={() => setPressedValue(item.value)}
            onPressOut={() =>
              setPressedValue((currentValue) => (currentValue === item.value ? null : currentValue))
            }
            style={[styles.item, fullWidth ? styles.fullWidthItem : undefined]}
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
                  style={styles.label}
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
  indicator: {
    left: 0,
    position: 'absolute',
    top: 0,
  },
  item: {
    zIndex: 1,
  },
  label: {
    includeFontPadding: false,
  },
});
