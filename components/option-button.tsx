import { getSemanticTokens } from "@/constants/theme";
import { Pressable, StyleSheet } from "react-native";
import { ThemedText } from "./themed-text";

export type Option<T extends string> = { label: string; value: T };

export function OptionButton<T extends string>({
  option,
  isSelected,
  disabled,
  colors,
  onPress,
}: {
  option: Option<T>;
  isSelected: boolean;
  disabled: boolean;
  colors: ReturnType<typeof getSemanticTokens>;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.option,
        {
          backgroundColor: colors.interactive.bgDefault,
          borderColor: isSelected
            ? colors.interactive.borderDefault
            : colors.field.borderMuted,
        },
      ]}
    >
      <ThemedText
        type="captionM"
        style={{
          color: isSelected
            ? colors.interactive.textDefault
            : colors.field.textMute,
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
