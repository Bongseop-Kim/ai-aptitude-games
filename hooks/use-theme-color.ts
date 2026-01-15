import { AliasTokens } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

type AliasTokenPath =
  | keyof typeof AliasTokens.light
  | `brand.${keyof typeof AliasTokens.light.brand}`
  | `border.${keyof typeof AliasTokens.light.border}`
  | `feedback.${keyof typeof AliasTokens.light.feedback}`
  | `surface.${keyof typeof AliasTokens.light.surface}`
  | `text.${keyof typeof AliasTokens.light.text}`
  | `overlay.${keyof typeof AliasTokens.light.overlay}`;

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorPath: AliasTokenPath
): string {
  const theme = useColorScheme() ?? "light";
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  }

  // 중첩된 경로 처리 (예: "surface.base")
  const pathParts = colorPath.split(".");
  if (pathParts.length === 2) {
    const [category, key] = pathParts as [
      keyof typeof AliasTokens.light,
      string
    ];
    const tokens = AliasTokens[theme][category] as Record<string, string>;
    return tokens[key];
  }

  // 최상위 키인 경우 에러 (중첩된 경로만 지원)
  throw new Error(
    `Invalid color path: "${colorPath}". Please use nested path like "surface.base"`
  );
}
