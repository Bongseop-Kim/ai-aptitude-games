import type { TextStyle, ViewStyle } from 'react-native';

export type AppThemeMode = 'light' | 'dark';

export type TimingFunctionToken = {
  css: string;
  bezier: readonly [number, number, number, number];
};

export type ShadowToken = Pick<
  ViewStyle,
  'shadowColor' | 'shadowOffset' | 'shadowOpacity' | 'shadowRadius' | 'elevation'
>;

export type TextStyleToken = Pick<TextStyle, 'fontSize' | 'lineHeight' | 'fontWeight'>;

export type TokenReferenceValue =
  | string
  | number
  | TimingFunctionToken
  | ShadowToken
  | TextStyleToken;

export type TokenReference = Record<`$${string}`, TokenReferenceValue>;

export type DeepPartial<T> = {
  [Key in keyof T]?: T[Key] extends readonly unknown[]
    ? T[Key]
    : T[Key] extends Record<string, unknown>
      ? DeepPartial<T[Key]>
      : T[Key];
};
