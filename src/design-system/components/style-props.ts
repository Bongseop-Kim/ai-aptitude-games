import { StyleSheet, type TextStyle, type ViewStyle } from 'react-native';

import type { AppTheme } from '../theme';

type ThemeColor = AppTheme['color'];
type ThemeDimension = AppTheme['dimension'];
type ThemeRadius = AppTheme['radius'];
type ThemeShadow = AppTheme['shadow'];

export type ColorToken =
  | `fg.${Extract<keyof ThemeColor['fg'], string>}`
  | `bg.${Extract<keyof ThemeColor['bg'], string>}`
  | `mannerTemp.${Extract<keyof ThemeColor['mannerTemp'], string>}`
  | `stroke.${Extract<keyof ThemeColor['stroke'], string>}`
  | `palette.${Extract<keyof ThemeColor['palette'], string>}`;

export type DimensionToken =
  | Extract<keyof ThemeDimension['x'], string>
  | `spacingX.${Extract<keyof ThemeDimension['spacingX'], string>}`
  | `spacingY.${Extract<keyof ThemeDimension['spacingY'], string>}`;

export type RadiusToken = Extract<keyof ThemeRadius, string>;
export type ShadowToken = Extract<keyof ThemeShadow, string>;
export type BorderWidthToken = 'thin';

export type TokenLength = 0 | number | DimensionToken | (string & {});
export type TokenSize = TokenLength | 'full';
export type TokenColor = ColorToken | (string & {});
export type TokenRadius = 0 | number | RadiusToken | (string & {});

export type FlexDirectionValue =
  | 'row'
  | 'column'
  | 'row-reverse'
  | 'column-reverse'
  | 'rowReverse'
  | 'columnReverse';

export type AlignValue = 'center' | 'flexStart' | 'flexEnd' | 'stretch' | 'flex-start' | 'flex-end';
export type JustifyValue =
  | AlignValue
  | 'spaceBetween'
  | 'spaceAround'
  | 'space-between'
  | 'space-around';
export type WrapValue = true | 'wrap' | 'nowrap' | 'wrap-reverse';

export type BoxStyleProps = {
  display?: 'none' | 'flex';
  bg?: TokenColor;
  background?: TokenColor;
  borderColor?: TokenColor;
  borderWidth?: 0 | 1 | number | BorderWidthToken;
  borderTopWidth?: 0 | 1 | number | BorderWidthToken;
  borderRightWidth?: 0 | 1 | number | BorderWidthToken;
  borderBottomWidth?: 0 | 1 | number | BorderWidthToken;
  borderLeftWidth?: 0 | 1 | number | BorderWidthToken;
  borderRadius?: TokenRadius;
  borderTopLeftRadius?: TokenRadius;
  borderTopRightRadius?: TokenRadius;
  borderBottomRightRadius?: TokenRadius;
  borderBottomLeftRadius?: TokenRadius;
  boxShadow?: ShadowToken;
  width?: TokenSize;
  minWidth?: TokenSize;
  maxWidth?: TokenSize;
  height?: TokenSize;
  minHeight?: TokenSize;
  maxHeight?: TokenSize;
  top?: TokenLength;
  right?: TokenLength;
  bottom?: TokenLength;
  left?: TokenLength;
  padding?: TokenLength;
  p?: TokenLength;
  paddingX?: TokenLength;
  px?: TokenLength;
  paddingY?: TokenLength;
  py?: TokenLength;
  paddingTop?: TokenLength;
  pt?: TokenLength;
  paddingRight?: TokenLength;
  pr?: TokenLength;
  paddingBottom?: TokenLength;
  pb?: TokenLength;
  paddingLeft?: TokenLength;
  pl?: TokenLength;
  margin?: TokenLength;
  m?: TokenLength;
  marginX?: TokenLength;
  mx?: TokenLength;
  marginY?: TokenLength;
  my?: TokenLength;
  marginTop?: TokenLength;
  mt?: TokenLength;
  marginRight?: TokenLength;
  mr?: TokenLength;
  marginBottom?: TokenLength;
  mb?: TokenLength;
  marginLeft?: TokenLength;
  ml?: TokenLength;
  bleedX?: TokenLength | 'asPadding';
  bleedY?: TokenLength | 'asPadding';
  bleedTop?: TokenLength | 'asPadding';
  bleedRight?: TokenLength | 'asPadding';
  bleedBottom?: TokenLength | 'asPadding';
  bleedLeft?: TokenLength | 'asPadding';
  position?: 'relative' | 'absolute';
  overflow?: 'hidden' | 'visible' | 'scroll';
  zIndex?: number;
  flex?: number;
  flexGrow?: true | 0 | 1 | number;
  flexShrink?: true | 0 | number;
  flexDirection?: FlexDirectionValue;
  flexWrap?: WrapValue;
  justifyContent?: JustifyValue;
  alignItems?: AlignValue;
  alignContent?: AlignValue;
  alignSelf?: AlignValue;
  gap?: TokenLength;
  rowGap?: TokenLength;
  columnGap?: TokenLength;
};

export type FlexStyleProps = BoxStyleProps & {
  direction?: FlexDirectionValue;
  wrap?: WrapValue;
  align?: AlignValue;
  justify?: JustifyValue;
  grow?: true | 0 | 1 | number;
  shrink?: true | 0 | number;
};

type MutableStyle = Record<string, unknown>;

const stylePropNames = new Set<string>([
  'display',
  'bg',
  'background',
  'borderColor',
  'borderWidth',
  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',
  'borderRadius',
  'borderTopLeftRadius',
  'borderTopRightRadius',
  'borderBottomRightRadius',
  'borderBottomLeftRadius',
  'boxShadow',
  'width',
  'minWidth',
  'maxWidth',
  'height',
  'minHeight',
  'maxHeight',
  'top',
  'right',
  'bottom',
  'left',
  'padding',
  'p',
  'paddingX',
  'px',
  'paddingY',
  'py',
  'paddingTop',
  'pt',
  'paddingRight',
  'pr',
  'paddingBottom',
  'pb',
  'paddingLeft',
  'pl',
  'margin',
  'm',
  'marginX',
  'mx',
  'marginY',
  'my',
  'marginTop',
  'mt',
  'marginRight',
  'mr',
  'marginBottom',
  'mb',
  'marginLeft',
  'ml',
  'bleedX',
  'bleedY',
  'bleedTop',
  'bleedRight',
  'bleedBottom',
  'bleedLeft',
  'position',
  'overflow',
  'zIndex',
  'flex',
  'flexGrow',
  'flexShrink',
  'flexDirection',
  'flexWrap',
  'justifyContent',
  'alignItems',
  'alignContent',
  'alignSelf',
  'gap',
  'rowGap',
  'columnGap',
  'direction',
  'wrap',
  'align',
  'justify',
  'grow',
  'shrink',
]);

export function splitStyleProps<Props extends Record<string, unknown>>(props: Props) {
  const styleProps: Record<string, unknown> = {};
  const elementProps: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(props)) {
    if (stylePropNames.has(key)) {
      styleProps[key] = value;
    } else {
      elementProps[key] = value;
    }
  }

  return {
    styleProps: styleProps as BoxStyleProps & FlexStyleProps,
    elementProps: elementProps as Omit<Props, keyof BoxStyleProps | keyof FlexStyleProps>,
  };
}

function normalizeAlias(value: string) {
  if (value === 'flexStart') return 'flex-start';
  if (value === 'flexEnd') return 'flex-end';
  if (value === 'spaceBetween') return 'space-between';
  if (value === 'spaceAround') return 'space-around';
  if (value === 'rowReverse') return 'row-reverse';
  if (value === 'columnReverse') return 'column-reverse';
  return value;
}

function numberOrString(value: string) {
  const numericValue = Number(value);
  return Number.isNaN(numericValue) ? value : numericValue;
}

export function resolveColor(theme: AppTheme, value: TokenColor | undefined) {
  if (!value) return undefined;

  const [group, token] = value.split('.') as [keyof ThemeColor | undefined, string | undefined];

  if (group && token && group in theme.color) {
    const colorGroup = theme.color[group] as Record<string, string>;
    return colorGroup[token] ?? value;
  }

  return value;
}

export function resolveLength(theme: AppTheme, value: TokenLength | undefined) {
  if (value === undefined) return undefined;
  if (typeof value === 'number') return value;

  const [group, token] = value.split('.') as [string, string | undefined];

  if (token && group === 'spacingX') {
    return (theme.dimension.spacingX as Record<string, number>)[token] ?? value;
  }
  if (token && group === 'spacingY') {
    return (theme.dimension.spacingY as Record<string, number>)[token] ?? value;
  }
  if (value in theme.dimension.x) return theme.dimension.x[value as keyof ThemeDimension['x']];

  return numberOrString(value);
}

function resolveSize(theme: AppTheme, value: TokenSize | undefined) {
  if (value === 'full') return '100%';
  return resolveLength(theme, value);
}

export function resolveRadius(theme: AppTheme, value: TokenRadius | undefined) {
  if (value === undefined) return undefined;
  if (typeof value === 'number') return value;
  if (value in theme.radius) return theme.radius[value as keyof ThemeRadius];
  return numberOrString(value);
}

function resolveBorderWidth(value: BoxStyleProps['borderWidth']) {
  if (value === undefined) return undefined;
  if (typeof value === 'number') return value;
  if (value === 'thin') return 1;
  const resolved = numberOrString(value);
  return typeof resolved === 'number' ? resolved : undefined;
}

function resolveWrap(value: WrapValue | undefined) {
  if (value === true) return 'wrap';
  return value;
}

function applySpacing(
  style: MutableStyle,
  theme: AppTheme,
  props: BoxStyleProps,
  name: 'padding' | 'margin',
) {
  const shortName = name === 'padding' ? 'p' : 'm';
  const base = props[name] ?? props[shortName];
  const x = props[`${name}X`] ?? props[`${shortName}x`];
  const y = props[`${name}Y`] ?? props[`${shortName}y`];

  if (base !== undefined) style[name] = resolveLength(theme, base);
  if (x !== undefined) {
    style[`${name}Left`] = resolveLength(theme, x);
    style[`${name}Right`] = resolveLength(theme, x);
  }
  if (y !== undefined) {
    style[`${name}Top`] = resolveLength(theme, y);
    style[`${name}Bottom`] = resolveLength(theme, y);
  }

  const top = props[`${name}Top`] ?? props[`${shortName}t`];
  const right = props[`${name}Right`] ?? props[`${shortName}r`];
  const bottom = props[`${name}Bottom`] ?? props[`${shortName}b`];
  const left = props[`${name}Left`] ?? props[`${shortName}l`];

  if (top !== undefined) style[`${name}Top`] = resolveLength(theme, top);
  if (right !== undefined) style[`${name}Right`] = resolveLength(theme, right);
  if (bottom !== undefined) style[`${name}Bottom`] = resolveLength(theme, bottom);
  if (left !== undefined) style[`${name}Left`] = resolveLength(theme, left);
}

function applyBleed(style: MutableStyle, theme: AppTheme, props: BoxStyleProps) {
  const paddingX = props.paddingX ?? props.px ?? props.padding ?? props.p ?? 0;
  const paddingY = props.paddingY ?? props.py ?? props.padding ?? props.p ?? 0;
  const paddingTop = props.paddingTop ?? props.pt ?? paddingY;
  const paddingRight = props.paddingRight ?? props.pr ?? paddingX;
  const paddingBottom = props.paddingBottom ?? props.pb ?? paddingY;
  const paddingLeft = props.paddingLeft ?? props.pl ?? paddingX;

  const bleedX = props.bleedX === 'asPadding' ? paddingX : props.bleedX;
  const bleedY = props.bleedY === 'asPadding' ? paddingY : props.bleedY;
  const bleedTop = props.bleedTop === 'asPadding' ? paddingTop : props.bleedTop;
  const bleedRight = props.bleedRight === 'asPadding' ? paddingRight : props.bleedRight;
  const bleedBottom = props.bleedBottom === 'asPadding' ? paddingBottom : props.bleedBottom;
  const bleedLeft = props.bleedLeft === 'asPadding' ? paddingLeft : props.bleedLeft;

  const applyNegative = (value: TokenLength | undefined) => {
    const resolved = resolveLength(theme, value);
    return typeof resolved === 'number' ? -resolved : undefined;
  };

  if (bleedX !== undefined) {
    style.marginLeft = applyNegative(bleedX);
    style.marginRight = applyNegative(bleedX);
  }
  if (bleedY !== undefined) {
    style.marginTop = applyNegative(bleedY);
    style.marginBottom = applyNegative(bleedY);
  }
  if (bleedTop !== undefined) style.marginTop = applyNegative(bleedTop);
  if (bleedRight !== undefined) style.marginRight = applyNegative(bleedRight);
  if (bleedBottom !== undefined) style.marginBottom = applyNegative(bleedBottom);
  if (bleedLeft !== undefined) style.marginLeft = applyNegative(bleedLeft);
}

export function resolveBoxStyle(theme: AppTheme, props: BoxStyleProps) {
  const style: MutableStyle = {};
  const backgroundColor = resolveColor(theme, props.bg ?? props.background);

  if (props.display === 'none') style.display = 'none';
  if (backgroundColor) style.backgroundColor = backgroundColor;
  if (props.borderColor) style.borderColor = resolveColor(theme, props.borderColor);
  if (props.borderWidth !== undefined) style.borderWidth = resolveBorderWidth(props.borderWidth);
  if (props.borderTopWidth !== undefined) style.borderTopWidth = resolveBorderWidth(props.borderTopWidth);
  if (props.borderRightWidth !== undefined) style.borderRightWidth = resolveBorderWidth(props.borderRightWidth);
  if (props.borderBottomWidth !== undefined) style.borderBottomWidth = resolveBorderWidth(props.borderBottomWidth);
  if (props.borderLeftWidth !== undefined) style.borderLeftWidth = resolveBorderWidth(props.borderLeftWidth);
  if (props.borderRadius !== undefined) style.borderRadius = resolveRadius(theme, props.borderRadius);
  if (props.borderTopLeftRadius !== undefined) style.borderTopLeftRadius = resolveRadius(theme, props.borderTopLeftRadius);
  if (props.borderTopRightRadius !== undefined) style.borderTopRightRadius = resolveRadius(theme, props.borderTopRightRadius);
  if (props.borderBottomRightRadius !== undefined) style.borderBottomRightRadius = resolveRadius(theme, props.borderBottomRightRadius);
  if (props.borderBottomLeftRadius !== undefined) style.borderBottomLeftRadius = resolveRadius(theme, props.borderBottomLeftRadius);
  if (props.boxShadow && props.boxShadow in theme.shadow) Object.assign(style, theme.shadow[props.boxShadow]);

  if (props.width !== undefined) style.width = resolveSize(theme, props.width);
  if (props.minWidth !== undefined) style.minWidth = resolveSize(theme, props.minWidth);
  if (props.maxWidth !== undefined) style.maxWidth = resolveSize(theme, props.maxWidth);
  if (props.height !== undefined) style.height = resolveSize(theme, props.height);
  if (props.minHeight !== undefined) style.minHeight = resolveSize(theme, props.minHeight);
  if (props.maxHeight !== undefined) style.maxHeight = resolveSize(theme, props.maxHeight);

  if (props.position) style.position = props.position;
  if (props.top !== undefined) style.top = resolveLength(theme, props.top);
  if (props.right !== undefined) style.right = resolveLength(theme, props.right);
  if (props.bottom !== undefined) style.bottom = resolveLength(theme, props.bottom);
  if (props.left !== undefined) style.left = resolveLength(theme, props.left);
  if (props.overflow) style.overflow = props.overflow;
  if (props.zIndex !== undefined) style.zIndex = props.zIndex;
  if (props.flex !== undefined) style.flex = props.flex;

  applySpacing(style, theme, props, 'padding');
  applySpacing(style, theme, props, 'margin');
  applyBleed(style, theme, props);

  if (props.flexGrow !== undefined) style.flexGrow = props.flexGrow === true ? 1 : props.flexGrow;
  if (props.flexShrink !== undefined) style.flexShrink = props.flexShrink === true ? 1 : props.flexShrink;
  if (props.flexDirection) style.flexDirection = normalizeAlias(props.flexDirection) as ViewStyle['flexDirection'];
  if (props.flexWrap) style.flexWrap = resolveWrap(props.flexWrap);
  if (props.justifyContent) style.justifyContent = normalizeAlias(props.justifyContent) as ViewStyle['justifyContent'];
  if (props.alignItems) style.alignItems = normalizeAlias(props.alignItems) as ViewStyle['alignItems'];
  if (props.alignContent) style.alignContent = normalizeAlias(props.alignContent) as ViewStyle['alignContent'];
  if (props.alignSelf) style.alignSelf = normalizeAlias(props.alignSelf) as ViewStyle['alignSelf'];
  if (props.gap !== undefined) style.gap = resolveLength(theme, props.gap);
  if (props.rowGap !== undefined) style.rowGap = resolveLength(theme, props.rowGap);
  if (props.columnGap !== undefined) style.columnGap = resolveLength(theme, props.columnGap);

  return StyleSheet.flatten(style as ViewStyle & TextStyle);
}

export function resolveFlexStyle(theme: AppTheme, props: FlexStyleProps) {
  return resolveBoxStyle(theme, {
    ...props,
    flexDirection: props.direction ?? props.flexDirection,
    flexWrap: props.wrap ?? props.flexWrap,
    alignItems: props.align ?? props.alignItems,
    justifyContent: props.justify ?? props.justifyContent,
    flexGrow: props.grow ?? props.flexGrow,
    flexShrink: props.shrink ?? props.flexShrink,
  });
}
