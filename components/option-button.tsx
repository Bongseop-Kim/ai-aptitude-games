import { getAliasTokens } from "@/constants/theme";
import { Pressable, StyleSheet, useColorScheme } from "react-native";
import { ThemedText } from "./themed-text";

export type Option<T extends string> = { label: string; value: T };

export function OptionButton<T extends string>({
  option,
  isSelected,
  disabled,
  onPress,
}: {
  option: Option<T>;
  isSelected: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  const colorScheme = useColorScheme();
  const colors = getAliasTokens(colorScheme ?? "light");

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.option,
        {
          backgroundColor: colors.surface.base,
          borderColor: isSelected
            ? colors.brand.primary
            : colors.surface.layer2,
        },
      ]}
    >
      <ThemedText
        type={isSelected ? "labelM" : "captionM"}
        style={{
          color: isSelected ? colors.brand.primary : colors.text.secondary,
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
