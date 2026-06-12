import { TextInput, type TextInputProps } from 'react-native';

import {
  resolveColor,
  resolveLength,
  resolveRadius,
  type TokenLength,
} from '../../design-system/components/style-props';
import { useDesignSystemTheme } from '../../design-system/provider';

export type TextAreaProps = Omit<TextInputProps, 'multiline' | 'style'> & {
  height?: TokenLength;
};

const DEFAULT_TEXT_AREA_HEIGHT: TokenLength = 'x34';
const DEFAULT_TEXT_AREA_PADDING = 12;

export function TextArea({ height = DEFAULT_TEXT_AREA_HEIGHT, placeholderTextColor, ...props }: TextAreaProps) {
  const { fontFamily, fontsLoaded, theme } = useDesignSystemTheme();
  const resolvedFontFamily = fontsLoaded ? fontFamily?.regular : undefined;
  const padding = resolveLength(theme, 'x3');
  const resolvedHeight = resolveLength(theme, height);
  const resolvedNumericHeight =
    typeof resolvedHeight === 'number' ? resolvedHeight : theme.dimension.x.x34;
  const resolvedPadding = typeof padding === 'number' ? padding : DEFAULT_TEXT_AREA_PADDING;

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
        height: resolvedNumericHeight,
        lineHeight: theme.lineHeight.t5,
        paddingHorizontal: resolvedPadding,
        paddingVertical: resolvedPadding,
      }}
      {...props}
    />
  );
}
