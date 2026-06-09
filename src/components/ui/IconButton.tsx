import { Pressable, type PressableProps } from 'react-native';

import { Box } from '../../design-system/components/Box';
import type { ColorToken } from '../../design-system/components/style-props';
import { Icon, type IconName } from './Icon';

export type IconButtonProps = Omit<PressableProps, 'children'> & {
  name: IconName;
  label: string;
  variant?: 'ghost' | 'weak' | 'outline';
  color?: ColorToken;
};

export function IconButton({
  name,
  label,
  variant = 'ghost',
  color = 'fg.neutralMuted',
  disabled,
  ...props
}: IconButtonProps) {
  const isOutline = variant === 'outline';
  const isDisabled = Boolean(disabled);

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      disabled={disabled}
      {...props}
    >
      <Box
        alignItems="center"
        bg={variant === 'weak' ? 'bg.neutralWeak' : 'bg.transparent'}
        borderColor={isOutline ? 'stroke.neutralWeak' : 'bg.transparent'}
        borderRadius="full"
        borderWidth={isOutline ? 'thin' : undefined}
        height="x10"
        justifyContent="center"
        width="x10"
      >
        <Icon name={name} color={isDisabled ? 'fg.disabled' : color} />
      </Box>
    </Pressable>
  );
}
