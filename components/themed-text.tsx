import { Typography, type TypographyKey } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Text, type TextProps } from "react-native";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: TypographyKey;
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = "body1",
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor(
    { light: lightColor, dark: darkColor },
    "text.primary"
  );

  // Typography system에서 스타일 가져오기
  const getTypographyStyle = () => {
    if (type in Typography) {
      return Typography[type as TypographyKey];
    }
    return Typography.body1;
  };

  return <Text style={[{ color }, getTypographyStyle(), style]} {...rest} />;
}
