import {
  FixedBottomButton,
  FixedBottomButtonProps,
} from "@/components/fixed-bottom-button";
import { ThemedView } from "@/components/themed-view";
import { StyleSheet } from "react-native";
import {
  KeyboardAwareScrollView,
  KeyboardStickyView,
  type KeyboardAwareScrollViewProps,
} from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";

type FixedButtonScrollProps = {
  children: React.ReactNode;
  scrollViewProps?: Omit<KeyboardAwareScrollViewProps, "children">;
} & FixedBottomButtonProps;

export function FixedButtonScroll({
  children,
  buttonProps,
  secondaryButtonProps,
  tertiaryButtonProps,
  scrollViewProps,
}: FixedButtonScrollProps) {
  const buttonHeight = 48 + 16; // FixedBottomButton 컴포넌트 버튼 높이 + 하단 패딩

  const { contentContainerStyle, ...restScrollViewProps } =
    scrollViewProps || {};

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={["bottom"]} style={styles.container}>
        <KeyboardAwareScrollView
          bottomOffset={104}
          showsVerticalScrollIndicator={false}
          {...restScrollViewProps}
          contentContainerStyle={{
            paddingBottom: buttonHeight,
            ...(contentContainerStyle as object),
          }}
        >
          {children}
        </KeyboardAwareScrollView>

        <KeyboardStickyView offset={{ closed: 0, opened: 16 }}>
          <FixedBottomButton
            buttonProps={buttonProps}
            secondaryButtonProps={secondaryButtonProps}
            tertiaryButtonProps={tertiaryButtonProps}
          />
        </KeyboardStickyView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
