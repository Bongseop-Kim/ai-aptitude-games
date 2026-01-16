import { getSemanticTokens } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Pressable, StyleSheet, Text, type PressableProps } from "react-native";

export type BlockButtonVariant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "disabled";
export type BlockButtonSize = "m" | "l";

export type BlockButtonProps = Omit<PressableProps, "style"> & {
  variant?: BlockButtonVariant;
  size?: BlockButtonSize;
  children: React.ReactNode;
};

export function BlockButton({
  variant = "primary",
  size = "l",
  children,
  disabled,
  ...rest
}: BlockButtonProps) {
  const colorScheme = useColorScheme();
  const colors = getSemanticTokens(colorScheme ?? "light").button;

  const isDisabled = disabled || variant === "disabled";

  const getBackgroundColor = (pressed: boolean) => {
    if (isDisabled) {
      return colors.disabledBgDisabled;
    }

    switch (variant) {
      case "primary":
        return pressed ? colors.primaryBgHover : colors.primaryBgDefault;
      case "secondary":
        return pressed ? colors.secondaryBgHover : colors.secondaryBgDefault;
      case "tertiary":
        return pressed ? colors.tertiaryBgHover : colors.tertiaryBgDefault;
      default:
        return colors.primaryBgDefault;
    }
  };

  const getTextColor = () => {
    if (isDisabled) {
      return colors.disabledTextDisabled;
    }

    switch (variant) {
      case "primary":
        return colors.primaryTextDefault;
      case "secondary":
        return colors.secondaryTextDefault;
      case "tertiary":
        return colors.tertiaryTextDefault;
      default:
        return colors.primaryTextDefault;
    }
  };

  const getBorderStyle = (pressed: boolean) => {
    if (variant === "tertiary") {
      return {
        borderWidth: 1,
        borderColor: pressed
          ? colors.tertiaryBorderHover
          : colors.tertiaryBorderDefault,
      };
    }
    return {};
  };

  const height = size === "m" ? 40 : 48;

  return (
    <Pressable
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: getBackgroundColor(pressed),
          height,
        },
        getBorderStyle(pressed),
      ]}
      {...rest}
    >
      {({ pressed }) => (
        <Text
          style={[
            styles.text,
            {
              color: getTextColor(),
              fontSize: size === "m" ? 14 : 16,
              lineHeight: size === "m" ? 20 : 24,
            },
          ]}
        >
          {children}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "100%",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  text: {
    fontFamily: "Pretendard-Bold",
    fontWeight: "700",
  },
});
