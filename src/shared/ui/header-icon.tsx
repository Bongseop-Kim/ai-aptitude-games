import { SemanticTokens } from "../config/theme";
import {
  Pressable,
  StyleSheet,
  type PressableProps,
  useColorScheme,
} from "react-native";
import { IconSymbol, IconSymbolName } from "./icon-symbol";

type HeaderIconProps = {
  name: IconSymbolName;
  onPress: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
};

const defaultAccessibilityLabel: Record<string, string> = {
  "chevron.left": "뒤로 가기",
  "clock.arrow.circlepath": "히스토리",
  gearshape: "설정",
};

export default function HeaderIcon({
  name,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  ...rest
}: HeaderIconProps & Omit<PressableProps, "onPress">) {
  const colorScheme = useColorScheme();

  return (
    <Pressable
      onPress={onPress}
      style={styles.container}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? defaultAccessibilityLabel[name] ?? "버튼"}
      accessibilityHint={accessibilityHint}
      hitSlop={8}
      {...rest}
    >
      <IconSymbol
        size={24}
        name={name}
        color={SemanticTokens[colorScheme ?? "light"].icon.default}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
});
