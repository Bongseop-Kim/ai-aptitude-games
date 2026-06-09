import type { Ref } from 'react';
import {
  Text as NativeText,
  type StyleProp,
  type TextProps as NativeTextProps,
  type TextStyle,
} from 'react-native';

import { useDesignSystemTheme } from '../provider';
import { resolveColor, type ColorToken } from './style-props';

type TextTone = 'Regular' | 'Medium' | 'Bold';
type TextScale = 't1' | 't2' | 't3' | 't4' | 't5' | 't6' | 't7' | 't8' | 't9' | 't10';
export type TextStyleName =
  | 'screenTitle'
  | 'articleBody'
  | 'articleNote'
  | `${TextScale}${TextTone}`
  | `${TextScale}Static${TextTone}`;

export type TextProps = Omit<NativeTextProps, 'style' | 'numberOfLines'> & {
  color?: ColorToken | (string & {});
  fontSize?: TextScale | `${TextScale}Static`;
  lineHeight?: TextScale | `${TextScale}Static`;
  fontWeight?: 'regular' | 'medium' | 'bold';
  maxLines?: number;
  align?: 'left' | 'right' | 'center';
  ref?: Ref<NativeText>;
  textStyle?: TextStyleName;
  textDecorationLine?: 'none' | 'line-through' | 'underline';
  style?: StyleProp<TextStyle>;
};

function scaleFromToken(value: string) {
  return value.replace('Static', '') as TextScale;
}

function weightFromTextStyle(textStyle: TextStyleName) {
  if (textStyle === 'screenTitle') return 'bold';
  if (textStyle === 'articleBody') return 'regular';
  if (textStyle === 'articleNote') return 'regular';
  if (textStyle.endsWith('Bold')) return 'bold';
  if (textStyle.endsWith('Medium')) return 'medium';
  return 'regular';
}

function scaleFromTextStyle(textStyle: TextStyleName): TextScale {
  if (textStyle === 'screenTitle') return 't10';
  if (textStyle === 'articleBody') return 't5';
  if (textStyle === 'articleNote') return 't4';

  return textStyle.split('Static')[0].replace(/(Regular|Medium|Bold)$/, '') as TextScale;
}

export function Text({
  color = 'fg.neutral',
  fontSize,
  lineHeight,
  fontWeight,
  maxLines,
  align,
  ref,
  textStyle = 't5Regular',
  textDecorationLine = 'none',
  style,
  ...props
}: TextProps) {
  const { fontFamily, fontsLoaded, theme } = useDesignSystemTheme();
  const resolvedScale = fontSize ? scaleFromToken(fontSize) : scaleFromTextStyle(textStyle);
  const resolvedLineHeight = lineHeight ? scaleFromToken(lineHeight) : resolvedScale;
  const resolvedWeight = fontWeight ?? weightFromTextStyle(textStyle);
  const resolvedFontFamily = fontsLoaded ? fontFamily?.[resolvedWeight] : undefined;

  return (
    <NativeText
      ref={ref}
      numberOfLines={maxLines}
      {...props}
      style={[
        {
          color: resolveColor(theme, color),
          fontSize: theme.fontSize[resolvedScale],
          fontFamily: resolvedFontFamily,
          lineHeight: theme.lineHeight[resolvedLineHeight],
          fontWeight: resolvedFontFamily ? undefined : theme.fontWeight[resolvedWeight],
          textAlign: align,
          textDecorationLine,
        },
        style,
      ]}
    />
  );
}
