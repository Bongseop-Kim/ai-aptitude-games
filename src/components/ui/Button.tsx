import { Pressable, type PressableProps } from 'react-native';

import { HStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';
import type { ColorToken } from '../../design-system/components/style-props';
import { Icon, type IconName } from './Icon';

export type ButtonVariant = 'solid' | 'weak' | 'outline' | 'ghost';
export type ButtonTone = 'brand' | 'neutral' | 'critical';
export type ButtonSize = 'small' | 'medium';

export type ButtonProps = Omit<PressableProps, 'children'> & {
  label: string;
  variant?: ButtonVariant;
  tone?: ButtonTone;
  size?: ButtonSize;
  iconLeft?: IconName;
  iconRight?: IconName;
  fullWidth?: boolean;
};

type ButtonStyle = {
  bg: ColorToken;
  borderColor: ColorToken;
  textColor: ColorToken;
};

function buttonStyle(variant: ButtonVariant, tone: ButtonTone): ButtonStyle {
  if (variant === 'solid') {
    return tone === 'brand'
      ? { bg: 'bg.brandSolid', borderColor: 'stroke.brandSolid', textColor: 'fg.neutralInverted' }
      : { bg: 'bg.neutralSolid', borderColor: 'stroke.neutralContrast', textColor: 'fg.neutralInverted' };
  }

  if (variant === 'weak') {
    return tone === 'critical'
      ? { bg: 'palette.red100', borderColor: 'stroke.neutralSubtle', textColor: 'fg.critical' }
      : { bg: 'bg.brandWeak', borderColor: 'stroke.brandWeak', textColor: 'fg.brand' };
  }

  if (variant === 'outline') {
    return { bg: 'bg.transparent', borderColor: 'stroke.neutralWeak', textColor: 'fg.neutral' };
  }

  return { bg: 'bg.transparent', borderColor: 'bg.transparent', textColor: 'fg.neutralMuted' };
}

export function Button({
  label,
  variant = 'solid',
  tone = 'brand',
  size = 'medium',
  iconLeft,
  iconRight,
  fullWidth = false,
  disabled,
  ...props
}: ButtonProps) {
  const colors = buttonStyle(variant, tone);
  const isDisabled = Boolean(disabled);
  const py = size === 'small' ? 'x2' : 'x3';
  const px = size === 'small' ? 'x3' : 'x4';
  const textStyle = size === 'small' ? 't4Bold' : 't5Bold';
  const contentColor = isDisabled ? 'fg.disabled' : colors.textColor;

  return (
    <Pressable accessibilityRole="button" accessibilityState={{ disabled: isDisabled }} disabled={disabled} {...props}>
      <HStack
        align="center"
        bg={isDisabled ? 'bg.disabled' : colors.bg}
        borderColor={colors.borderColor}
        borderRadius="r3"
        borderWidth={variant === 'ghost' ? undefined : 'thin'}
        gap="x2"
        justify="center"
        px={px}
        py={py}
        width={fullWidth ? 'full' : undefined}
      >
        {iconLeft ? <Icon name={iconLeft} color={contentColor} size="small" /> : null}
        <Text color={contentColor} textStyle={textStyle} maxLines={1}>
          {label}
        </Text>
        {iconRight ? <Icon name={iconRight} color={contentColor} size="small" /> : null}
      </HStack>
    </Pressable>
  );
}
