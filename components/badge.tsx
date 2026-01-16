import { getAliasTokens } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { StyleSheet, type ViewProps } from "react-native";
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

export type BadgeProps = Omit<ViewProps, "style"> & {
  variant?: BadgeVariant;
  type?: BadgeType;
  kind?: BadgeKind;
  children: React.ReactNode;
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

// ghost 타입의 텍스트 색상 (테두리와 동일)
const getGhostTextColor = (variant: BadgeVariant, mode: ColorMode) => {
  const colors = getVariantColors(variant, mode);
  return colors.border;
};

export function Badge({
  variant = "default",
  type = "fill",
  kind = "text",
  children,
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

  const isNumber = kind === "number";
  const minWidth = isNumber ? 20 : undefined;
  const paddingHorizontal = isNumber ? 6 : 8;
  const paddingVertical = isNumber ? 2 : 4;

  // 라이트/다크 모드별 스타일
  const lightBorderStyle = getBorderStyle("light");
  const darkBorderStyle = getBorderStyle("dark");

  return (
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
      ]}
      {...rest}
    >
      <ThemedText
        lightColor={getTextColor("light")}
        darkColor={getTextColor("dark")}
        style={[
          styles.text,
          {
            fontSize: 12,
            lineHeight: 16,
          },
        ]}
      >
        {children}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  numberBadge: {
    borderRadius: 10,
  },
  text: {
    fontFamily: "Pretendard-Bold",
    fontWeight: "700",
  },
});
