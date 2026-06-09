import type { Ref } from 'react';
import { View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';

import { useDesignSystemTheme } from '../provider';
import { resolveFlexStyle, splitStyleProps, type FlexStyleProps } from './style-props';

export type FlexProps = Omit<ViewProps, 'style'> &
  FlexStyleProps & {
    ref?: Ref<View>;
    style?: StyleProp<ViewStyle>;
  };

export function Flex({ direction = 'column', ref, style, ...props }: FlexProps) {
  const { theme } = useDesignSystemTheme();
  const { elementProps, styleProps } = splitStyleProps({ direction, ...props });

  return (
    <View
      ref={ref}
      {...elementProps}
      style={[resolveFlexStyle(theme, styleProps), style]}
    />
  );
}
