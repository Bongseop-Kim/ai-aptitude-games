import { TextInput, type TextInputProps } from 'react-native';

import { resolveColor, resolveLength, resolveRadius } from '../../design-system/components/style-props';
import { useDesignSystemTheme } from '../../design-system/provider';

export type TextFieldProps = Omit<TextInputProps, 'multiline' | 'style'>;

const DEFAULT_PADDING = 12;

export function TextField({ placeholderTextColor, ...props }: TextFieldProps) {
  const { fontFamily, fontsLoaded, theme } = useDesignSystemTheme();
  const resolvedFontFamily = fontsLoaded ? fontFamily?.regular : undefined;
  const padding = resolveLength(theme, 'x3');
  const resolvedPadding = typeof padding === 'number' ? padding : DEFAULT_PADDING;

  return (
    <TextInput
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
        lineHeight: theme.lineHeight.t5,
        paddingHorizontal: resolvedPadding,
        paddingVertical: resolvedPadding,
      }}
      {...props}
    />
  );
}
