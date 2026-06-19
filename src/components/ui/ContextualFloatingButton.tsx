import { ActivityIndicator, Pressable, StyleSheet, type PressableProps } from 'react-native';

import { Box } from '../../design-system/components/Box';
import { HStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';
import { resolveColor, type BoxStyleProps, type ColorToken } from '../../design-system/components/style-props';
import { useDesignSystemTheme } from '../../design-system/provider';
import { Icon, type IconName } from './Icon';

export type ContextualFloatingButtonLayout = 'withText' | 'iconOnly';
export type ContextualFloatingButtonVariant = 'solid' | 'layer';

type ContextualFloatingButtonAccessibleName =
  | {
      layout?: 'withText';
      label: string;
      accessibilityLabel?: string;
    }
  | {
      layout: 'iconOnly';
      label?: undefined;
      accessibilityLabel: string;
    };

export type ContextualFloatingButtonProps = Omit<PressableProps, 'accessibilityLabel' | 'children'> &
  ContextualFloatingButtonAccessibleName & {
    icon: IconName;
    loading?: boolean;
    maxWidth?: BoxStyleProps['maxWidth'];
    variant?: ContextualFloatingButtonVariant;
  };

type ContextualFloatingButtonColors = {
  bg: ColorToken;
  borderColor: ColorToken;
  contentColor: ColorToken;
  spinnerColor: ColorToken;
};

function contextualFloatingButtonColors(
  variant: ContextualFloatingButtonVariant,
  pressed: boolean,
  disabled: boolean,
): ContextualFloatingButtonColors {
  if (disabled) {
    return {
      bg: 'bg.disabled',
      borderColor: 'stroke.neutralSubtle',
      contentColor: 'fg.disabled',
      spinnerColor: 'fg.disabled',
    };
  }

  if (variant === 'solid') {
    return {
      bg: pressed ? 'palette.gray800' : 'bg.neutralSolid',
      borderColor: 'stroke.neutralContrast',
      contentColor: 'fg.neutralInverted',
      spinnerColor: 'fg.neutralInverted',
    };
  }

  return {
    bg: pressed ? 'bg.layerDefaultPressed' : 'bg.layerFloating',
    borderColor: 'stroke.neutralSubtle',
    contentColor: 'fg.neutral',
    spinnerColor: 'fg.neutral',
  };
}

export function ContextualFloatingButton({
  icon,
  label,
  layout = 'withText',
  accessibilityLabel,
  loading = false,
  maxWidth = 'x60',
  variant = 'layer',
  disabled,
  ...props
}: ContextualFloatingButtonProps) {
  const { theme } = useDesignSystemTheme();
  const isDisabled = Boolean(disabled) || loading;
  const accessibleName = accessibilityLabel ?? label;
  const showLabel = layout === 'withText';

  return (
    <Pressable
      accessibilityLabel={accessibleName}
      accessibilityRole="button"
      accessibilityState={{ busy: loading, disabled: isDisabled }}
      disabled={isDisabled}
      {...props}
    >
      {({ pressed }) => {
        const colors = contextualFloatingButtonColors(variant, pressed, isDisabled);

        return (
          <HStack
            align="center"
            bg={colors.bg}
            borderColor={colors.borderColor}
            borderRadius="full"
            borderWidth="thin"
            boxShadow="floating"
            justify="center"
            maxWidth={showLabel ? maxWidth : undefined}
            minHeight="x10"
            minWidth="x10"
            overflow="hidden"
            position="relative"
            px={showLabel ? 'x3' : 'x0'}
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
                  color={resolveColor(theme, colors.spinnerColor)}
                  size="small"
                />
              </Box>
            ) : null}
            <HStack align="center" gap={showLabel ? 'x1_5' : 'x0'} style={loading ? styles.hiddenContent : undefined}>
              <Icon name={icon} color={colors.contentColor} size="small" />
              {showLabel && label ? (
                <Text
                  color={colors.contentColor}
                  maxLines={1}
                  style={styles.label}
                  textStyle="t4Bold"
                >
                  {label}
                </Text>
              ) : null}
            </HStack>
          </HStack>
        );
      }}
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
