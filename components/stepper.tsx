import { getSemanticTokens } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { ThemedText } from "./themed-text";

export type StepperProps = {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
};

export function Stepper({
  label,
  value,
  onChange,
  min = 1,
  max = 100,
  step = 1,
  disabled = false,
}: StepperProps) {
  const colorScheme = useColorScheme();
  const colors = getSemanticTokens(colorScheme ?? "light").field;
  const [isFocused, setIsFocused] = useState(false);
  const [tempValue, setTempValue] = useState(value.toString());

  const handleDecrement = () => {
    if (disabled) return;
    const newValue = Math.max(min, value - step);
    onChange(newValue);
    setTempValue(newValue.toString());
  };

  const handleIncrement = () => {
    if (disabled) return;
    const newValue = Math.min(max, value + step);
    onChange(newValue);
    setTempValue(newValue.toString());
  };

  const handleTextChange = (text: string) => {
    // 숫자만 입력 가능
    const numericText = text.replace(/[^0-9]/g, "");
    setTempValue(numericText);
  };

  const handleBlur = () => {
    setIsFocused(false);
    const numValue = parseInt(tempValue, 10);

    if (isNaN(numValue) || tempValue === "") {
      // 유효하지 않은 경우 이전 값으로 복원
      setTempValue(value.toString());
    } else {
      // min, max 범위 내로 제한
      const clampedValue = Math.max(min, Math.min(max, numValue));
      onChange(clampedValue);
      setTempValue(clampedValue.toString());
    }
  };

  const getBorderColor = () => {
    if (disabled) {
      return colors.borderMuted;
    }
    if (isFocused) {
      return colors.textPrimary;
    }
    return colors.borderDefault;
  };

  const getBackgroundColor = () => {
    if (disabled) {
      return colors.bgMuted;
    }
    return colors.bgDefault;
  };

  const getTextColor = () => {
    if (disabled) {
      return colors.textDisabled;
    }
    return colors.textDefault;
  };

  const getButtonColor = () => {
    if (disabled) {
      return colors.textDisabled;
    }
    return colors.textPrimary;
  };

  const isMinDisabled = disabled || value <= min;
  const isMaxDisabled = disabled || value >= max;

  return (
    <View style={styles.container}>
      {label && (
        <ThemedText
          type="captionS"
          style={[styles.label, disabled && { color: colors.textDisabled }]}
        >
          {label}
        </ThemedText>
      )}
      <View
        style={[
          styles.stepperContainer,
          {
            borderColor: getBorderColor(),
            backgroundColor: getBackgroundColor(),
          },
        ]}
      >
        <TouchableOpacity
          onPress={handleDecrement}
          disabled={isMinDisabled}
          style={styles.button}
        >
          <ThemedText
            style={[
              styles.buttonText,
              {
                color: isMinDisabled ? colors.textDisabled : getButtonColor(),
              },
            ]}
          >
            −
          </ThemedText>
        </TouchableOpacity>

        <TextInput
          value={isFocused ? tempValue : value.toString()}
          onChangeText={handleTextChange}
          onFocus={() => {
            setIsFocused(true);
            setTempValue(value.toString());
          }}
          onBlur={handleBlur}
          editable={!disabled}
          keyboardType="number-pad"
          style={[
            styles.input,
            {
              color: getTextColor(),
            },
          ]}
          textAlign="center"
        />

        <TouchableOpacity
          onPress={handleIncrement}
          disabled={isMaxDisabled}
          style={styles.button}
        >
          <ThemedText
            style={[
              styles.buttonText,
              {
                color: isMaxDisabled ? colors.textDisabled : getButtonColor(),
              },
            ]}
          >
            +
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  label: {
    marginBottom: 4,
  },
  stepperContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
  },
  button: {
    width: 40,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 20,
    fontWeight: "600",
    fontFamily: "Pretendard-SemiBold",
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Pretendard-Regular",
    fontWeight: "400",
    paddingHorizontal: 8,
  },
});
