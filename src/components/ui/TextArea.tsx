import { TextInput, type TextInputProps } from 'react-native';

import {
  resolveColor,
  resolveLength,
  resolveRadius,
} from '../../design-system/components/style-props';
import { useDesignSystemTheme } from '../../design-system/provider';

export type TextAreaProps = Omit<TextInputProps, 'multiline' | 'style'> & {
  height?: number;
};

export function TextArea({ height = 136, placeholderTextColor, ...props }: TextAreaProps) {
  const { fontFamily, fontsLoaded, theme } = useDesignSystemTheme();
  const resolvedFontFamily = fontsLoaded ? fontFamily?.regular : undefined;
  const padding = resolveLength(theme, 'x3');
  const resolvedPadding = typeof padding === 'number' ? padding : 12;

  return (
    <TextInput
      multiline
      textAlignVertical="top"
      placeholderTextColor={placeholderTextColor ?? resolveColor(theme, 'fg.neutralSubtle')}
      style={{
        backgroundColor: resolveColor(theme, 'bg.layerFloating'),
        borderColor: resolveColor(theme, 'stroke.neutralWeak'),
        borderRadius: resolveRadius(theme, 'r3'),
        borderWidth: 1,
        color: resolveColor(theme, 'fg.neutral'),
        fontFamily: resolvedFontFamily,
        fontSize: theme.fontSize.t5,
        fontWeight: resolvedFontFamily ? undefined : theme.fontWeight.regular,
        height,
        lineHeight: theme.lineHeight.t5,
        paddingHorizontal: resolvedPadding,
        paddingVertical: resolvedPadding,
      }}
      {...props}
    />
  );
}
