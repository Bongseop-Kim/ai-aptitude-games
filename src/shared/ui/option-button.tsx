import { getAliasTokens } from "../config/theme";
import { Pressable, StyleSheet, useColorScheme } from "react-native";
import { ThemedText } from "./themed-text";

export type Option<T extends string> = { label: string; value: T };

export function OptionButton<T extends string>({
  option,
  isSelected,
  disabled,
  onPress,
  accessibilityHint,
  accessibilityHintSuffix,
}: {
  option: Option<T>;
  isSelected: boolean;
  disabled: boolean;
  onPress: () => void;
  accessibilityHint?: string;
  accessibilityHintSuffix?: string;
}) {
  const colorScheme = useColorScheme();
  const colors = getAliasTokens(colorScheme ?? "light");
  const hint = [accessibilityHint, accessibilityHintSuffix]
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={`${option.label}${isSelected ? ", 선택됨" : ""}`}
      accessibilityHint={hint}
      accessibilityState={{ selected: isSelected, disabled }}
      style={[
        styles.option,
        {
          backgroundColor: disabled
            ? colors.surface.muted
            : colors.surface.base,
          borderColor: disabled
            ? colors.border.muted
            : isSelected
            ? colors.brand.primary
            : colors.surface.layer2,
          opacity: disabled ? 0.6 : 1,
        },
      ]}
    >
      <ThemedText
        type={isSelected ? "labelM" : "captionM"}
        style={{
          color: disabled
            ? colors.text.disabled
            : isSelected
            ? colors.brand.primary
            : colors.text.secondary,
        }}
      >
        {option.label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  option: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
});
