import { getSemanticTokens } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { Option, OptionButton } from "./option-button";

export type SegmentedPickerProps<T extends string> = {
  options: Array<{ label: string; value: T }>;
  value?: T;
  onChange: (value: T) => void;
  columns?: number;
  disabled?: boolean;
};

export function SegmentedPicker<T extends string>({
  options,
  value,
  onChange,
  columns = 3,
  disabled = false,
}: SegmentedPickerProps<T>) {
  const colorScheme = useColorScheme();
  const colors = getSemanticTokens(colorScheme ?? "light");

  // options를 columns 크기로 나누어 2중 배열로 재구성 (메모이제이션)
  const rows = useMemo(() => {
    const result: Option<T>[][] = [];
    for (let i = 0; i < options.length; i += columns) {
      result.push(options.slice(i, i + columns));
    }
    return result;
  }, [options, columns]);

  const handlePress = (optionValue: T) => {
    if (!disabled) {
      onChange(optionValue);
    }
  };

  return (
    <View style={styles.container}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((option) => (
            <OptionButton
              key={option.value}
              option={option}
              isSelected={value === option.value}
              disabled={disabled}
              colors={colors}
              onPress={() => handlePress(option.value)}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: 4,
  },
  row: {
    flexDirection: "row",
    width: "100%",
    gap: 4,
  },
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
