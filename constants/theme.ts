// ============================================================================
// 1. PRIMITIVE TOKENS
// ============================================================================
// 기본 색상 팔레트 - 디자인 시스템의 최하위 레이어

import { Dimensions } from "react-native";

export const PrimitiveColors = {
  // Red Scale
  red: {
    50: "#FEF2F2",
    100: "#FEE2E2",
    200: "#FECACA",
    300: "#FCA5A5",
    400: "#F87171",
    500: "#EF4444",
    600: "#DC2626",
    700: "#B91C1C",
    800: "#991B1B",
    900: "#7F1D1D",
  },
  // Orange Scale
  orange: {
    50: "#FFF7EC",
    100: "#FFECD3",
    200: "#FFD5A5",
    300: "#FFB66D",
    400: "#FF8C32",
    500: "#FF6B0A",
    600: "#FF5100",
    700: "#CC3802",
    800: "#9C2C01",
    900: "#82270C",
  },
  // Yellow Scale
  yellow: {
    50: "#FFFFE7",
    100: "#FEFFC1",
    200: "#FFFD86",
    300: "#FFF441",
    400: "#FFE50D",
    500: "#FFD600",
    600: "#D1B400",
    700: "#A67102",
    800: "#89570A",
    900: "#74470F",
  },
  // Green Scale
  green: {
    50: "#F0FDF5",
    100: "#DCFCE8",
    200: "#BBF7D1",
    300: "#86EFAD",
    400: "#4ADE80",
    500: "#22C55E",
    600: "#16A34A",
    700: "#15803C",
    800: "#166533",
    900: "#14532B",
  },
  // Teal Scale
  teal: {
    50: "#F0FDFC",
    100: "#CCFBF6",
    200: "#99F6EC",
    300: "#5EEADB",
    400: "#2DD4C2",
    500: "#14B8A6",
    600: "#0D9485",
    700: "#0F766B",
    800: "#115E56",
    900: "#134E48",
  },
  // Blue Scale
  blue: {
    50: "#EDF9FF",
    100: "#D6F0FF",
    200: "#B5E7FF",
    300: "#83D9FF",
    400: "#48C3FF",
    500: "#1EA2FF",
    600: "#0683FF",
    700: "#006FFF",
    800: "#0855C5",
    900: "#0D4B9B",
  },
  // Purple Scale
  purple: {
    50: "#F5F2FF",
    100: "#ECE8FF",
    200: "#DBD4FF",
    300: "#C2B1FF",
    400: "#A385FF",
    500: "#8A58FF",
    600: "#7830F7",
    700: "#6A1EE3",
    800: "#5818BF",
    900: "#49169C",
  },
  // Neutral Scale
  neutral: {
    0: "#FFFFFF",
    100: "#F2F8FC",
    200: "#E8EEF2",
    300: "#BBC5CC",
    400: "#A4ADB2",
    500: "#8C9499",
    600: "#757B80",
    700: "#5E6366",
    800: "#464A4D",
    900: "#2F3133",
    1000: "#17191A",
    1100: "#000000",
  },
  // Neutral Alpha - Dark
  alpha: {
    dark0: "rgba(0, 0, 0, 0.00)",
    dark10: "rgba(0, 0, 0, 0.10)",
    dark20: "rgba(0, 0, 0, 0.20)",
    dark30: "rgba(0, 0, 0, 0.30)",
    dark40: "rgba(0, 0, 0, 0.40)",
    dark50: "rgba(0, 0, 0, 0.50)",
    dark60: "rgba(0, 0, 0, 0.60)",
    dark70: "rgba(0, 0, 0, 0.70)",
    dark80: "rgba(0, 0, 0, 0.80)",
    dark90: "rgba(0, 0, 0, 0.90)",
    // Neutral Alpha - Light
    light0: "rgba(255, 255, 255, 0.00)",
    light10: "rgba(255, 255, 255, 0.10)",
    light20: "rgba(255, 255, 255, 0.20)",
    light30: "rgba(255, 255, 255, 0.30)",
    light40: "rgba(255, 255, 255, 0.40)",
    light50: "rgba(255, 255, 255, 0.50)",
    light60: "rgba(255, 255, 255, 0.60)",
    light70: "rgba(255, 255, 255, 0.70)",
    light80: "rgba(255, 255, 255, 0.80)",
    light90: "rgba(255, 255, 255, 0.90)",
  },
} as const;

// ============================================================================
// 2. ALIAS TOKENS
// ============================================================================
// Primitive 토큰을 참조하는 중간 레이어 - 의미적 그룹핑

export const AliasTokens = {
  light: {
    // Brand Colors
    brand: {
      primary: PrimitiveColors.blue[700],
      secondary: PrimitiveColors.blue[200],
      tertiary: PrimitiveColors.teal[500],
      accent: PrimitiveColors.orange[600],
      primaryAlpha10: "rgba(0, 111, 255, 0.10)",
      primaryAlpha20: "rgba(0, 111, 255, 0.20)",
      primaryAlpha30: "rgba(0, 111, 255, 0.30)",
      primaryAlpha40: "rgba(0, 111, 255, 0.40)",
      primaryAlpha50: "rgba(0, 111, 255, 0.50)",
      primaryAlpha60: "rgba(0, 111, 255, 0.60)",
      primaryAlpha70: "rgba(0, 111, 255, 0.70)",
      primaryAlpha80: "rgba(0, 111, 255, 0.80)",
      primaryAlpha90: "rgba(0, 111, 255, 0.90)",
    },
    // Border Colors
    border: {
      base: PrimitiveColors.neutral[200],
      layer1: PrimitiveColors.neutral[300],
      layer2: PrimitiveColors.neutral[400],
      layer3: PrimitiveColors.neutral[500],
      muted: PrimitiveColors.neutral[100],
      inverse: PrimitiveColors.neutral[900],
      transparent: PrimitiveColors.alpha.dark0,
      alpha: PrimitiveColors.alpha.dark10,
      alphaInverse: PrimitiveColors.alpha.light10,
    },
    // Feedback Colors
    feedback: {
      successFg: PrimitiveColors.green[600],
      warningFg: PrimitiveColors.yellow[600],
      errorFg: PrimitiveColors.red[500],
      infoFg: PrimitiveColors.blue[600],
      successBg: PrimitiveColors.green[200],
      warningBg: PrimitiveColors.yellow[100],
      errorBg: PrimitiveColors.red[100],
      infoBg: PrimitiveColors.blue[100],
    },
    // Surface Colors
    surface: {
      base: PrimitiveColors.neutral[0],
      layer1: PrimitiveColors.neutral[100],
      layer2: PrimitiveColors.neutral[200],
      layer3: PrimitiveColors.neutral[300],
      muted: PrimitiveColors.neutral[200],
      inverse: PrimitiveColors.neutral[1100],
      transparent: PrimitiveColors.alpha.light0,
      alpha: PrimitiveColors.alpha.light30,
      alphaInverse: PrimitiveColors.alpha.dark30,
    },
    // Text Colors
    text: {
      primary: PrimitiveColors.neutral[1000],
      secondary: PrimitiveColors.neutral[800],
      tertiary: PrimitiveColors.neutral[600],
      disabled: PrimitiveColors.neutral[400],
      link: PrimitiveColors.blue[700],
      linkHover: "rgba(0, 111, 255, 0.90)",
      inversePrimary: PrimitiveColors.neutral[0],
      inverseSecondary: PrimitiveColors.neutral[200],
      inverseTertiary: PrimitiveColors.neutral[300],
    },
    // Overlay Colors
    overlay: {
      base: PrimitiveColors.alpha.dark60,
      soft: PrimitiveColors.alpha.dark30,
      inverse: PrimitiveColors.alpha.light60,
    },
  },
  dark: {
    // Brand Colors (same as light mode)
    brand: {
      primary: PrimitiveColors.blue[700],
      secondary: PrimitiveColors.blue[200],
      tertiary: PrimitiveColors.teal[500],
      accent: PrimitiveColors.orange[600],
      primaryAlpha10: "rgba(0, 111, 255, 0.10)",
      primaryAlpha20: "rgba(0, 111, 255, 0.20)",
      primaryAlpha30: "rgba(0, 111, 255, 0.30)",
      primaryAlpha40: "rgba(0, 111, 255, 0.40)",
      primaryAlpha50: "rgba(0, 111, 255, 0.50)",
      primaryAlpha60: "rgba(0, 111, 255, 0.60)",
      primaryAlpha70: "rgba(0, 111, 255, 0.70)",
      primaryAlpha80: "rgba(0, 111, 255, 0.80)",
      primaryAlpha90: "rgba(0, 111, 255, 0.90)",
    },
    // Border Colors
    border: {
      base: PrimitiveColors.neutral[900],
      layer1: PrimitiveColors.neutral[800],
      layer2: PrimitiveColors.neutral[700],
      layer3: PrimitiveColors.neutral[600],
      muted: PrimitiveColors.neutral[1000],
      inverse: PrimitiveColors.neutral[200],
      transparent: PrimitiveColors.alpha.dark0,
      alpha: PrimitiveColors.alpha.light10,
      alphaInverse: PrimitiveColors.alpha.dark10,
    },
    // Feedback Colors (same as light mode)
    feedback: {
      successFg: PrimitiveColors.green[600],
      warningFg: PrimitiveColors.yellow[600],
      errorFg: PrimitiveColors.red[500],
      infoFg: PrimitiveColors.blue[600],
      successBg: PrimitiveColors.green[200],
      warningBg: PrimitiveColors.yellow[100],
      errorBg: PrimitiveColors.red[100],
      infoBg: PrimitiveColors.blue[100],
    },
    // Surface Colors
    surface: {
      base: PrimitiveColors.neutral[1100],
      layer1: PrimitiveColors.neutral[1000],
      layer2: PrimitiveColors.neutral[900],
      layer3: PrimitiveColors.neutral[800],
      muted: PrimitiveColors.neutral[900],
      inverse: PrimitiveColors.neutral[0],
      transparent: PrimitiveColors.alpha.dark0,
      alpha: PrimitiveColors.alpha.dark30,
      alphaInverse: PrimitiveColors.alpha.light30,
    },
    // Text Colors
    text: {
      primary: PrimitiveColors.neutral[0],
      secondary: PrimitiveColors.neutral[200],
      tertiary: PrimitiveColors.neutral[300],
      disabled: PrimitiveColors.neutral[500],
      link: PrimitiveColors.blue[700],
      linkHover: "rgba(0, 111, 255, 0.90)",
      inversePrimary: PrimitiveColors.neutral[0],
      inverseSecondary: PrimitiveColors.neutral[200],
      inverseTertiary: PrimitiveColors.neutral[300],
    },
    // Overlay Colors (same as light mode)
    overlay: {
      base: PrimitiveColors.alpha.dark60,
      soft: PrimitiveColors.alpha.dark30,
      inverse: PrimitiveColors.alpha.light60,
    },
  },
} as const;

// ============================================================================
// 3. SEMANTIC TOKENS
// ============================================================================
// 실제 UI 컴포넌트에서 사용하는 토큰 - Alias 토큰 참조

export const SemanticTokens = {
  light: {
    // Icon Colors
    icon: {
      default: AliasTokens.light.text.primary,
      hover: AliasTokens.light.text.secondary,
      muted: AliasTokens.light.text.tertiary,
      disabled: AliasTokens.light.text.disabled,
      primary: AliasTokens.light.text.link,
      success: AliasTokens.light.feedback.successFg,
      warning: AliasTokens.light.feedback.warningFg,
      error: AliasTokens.light.feedback.errorFg,
      info: AliasTokens.light.feedback.infoFg,
      inverse: AliasTokens.light.text.inversePrimary,
      inverseHover: AliasTokens.light.text.inverseSecondary,
    },
    // Button Colors
    button: {
      primaryBgDefault: AliasTokens.light.brand.primary,
      primaryBgHover: PrimitiveColors.blue[800],
      primaryTextDefault: AliasTokens.light.text.inversePrimary,
      secondaryBgDefault: PrimitiveColors.blue[50],
      secondaryBgHover: PrimitiveColors.blue[100],
      secondaryTextDefault: AliasTokens.light.text.link,
      tertiaryBgDefault: AliasTokens.light.surface.base,
      tertiaryBgHover: AliasTokens.light.surface.layer1,
      tertiaryTextDefault: AliasTokens.light.text.primary,
      tertiaryBorderDefault: AliasTokens.light.border.base,
      tertiaryBorderHover: AliasTokens.light.border.layer1,
      disabledBgDisabled: AliasTokens.light.surface.muted,
      disabledTextDisabled: AliasTokens.light.text.disabled,
    },
    // Field Colors
    field: {
      textDefault: AliasTokens.light.text.primary,
      textHover: AliasTokens.light.text.secondary,
      textMute: AliasTokens.light.text.tertiary,
      textDisabled: AliasTokens.light.text.disabled,
      textInverse: AliasTokens.light.text.inversePrimary,
      textPrimary: AliasTokens.light.text.link,
      borderDefault: AliasTokens.light.border.base,
      borderHover: AliasTokens.light.border.layer1,
      borderMuted: AliasTokens.light.border.muted,
      borderSuccess: AliasTokens.light.feedback.successFg,
      borderWarning: AliasTokens.light.feedback.warningFg,
      borderError: AliasTokens.light.feedback.errorFg,
      borderInfo: AliasTokens.light.feedback.infoFg,
      bgDefault: AliasTokens.light.surface.base,
      bgHover: AliasTokens.light.surface.layer1,
      bgMuted: AliasTokens.light.surface.muted,
      bgSuccess: AliasTokens.light.feedback.successBg,
      bgWarning: AliasTokens.light.feedback.warningBg,
      bgError: AliasTokens.light.feedback.errorBg,
      bgInfo: AliasTokens.light.feedback.infoBg,
    },
    // Interactive Colors
    interactive: {
      textDefault: AliasTokens.light.text.primary,
      textHover: AliasTokens.light.text.secondary,
      textMute: AliasTokens.light.text.tertiary,
      textDisabled: AliasTokens.light.text.disabled,
      textInverse: AliasTokens.light.text.inversePrimary,
      textPrimary: AliasTokens.light.text.link,
      bgDefault: AliasTokens.light.surface.base,
      bgHover: AliasTokens.light.surface.layer1,
      bgMuted: AliasTokens.light.surface.muted,
      bgSuccess: AliasTokens.light.feedback.successBg,
      bgWarning: AliasTokens.light.feedback.warningBg,
      bgError: AliasTokens.light.feedback.errorBg,
      bgInfo: AliasTokens.light.feedback.infoBg,
      borderDefault: AliasTokens.light.border.base,
      borderHover: AliasTokens.light.border.layer1,
      borderMuted: AliasTokens.light.border.muted,
      borderSuccess: AliasTokens.light.feedback.successFg,
      borderWarning: AliasTokens.light.feedback.warningFg,
      borderError: AliasTokens.light.feedback.errorFg,
      borderInfo: AliasTokens.light.feedback.infoFg,
    },
  },
  dark: {
    // Icon Colors
    icon: {
      default: AliasTokens.dark.text.primary,
      hover: AliasTokens.dark.text.secondary,
      muted: AliasTokens.dark.text.tertiary,
      disabled: AliasTokens.dark.text.disabled,
      primary: AliasTokens.dark.text.link,
      success: AliasTokens.dark.feedback.successFg,
      warning: AliasTokens.dark.feedback.warningFg,
      error: AliasTokens.dark.feedback.errorFg,
      info: AliasTokens.dark.feedback.infoFg,
      inverse: AliasTokens.dark.text.inversePrimary,
      inverseHover: AliasTokens.dark.text.inverseSecondary,
    },
    // Button Colors
    button: {
      primaryBgDefault: AliasTokens.dark.brand.primary,
      primaryBgHover: PrimitiveColors.blue[800],
      primaryTextDefault: AliasTokens.dark.text.inversePrimary,
      secondaryBgDefault: PrimitiveColors.blue[50],
      secondaryBgHover: PrimitiveColors.blue[100],
      secondaryTextDefault: AliasTokens.dark.text.link,
      tertiaryBgDefault: AliasTokens.dark.surface.base,
      tertiaryBgHover: AliasTokens.dark.surface.layer1,
      tertiaryTextDefault: AliasTokens.dark.text.primary,
      tertiaryBorderDefault: AliasTokens.dark.border.base,
      tertiaryBorderHover: AliasTokens.dark.border.layer1,
      disabledBgDisabled: AliasTokens.dark.surface.muted,
      disabledTextDisabled: AliasTokens.dark.text.disabled,
    },
    // Field Colors
    field: {
      textDefault: AliasTokens.dark.text.primary,
      textHover: AliasTokens.dark.text.secondary,
      textMute: AliasTokens.dark.text.tertiary,
      textDisabled: AliasTokens.dark.text.disabled,
      textInverse: AliasTokens.dark.text.inversePrimary,
      textPrimary: AliasTokens.dark.text.link,
      borderDefault: AliasTokens.dark.border.base,
      borderHover: AliasTokens.dark.border.layer1,
      borderMuted: AliasTokens.dark.border.muted,
      borderSuccess: AliasTokens.dark.feedback.successFg,
      borderWarning: AliasTokens.dark.feedback.warningFg,
      borderError: AliasTokens.dark.feedback.errorFg,
      borderInfo: AliasTokens.dark.feedback.infoFg,
      bgDefault: AliasTokens.dark.surface.base,
      bgHover: AliasTokens.dark.surface.layer1,
      bgMuted: AliasTokens.dark.surface.muted,
      bgSuccess: AliasTokens.dark.feedback.successBg,
      bgWarning: AliasTokens.dark.feedback.warningBg,
      bgError: AliasTokens.dark.feedback.errorBg,
      bgInfo: AliasTokens.dark.feedback.infoBg,
    },
    // Interactive Colors
    interactive: {
      textDefault: AliasTokens.dark.text.primary,
      textHover: AliasTokens.dark.text.secondary,
      textMute: AliasTokens.dark.text.tertiary,
      textDisabled: AliasTokens.dark.text.disabled,
      textInverse: AliasTokens.dark.text.inversePrimary,
      textPrimary: AliasTokens.dark.text.link,
      bgDefault: AliasTokens.dark.surface.base,
      bgHover: AliasTokens.dark.surface.layer1,
      bgMuted: AliasTokens.dark.surface.muted,
      bgSuccess: AliasTokens.dark.feedback.successBg,
      bgWarning: AliasTokens.dark.feedback.warningBg,
      bgError: AliasTokens.dark.feedback.errorBg,
      bgInfo: AliasTokens.dark.feedback.infoBg,
      borderDefault: AliasTokens.dark.border.base,
      borderHover: AliasTokens.dark.border.layer1,
      borderMuted: AliasTokens.dark.border.muted,
      borderSuccess: AliasTokens.dark.feedback.successFg,
      borderWarning: AliasTokens.dark.feedback.warningFg,
      borderError: AliasTokens.dark.feedback.errorFg,
      borderInfo: AliasTokens.dark.feedback.infoFg,
    },
  },
} as const;

export const Typography = {
  // Display Styles
  display: {
    fontSize: 120,
    lineHeight: 150, // 125%
    fontWeight: "700" as const,
    fontFamily: "Pretendard-Bold",
  },
  // Headline Styles
  headlineL: {
    fontSize: 36,
    lineHeight: 45, // 125%
    fontWeight: "700" as const,
    fontFamily: "Pretendard-Bold",
  },
  headlineM: {
    fontSize: 32,
    lineHeight: 40, // 125%
    fontWeight: "700" as const,
    fontFamily: "Pretendard-Bold",
  },
  headlineS: {
    fontSize: 28,
    lineHeight: 35, // 125%
    fontWeight: "700" as const,
    fontFamily: "Pretendard-Bold",
  },

  // Title Styles
  title1: {
    fontSize: 24,
    lineHeight: 30, // 125%
    fontWeight: "700" as const,
    fontFamily: "Pretendard-Bold",
  },
  title2: {
    fontSize: 20,
    lineHeight: 25, // 125%
    fontWeight: "700" as const,
    fontFamily: "Pretendard-Bold",
  },
  title3: {
    fontSize: 18,
    lineHeight: 22.5, // 125%
    fontWeight: "700" as const,
    fontFamily: "Pretendard-Bold",
  },

  // Label Styles
  labelL: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "700" as const,
    fontFamily: "Pretendard-Bold",
  },
  labelM: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700" as const,
    fontFamily: "Pretendard-Bold",
  },
  labelS: {
    fontSize: 12,
    lineHeight: 20,
    fontWeight: "700" as const,
    fontFamily: "Pretendard-Bold",
  },

  // Body Styles
  body1: {
    fontSize: 16,
    lineHeight: 28.8, // 180%
    fontWeight: "400" as const,
    fontFamily: "Pretendard-Regular",
  },
  body2: {
    fontSize: 14,
    lineHeight: 25.2, // 180%
    fontWeight: "400" as const,
    fontFamily: "Pretendard-Regular",
  },

  // Button Styles
  button1: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "700" as const,
    fontFamily: "Pretendard-Bold",
  },
  button2: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700" as const,
    fontFamily: "Pretendard-Bold",
  },
  button3: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700" as const,
    fontFamily: "Pretendard-Bold",
  },

  // Caption Styles
  captionL: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400" as const,
    fontFamily: "Pretendard-Regular",
  },
  captionM: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400" as const,
    fontFamily: "Pretendard-Regular",
  },
  captionS: {
    fontSize: 12,
    lineHeight: 20,
    fontWeight: "400" as const,
    fontFamily: "Pretendard-Regular",
  },
} as const;

export const Spacing = {
  spacing4: 4,
  spacing8: 8,
  spacing12: 12,
  spacing16: 16,
  spacing20: 20,
  spacing24: 24,
  spacing28: 28,
  spacing32: 32,
  spacing36: 36,
  spacing40: 40,
  spacing44: 44,
  spacing48: 48,
  spacing52: 52,
  spacing56: 56,
  spacing60: 60,
  spacing64: 64,
  spacing68: 68,
  spacing72: 72,
  spacing76: 76,
  spacing80: 80,
  spacing84: 84,
  spacing88: 88,
  spacing92: 92,
  spacing96: 96,
  spacing100: 100,
} as const;


export const Margin = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 40,
  xxl: 80,
} as const;

export const Padding = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 40,
  xxl: 80,
} as const;

export const BorderRadius = {
  none: 0,
  xxs: 4,
  xs: 8,
  s: 12,
  m: 20,
  l: 24,
  full: 999,
} as const;

export const Sizing = {
  xs: 24,
  s: 36,
  m: 40,
  l: 48
} as const;

export const BorderWidth = {
  none: 0,
  s: 1,
  m: 2,
  l: 3,
} as const;

export const WIDTH = Dimensions.get("window").width;

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type TypographyKey = keyof typeof Typography;

export type ColorMode = "light" | "dark";

export type PrimitiveColorKey = keyof typeof PrimitiveColors;
export type AliasTokenKey = keyof typeof AliasTokens.light;
export type SemanticTokenKey = keyof typeof SemanticTokens.light;

export type SpacingToken = keyof typeof Spacing;
export type MarginToken = keyof typeof Margin;
export type PaddingToken = keyof typeof Padding;
export type BorderRadiusToken = keyof typeof BorderRadius;
export type SizingToken = keyof typeof Sizing;
export type BorderWidthToken = keyof typeof BorderWidth;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * 현재 테마에 맞는 Alias 토큰을 가져옵니다
 * @param mode - 'light' 또는 'dark'
 * @returns AliasTokens 객체
 */
export const getAliasTokens = (mode: ColorMode) => AliasTokens[mode];

/**
 * 현재 테마에 맞는 Semantic 토큰을 가져옵니다
 * @param mode - 'light' 또는 'dark'
 * @returns SemanticTokens 객체
 */
export const getSemanticTokens = (mode: ColorMode) => SemanticTokens[mode];

/**
 * 사용 예시:
 *
 * Primitive 토큰 직접 사용
 * const primaryBlue = PrimitiveColors.blue[700];
 *
 * Alias 토큰 사용
 * const aliasTokens = getAliasTokens(colorScheme);
 * const brandColor = aliasTokens.brand.primary;
 *
 * Semantic 토큰 사용 (권장)
 * const semanticTokens = getSemanticTokens(colorScheme);
 * const buttonColor = semanticTokens.button.primaryBgDefault;
 */
