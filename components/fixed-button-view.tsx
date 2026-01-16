import {
  FixedBottomButton,
  FixedBottomButtonProps,
} from "@/components/fixed-bottom-button";
import { ThemedView } from "@/components/themed-view";
import { StyleSheet, ViewProps } from "react-native";
import { KeyboardStickyView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";

type FixedButtonViewProps = {
  children: React.ReactNode;
  containerProps?: ViewProps;
} & Partial<FixedBottomButtonProps>;

export function FixedButtonView({
  children,
  buttonProps,
  secondaryButtonProps,
  tertiaryButtonProps,
  containerProps,
}: FixedButtonViewProps) {
  const hasButton = !!(
    buttonProps ||
    secondaryButtonProps ||
    tertiaryButtonProps
  );
  const buttonHeight = 48 + 16; // FixedBottomButton 컴포넌트 버튼 높이 + 하단 패딩

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={["bottom"]} style={styles.container}>
        <ThemedView
          {...containerProps}
          style={[
            styles.container,
            hasButton && { paddingBottom: buttonHeight },
            containerProps?.style,
          ]}
        >
          {children}
        </ThemedView>

        {hasButton && buttonProps && (
          <KeyboardStickyView offset={{ closed: 0, opened: 16 }}>
            <FixedBottomButton
              buttonProps={buttonProps}
              secondaryButtonProps={secondaryButtonProps}
              tertiaryButtonProps={tertiaryButtonProps}
            />
          </KeyboardStickyView>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
