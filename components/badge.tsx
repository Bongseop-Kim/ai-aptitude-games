import { getAliasTokens } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { StyleProp, StyleSheet, View, ViewStyle, type ViewProps } from "react-native";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";

export type BadgeVariant =
  | "default"
  | "color"
  | "secondary"
  | "warning"
  | "success"
  | "error";
export type BadgeType = "fill" | "ghost";
export type BadgeKind = "number" | "text";
export type BadgeShape = "default" | "speech";
export type SpeechTailPosition = "bottom" | "top";

export type BadgeProps = Omit<ViewProps, "style"> & {
  variant?: BadgeVariant;
  type?: BadgeType;
  kind?: BadgeKind;
  shape?: BadgeShape;
  tailPosition?: SpeechTailPosition;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

type ColorMode = "light" | "dark";

// variant별 색상 토큰 매핑
const getVariantColors = (variant: BadgeVariant, mode: ColorMode) => {
  const tokens = getAliasTokens(mode);

  switch (variant) {
    case "default":
      return {
        bg: tokens.surface.layer1,
        text: tokens.text.secondary,
        border: tokens.border.base,
      };
    case "color":
      return {
        bg: tokens.brand.primary,
        text: tokens.text.inversePrimary,
        border: tokens.brand.primary,
      };
    case "secondary":
      return {
        bg: tokens.brand.secondary,
        text: tokens.text.primary,
        border: tokens.brand.secondary,
      };
    case "warning":
      return {
        bg: tokens.feedback.warningFg,
        text: tokens.text.inversePrimary,
        border: tokens.feedback.warningFg,
      };
    case "success":
      return {
        bg: tokens.feedback.successFg,
        text: tokens.text.inversePrimary,
        border: tokens.feedback.successFg,
      };
    case "error":
      return {
        bg: tokens.feedback.errorFg,
        text: tokens.text.inversePrimary,
        border: tokens.feedback.errorFg,
      };
  }
};

// ghost 타입의 텍스트 색상
const getGhostTextColor = (variant: BadgeVariant, mode: ColorMode) => {
  const tokens = getAliasTokens(mode);
  const colors = getVariantColors(variant, mode);

  // default variant는 border.base가 너무 밝아서 text.secondary 사용
  if (variant === "default") {
    return tokens.text.secondary;
  }

  // 나머지는 테두리 색상과 동일
  return colors.border;
};

export function Badge({
  variant = "default",
  type = "fill",
  kind = "text",
  shape = "default",
  tailPosition = "bottom",
  children,
  style,
  ...rest
}: BadgeProps) {
  const colorScheme = useColorScheme();

  // 배경색 계산
  const getBackgroundColor = (mode: ColorMode) => {
    if (type === "ghost") {
      return "transparent";
    }
    return getVariantColors(variant, mode).bg;
  };

  // 텍스트 색상 계산
  const getTextColor = (mode: ColorMode) => {
    if (type === "ghost") {
      // ghost 타입일 때는 테두리 색상과 동일한 색상 사용
      return getGhostTextColor(variant, mode);
    }
    return getVariantColors(variant, mode).text;
  };

  // 테두리 스타일 계산
  const getBorderStyle = (mode: ColorMode) => {
    if (type === "fill") {
      return {};
    }
    const colors = getVariantColors(variant, mode);
    return {
      borderWidth: 1,
      borderColor: colors.border,
    };
  };

  // 말풍선 꼬리 색상 계산
  const getTailColor = (mode: ColorMode) => {
    if (type === "ghost") {
      return getVariantColors(variant, mode).border;
    }
    return getVariantColors(variant, mode).bg;
  };

  const isNumber = kind === "number";
  const minWidth = isNumber ? 20 : undefined;
  const paddingHorizontal = isNumber ? 6 : 8;
  const paddingVertical = isNumber ? 2 : 4;
  const isSpeech = shape === "speech";

  // 라이트/다크 모드별 스타일
  const lightBorderStyle = getBorderStyle("light");
  const darkBorderStyle = getBorderStyle("dark");

  // 말풍선 꼬리 스타일 계산
  const getTailStyle = (mode: ColorMode) => {
    const tailColor = getTailColor(mode);
    const baseTailStyle = {
      width: 0,
      height: 0,
      backgroundColor: "transparent",
    };

    switch (tailPosition) {
      case "bottom":
        return {
          ...baseTailStyle,
          borderLeftWidth: 6,
          borderRightWidth: 6,
          borderTopWidth: 8,
          borderLeftColor: "transparent",
          borderRightColor: "transparent",
          borderTopColor: tailColor,
        };
      case "top":
        return {
          ...baseTailStyle,
          borderLeftWidth: 6,
          borderRightWidth: 6,
          borderBottomWidth: 8,
          borderLeftColor: "transparent",
          borderRightColor: "transparent",
          borderBottomColor: tailColor,
        };
    }
  };

  const lightTailStyle = getTailStyle("light");
  const darkTailStyle = getTailStyle("dark");
  const currentTailStyle =
    colorScheme === "dark" ? darkTailStyle : lightTailStyle;

  // 말풍선 꼬리 위치에 따른 컨테이너 스타일
  const getContainerStyle = () => {
    if (!isSpeech) return {};
    switch (tailPosition) {
      case "bottom":
        return { marginBottom: 8 };
      case "top":
        return { marginTop: 8 };
    }
  };

  const badgeContent = (
    <ThemedView
      lightColor={getBackgroundColor("light")}
      darkColor={getBackgroundColor("dark")}
      style={[
        styles.badge,
        {
          minWidth,
          paddingHorizontal,
          paddingVertical,
        },
        // 테두리는 현재 테마에 맞춰 적용
        colorScheme === "dark" ? darkBorderStyle : lightBorderStyle,
        isNumber && styles.numberBadge,
        style,
      ]}
      {...rest}
    >
      <ThemedText
        lightColor={getTextColor("light")}
        darkColor={getTextColor("dark")}
        type="captionS"
      >
        {children}
      </ThemedText>
    </ThemedView>
  );

  if (!isSpeech) {
    return badgeContent;
  }

  // 말풍선 모양일 때 꼬리 추가
  return (
    <View style={[styles.speechContainer, getContainerStyle()]}>
      {tailPosition === "top" && (
        <View style={[styles.tail, currentTailStyle]} />
      )}
      {badgeContent}
      {tailPosition === "bottom" && (
        <View style={[styles.tail, currentTailStyle]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 28,
  },
  numberBadge: {
    borderRadius: 10,
  },
  speechContainer: {
    alignSelf: "flex-start",
    alignItems: "center",
  },
  tail: {
    alignSelf: "center",
  },
});
