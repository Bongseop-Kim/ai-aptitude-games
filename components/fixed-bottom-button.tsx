import { BlockButton, BlockButtonProps } from "@/components/block-button";
import { ThemedView } from "@/components/themed-view";
import { getSemanticTokens } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { StyleSheet } from "react-native";

export type FixedBottomButtonProps = {
  buttonProps: BlockButtonProps;
  secondaryButtonProps?: BlockButtonProps;
  tertiaryButtonProps?: BlockButtonProps;
};

export function FixedBottomButton({
  buttonProps,
  secondaryButtonProps,
  tertiaryButtonProps,
}: FixedBottomButtonProps) {
  const colorScheme = useColorScheme();
  const colors = getSemanticTokens(colorScheme ?? "light");

  const hasMultipleButtons = secondaryButtonProps || tertiaryButtonProps;

  return (
    <ThemedView
      style={[
        styles.button,
        {
          borderTopColor: colors.field.borderDefault,
        },
      ]}
    >
      <ThemedView style={styles.buttonContainer}>
        {tertiaryButtonProps && (
          <ThemedView
            style={hasMultipleButtons ? styles.sideButton : styles.fullButton}
          >
            <BlockButton variant="tertiary" {...tertiaryButtonProps}>
              {tertiaryButtonProps.children}
            </BlockButton>
          </ThemedView>
        )}
        {secondaryButtonProps && (
          <ThemedView
            style={hasMultipleButtons ? styles.sideButton : styles.fullButton}
          >
            <BlockButton variant="secondary" {...secondaryButtonProps}>
              {secondaryButtonProps.children}
            </BlockButton>
          </ThemedView>
        )}
        <ThemedView
          style={hasMultipleButtons ? styles.mainButton : styles.fullButton}
        >
          <BlockButton {...buttonProps}>{buttonProps.children}</BlockButton>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  fullButton: {
    flex: 1,
  },
  sideButton: {
    flex: 1,
  },
  mainButton: {
    flex: 2.5,
  },
});
