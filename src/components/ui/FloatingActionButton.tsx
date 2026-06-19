import { Pressable, StyleSheet, type PressableProps } from 'react-native';

import { HStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';
import type { BoxStyleProps, ColorToken } from '../../design-system/components/style-props';
import { Icon, type IconName } from './Icon';

export type FloatingActionButtonTone = 'brand' | 'neutral';
export type FloatingActionButtonSize = 'medium' | 'large';

type FloatingActionButtonAccessibleName =
  | {
      label: string;
      accessibilityLabel?: string;
    }
  | {
      label?: undefined;
      accessibilityLabel: string;
    };

export type FloatingActionButtonProps = Omit<PressableProps, 'accessibilityLabel' | 'children'> &
  FloatingActionButtonAccessibleName & {
    icon: IconName;
    maxWidth?: BoxStyleProps['maxWidth'];
    size?: FloatingActionButtonSize;
    tone?: FloatingActionButtonTone;
  };

type FloatingActionButtonColorStyle = {
  bg: ColorToken;
  borderColor: ColorToken;
  contentColor: ColorToken;
};

type FloatingActionButtonSizeStyle = {
  iconSize: 'small' | 'medium' | 'large';
  minHeight: BoxStyleProps['minHeight'];
  minWidth: BoxStyleProps['minWidth'];
  px: BoxStyleProps['px'];
  textStyle: 't4Bold' | 't5Bold';
};

const floatingActionButtonSizeStyles = {
  medium: {
    iconSize: 'medium',
    minHeight: 'x12',
    minWidth: 'x12',
    px: 'x3',
    textStyle: 't4Bold',
  },
  large: {
    iconSize: 'medium',
    minHeight: 'x14',
    minWidth: 'x14',
    px: 'x4',
    textStyle: 't5Bold',
  },
} as const satisfies Record<FloatingActionButtonSize, FloatingActionButtonSizeStyle>;

function floatingActionButtonColors(
  tone: FloatingActionButtonTone,
  pressed: boolean,
  disabled: boolean,
): FloatingActionButtonColorStyle {
  if (disabled) {
    return {
      bg: 'bg.disabled',
      borderColor: 'stroke.neutralSubtle',
      contentColor: 'fg.disabled',
    };
  }

  if (tone === 'neutral') {
    return {
      bg: 'bg.neutralSolid',
      borderColor: 'stroke.neutralContrast',
      contentColor: 'fg.neutralInverted',
    };
  }

  return {
    bg: pressed ? 'bg.brandSolidPressed' : 'bg.brandSolid',
    borderColor: 'stroke.brandSolid',
    contentColor: 'fg.neutralInverted',
  };
}

export function FloatingActionButton({
  icon,
  label,
  accessibilityLabel,
  maxWidth = 'x60',
  size = 'large',
  tone = 'brand',
  disabled,
  ...props
}: FloatingActionButtonProps) {
  const sizeStyle = floatingActionButtonSizeStyles[size];
  const isDisabled = Boolean(disabled);
  const accessibleName = accessibilityLabel ?? label;

  return (
    <Pressable
      accessibilityLabel={accessibleName}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      disabled={disabled}
      {...props}
    >
      {({ pressed }) => {
        const colors = floatingActionButtonColors(tone, pressed, isDisabled);

        return (
          <HStack
            align="center"
            bg={colors.bg}
            borderColor={colors.borderColor}
            borderRadius="full"
            borderWidth="thin"
            boxShadow="floating"
            gap={label ? 'x2' : 'x0'}
            justify="center"
            maxWidth={label ? maxWidth : undefined}
            minHeight={sizeStyle.minHeight}
            minWidth={sizeStyle.minWidth}
            px={label ? sizeStyle.px : 'x0'}
          >
            <Icon name={icon} color={colors.contentColor} size={sizeStyle.iconSize} />
            {label ? (
              <Text
                color={colors.contentColor}
                maxLines={1}
                style={styles.label}
                textStyle={sizeStyle.textStyle}
              >
                {label}
              </Text>
            ) : null}
          </HStack>
        );
      }}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  label: {
    flexShrink: 1,
  },
});
