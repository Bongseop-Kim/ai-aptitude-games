import { BorderRadius, BorderWidth, Padding, Typography, getSemanticTokens } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useState } from "react";
import {
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from "react-native";
import { ThemedText } from "./themed-text";

export type ThemeInputVariant =
  | "default"
  | "error"
  | "success"
  | "disabled";

export type ThemeInputProps = Omit<TextInputProps, "style"> & {
  variant?: ThemeInputVariant;
  label?: string;
  helperText?: string;
  errorText?: string;
  disabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: TextInputProps["style"];
};

export function ThemeInput({
  variant = "default",
  label,
  disabled,
  containerStyle,
  inputStyle,
  ...rest
}: ThemeInputProps) {
  const colorScheme = useColorScheme();
  const colors = getSemanticTokens(colorScheme ?? "light").field;
  const [isFocused, setIsFocused] = useState(false);

  const isDisabled = disabled || variant === "disabled";
  const isError = variant === "error";
  const isSuccess = variant === "success";

  const getBorderColor = () => {
    if (isDisabled) return colors.borderMuted;
    if (isError) return colors.borderError;
    if (isSuccess) return colors.borderSuccess;
    if (isFocused) return colors.textPrimary;
    return colors.borderDefault;
  };

  const getBackgroundColor = () => {
    if (isDisabled) return colors.bgMuted;
    if (isError) return colors.bgError;
    if (isSuccess) return colors.bgSuccess;
    return colors.bgDefault;
  };

  const getTextColor = () => {
    if (isDisabled) return colors.textDisabled;
    return colors.textDefault;
  };

  const isMultiline = rest.multiline === true;

  return (
    <View style={[styles.container, containerStyle]}>
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
          !isMultiline && styles.inputSingleLine,
          {
            borderColor: getBorderColor(),
            backgroundColor: getBackgroundColor(),
            color: getTextColor(),
          },
          inputStyle,
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
    fontSize: Typography.captionL.fontSize,

    width: "100%",
    borderRadius: BorderRadius.xs,
    borderWidth: BorderWidth.s,
    paddingHorizontal: Padding.m,
    fontFamily: Typography.captionL.fontFamily,
    lineHeight: Typography.captionM.lineHeight,
    fontWeight: Typography.captionL.fontWeight,
  },
  inputSingleLine: {
    height: 40,
  },
});
