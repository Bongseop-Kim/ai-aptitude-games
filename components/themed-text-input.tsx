import { getSemanticTokens } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useState } from "react";
import { StyleSheet, TextInput, View, type TextInputProps } from "react-native";
import { ThemedText } from "./themed-text";

export type ThemedTextInputVariant =
  | "default"
  | "error"
  | "success"
  | "disabled";

export type ThemedTextInputProps = Omit<TextInputProps, "style"> & {
  variant?: ThemedTextInputVariant;
  label?: string;
  helperText?: string;
  errorText?: string;
  disabled?: boolean;
};

export function ThemedTextInput({
  variant = "default",
  label,
  disabled,
  ...rest
}: ThemedTextInputProps) {
  const colorScheme = useColorScheme();
  const colors = getSemanticTokens(colorScheme ?? "light").field;
  const [isFocused, setIsFocused] = useState(false);

  const isDisabled = disabled || variant === "disabled";
  const isError = variant === "error";
  const isSuccess = variant === "success";

  const getBorderColor = () => {
    if (isDisabled) {
      return colors.borderMuted;
    }
    if (isError) {
      return colors.borderError;
    }
    if (isSuccess) {
      return colors.borderSuccess;
    }
    if (isFocused) {
      return colors.textPrimary;
    }
    return colors.borderDefault;
  };

  const getBackgroundColor = () => {
    if (isDisabled) {
      return colors.bgMuted;
    }
    if (isError) {
      return colors.bgError;
    }
    if (isSuccess) {
      return colors.bgSuccess;
    }
    return colors.bgDefault;
  };

  const getTextColor = () => {
    if (isDisabled) {
      return colors.textDisabled;
    }
    return colors.textDefault;
  };

  return (
    <View style={styles.container}>
      {label && (
        <ThemedText
          type="captionS"
          style={[styles.label, isDisabled && { color: colors.textDisabled }]}
        >
          {label}
        </ThemedText>
      )}
      <TextInput
        editable={!isDisabled}
        style={[
          styles.input,
          {
            borderColor: getBorderColor(),
            backgroundColor: getBackgroundColor(),
            color: getTextColor(),
          },
        ]}
        placeholderTextColor={colors.textMute}
        onFocus={(e) => {
          setIsFocused(true);
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          rest.onBlur?.(e);
        }}
        {...rest}
      />
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
  input: {
    height: 40,
    fontSize: 16,
    lineHeight: 24,
    width: "100%",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontFamily: "Pretendard-Regular",
    fontWeight: "400",
  },
});
