import { Pressable, type PressableProps } from 'react-native';

import { Box } from '../../design-system/components/Box';
import { Text } from '../../design-system/components/Text';

export type ResponseButtonProps = Omit<PressableProps, 'children'> & {
  label: string;
  selected?: boolean;
};

export function ResponseButton({ label, selected = false, ...props }: ResponseButtonProps) {
  return (
    <Pressable accessibilityRole="button" {...props}>
      <Box
        bg={selected ? 'bg.brandWeak' : 'bg.layerDefault'}
        borderColor={selected ? 'stroke.brandWeak' : 'stroke.neutralWeak'}
        borderRadius="r3"
        borderWidth="thin"
        px="x4"
        py="x3"
      >
        <Text align="center" color={selected ? 'fg.brand' : 'fg.neutral'} textStyle="t4Bold">
          {label}
        </Text>
      </Box>
    </Pressable>
  );
}
