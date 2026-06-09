import type { Ref } from 'react';
import { View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';

import { useDesignSystemTheme } from '../provider';
import { resolveBoxStyle, splitStyleProps, type BoxStyleProps } from './style-props';

export type BoxProps = Omit<ViewProps, 'style'> &
  BoxStyleProps & {
    ref?: Ref<View>;
    style?: StyleProp<ViewStyle>;
  };

export function Box({ ref, style, ...props }: BoxProps) {
  const { theme } = useDesignSystemTheme();
  const { elementProps, styleProps } = splitStyleProps(props);

  return (
    <View
      ref={ref}
      {...elementProps}
      style={[resolveBoxStyle(theme, styleProps), style]}
    />
  );
}
