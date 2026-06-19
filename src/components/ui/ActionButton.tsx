import { ActivityIndicator, Pressable, StyleSheet, type PressableProps } from 'react-native';

import { Box } from '../../design-system/components/Box';
import { HStack } from '../../design-system/components/Stack';
import { Text, type TextProps } from '../../design-system/components/Text';
import {
  resolveBoxStyle,
  resolveColor,
  type BoxStyleProps,
  type ColorToken,
} from '../../design-system/components/style-props';
import { useDesignSystemTheme } from '../../design-system/provider';
import { Icon, type IconName } from './Icon';

export type ActionButtonLayout = 'withText' | 'iconOnly';
export type ActionButtonVariant =
  | 'brandSolid'
  | 'neutralSolid'
  | 'neutralWeak'
  | 'criticalSolid'
  | 'neutralOutline'
  | 'brandOutline'
  | 'ghost';
export type ActionButtonSize = 'xsmall' | 'small' | 'medium' | 'large';

type ActionButtonWithText = {
  accessibilityLabel?: string;
  icon?: never;
  iconLeft?: IconName;
  iconRight?: IconName;
  label: string;
  layout?: 'withText';
};

type ActionButtonIconOnly = {
  accessibilityLabel: string;
  icon: IconName;
  iconLeft?: never;
  iconRight?: never;
  label?: undefined;
  layout: 'iconOnly';
};

type ActionButtonStyleProps = Pick<BoxStyleProps, 'bleedX' | 'bleedY' | 'flexGrow'>;

export type ActionButtonProps = Omit<PressableProps, 'accessibilityLabel' | 'children' | 'style'> &
  (ActionButtonWithText | ActionButtonIconOnly) & {
    color?: ColorToken;
    fontWeight?: NonNullable<TextProps['fontWeight']>;
    loading?: boolean;
    size?: ActionButtonSize;
    variant?: ActionButtonVariant;
  } & ActionButtonStyleProps;

type ActionButtonColorStyle = {
  bg: ColorToken;
  borderColor: ColorToken;
  borderWidth?: BoxStyleProps['borderWidth'];
  pressedBg: ColorToken;
  spinnerColor: ColorToken;
  textColor: ColorToken;
};

type ActionButtonSizeStyle = {
  borderRadius: BoxStyleProps['borderRadius'];
  iconSize: 'small' | 'medium';
  minHeight: BoxStyleProps['minHeight'];
  minWidth: BoxStyleProps['minWidth'];
  px: BoxStyleProps['px'];
  py: BoxStyleProps['py'];
  textStyle: 't3Bold' | 't4Bold' | 't5Bold';
};

const actionButtonSizeStyles = {
  xsmall: {
    borderRadius: 'full',
    iconSize: 'small',
    minHeight: 'x8',
    minWidth: 'x8',
    px: 'x2',
    py: 'x1_5',
    textStyle: 't3Bold',
  },
  small: {
    borderRadius: 'r2',
    iconSize: 'small',
    minHeight: 'x10',
    minWidth: 'x10',
    px: 'x3',
    py: 'x2',
    textStyle: 't4Bold',
  },
  medium: {
    borderRadius: 'r2',
    iconSize: 'small',
    minHeight: 'x12',
    minWidth: 'x12',
    px: 'x4',
    py: 'x3',
    textStyle: 't5Bold',
  },
  large: {
    borderRadius: 'r3',
    iconSize: 'medium',
    minHeight: 'x14',
    minWidth: 'x14',
    px: 'x5',
    py: 'x3',
    textStyle: 't5Bold',
  },
} as const satisfies Record<ActionButtonSize, ActionButtonSizeStyle>;

function actionButtonColors(
  variant: ActionButtonVariant,
  color: ColorToken | undefined,
): ActionButtonColorStyle {
  if (variant === 'brandSolid') {
    return {
      bg: 'bg.brandSolid',
      borderColor: 'stroke.brandSolid',
      borderWidth: 'thin',
      pressedBg: 'bg.brandSolidPressed',
      spinnerColor: 'fg.neutralInverted',
      textColor: 'fg.neutralInverted',
    };
  }

  if (variant === 'neutralSolid') {
    return {
      bg: 'bg.neutralSolid',
      borderColor: 'stroke.neutralContrast',
      borderWidth: 'thin',
      pressedBg: 'bg.neutralSolid',
      spinnerColor: 'fg.neutralInverted',
      textColor: 'fg.neutralInverted',
    };
  }

  if (variant === 'neutralWeak') {
    return {
      bg: 'bg.neutralWeak',
      borderColor: 'stroke.neutralSubtle',
      borderWidth: 'thin',
      pressedBg: 'bg.layerDefaultPressed',
      spinnerColor: 'fg.neutralMuted',
      textColor: 'fg.neutralMuted',
    };
  }

  if (variant === 'criticalSolid') {
    return {
      bg: 'palette.red700',
      borderColor: 'palette.red700',
      borderWidth: 'thin',
      pressedBg: 'palette.red700',
      spinnerColor: 'palette.staticWhite',
      textColor: 'palette.staticWhite',
    };
  }

  if (variant === 'neutralOutline') {
    return {
      bg: 'bg.transparent',
      borderColor: 'stroke.neutralWeak',
      borderWidth: 'thin',
      pressedBg: 'bg.layerDefaultPressed',
      spinnerColor: 'fg.neutral',
      textColor: 'fg.neutral',
    };
  }

  if (variant === 'brandOutline') {
    return {
      bg: 'bg.transparent',
      borderColor: 'stroke.brandWeak',
      borderWidth: 'thin',
      pressedBg: 'bg.brandWeak',
      spinnerColor: 'fg.brand',
      textColor: 'fg.brand',
    };
  }

  return {
    bg: 'bg.transparent',
    borderColor: 'bg.transparent',
    borderWidth: undefined,
    pressedBg: 'bg.layerDefaultPressed',
    spinnerColor: color ?? 'fg.neutralMuted',
    textColor: color ?? 'fg.neutralMuted',
  };
}

export function ActionButton({
  label,
  icon,
  layout = 'withText',
  accessibilityLabel,
  variant = 'brandSolid',
  size = 'medium',
  iconLeft,
  iconRight,
  bleedX,
  bleedY,
  color,
  flexGrow,
  fontWeight,
  loading = false,
  disabled,
  ...props
}: ActionButtonProps) {
  const { theme } = useDesignSystemTheme();
  const colors = actionButtonColors(variant, color);
  const sizeStyle = actionButtonSizeStyles[size];
  const isDisabled = Boolean(disabled) || loading;
  const showLabel = layout === 'withText';
  const contentIcon = layout === 'iconOnly' ? icon : undefined;
  const accessibleName = accessibilityLabel ?? label;
  const contentColor = isDisabled ? 'fg.disabled' : colors.textColor;
  const backgroundColor = isDisabled ? 'bg.disabled' : colors.bg;

  return (
    <Pressable
      accessibilityLabel={accessibleName}
      accessibilityRole="button"
      accessibilityState={{ busy: loading, disabled: isDisabled }}
      disabled={isDisabled}
      style={resolveBoxStyle(theme, { bleedX, bleedY, flexGrow })}
      {...props}
    >
      {({ pressed }) => (
        <HStack
          align="center"
          bg={!isDisabled && pressed ? colors.pressedBg : backgroundColor}
          borderColor={colors.borderColor}
          borderRadius={sizeStyle.borderRadius}
          borderWidth={colors.borderWidth}
          gap="x2"
          justify="center"
          minHeight={sizeStyle.minHeight}
          minWidth={sizeStyle.minWidth}
          overflow="hidden"
          position="relative"
          px={showLabel ? sizeStyle.px : 'x0'}
          py={sizeStyle.py}
        >
          {loading ? (
            <Box
              alignItems="center"
              bottom={0}
              justifyContent="center"
              left={0}
              pointerEvents="none"
              position="absolute"
              right={0}
              top={0}
            >
              <ActivityIndicator
                color={resolveColor(theme, isDisabled ? 'fg.disabled' : colors.spinnerColor)}
                size="small"
              />
            </Box>
          ) : null}
          <HStack align="center" gap="x2" style={loading ? styles.hiddenContent : undefined}>
            {iconLeft ? <Icon name={iconLeft} color={contentColor} size={sizeStyle.iconSize} /> : null}
            {contentIcon ? <Icon name={contentIcon} color={contentColor} size={sizeStyle.iconSize} /> : null}
            {showLabel && label ? (
              <Text
                color={contentColor}
                fontWeight={variant === 'ghost' ? fontWeight : undefined}
                maxLines={1}
                style={styles.label}
                textStyle={sizeStyle.textStyle}
              >
                {label}
              </Text>
            ) : null}
            {iconRight ? <Icon name={iconRight} color={contentColor} size={sizeStyle.iconSize} /> : null}
          </HStack>
        </HStack>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hiddenContent: {
    opacity: 0,
  },
  label: {
    flexShrink: 1,
  },
});
