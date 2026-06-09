import { Pressable, type PressableProps } from 'react-native';

import { Box } from '../../design-system/components/Box';
import { Float } from '../../design-system/components/Float';

export type SwitchProps = Omit<PressableProps, 'children'> & {
  value: boolean;
  label: string;
};

export function Switch({ value, label, disabled, ...props }: SwitchProps) {
  const isDisabled = Boolean(disabled);

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled: isDisabled }}
      disabled={disabled}
      {...props}
    >
      <Box
        bg={value ? 'bg.brandSolid' : 'bg.neutralWeak'}
        borderColor={value ? 'stroke.brandSolid' : 'stroke.neutralWeak'}
        borderRadius="full"
        borderWidth="thin"
        height="x7"
        position="relative"
        width="x12"
      >
        <Float placement={value ? 'middle-end' : 'middle-start'} offsetX="x0_5">
          <Box bg="bg.layerFloating" borderRadius="full" boxShadow="surface" height="x6" width="x6" />
        </Float>
      </Box>
    </Pressable>
  );
}
