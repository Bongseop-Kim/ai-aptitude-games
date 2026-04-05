import { ThemedView } from "@/shared/ui/themed-view";
import { router } from "expo-router";
import { StyleSheet } from "react-native";
import HeaderIcon from "./header-icon";

type GameHeaderActionsProps = {
  historyPath?: string;
  historyAccessibilityLabel?: string;
  historyAccessibilityHint?: string;
};

export function GameHeaderActions({
  historyPath,
  historyAccessibilityLabel,
  historyAccessibilityHint,
}: GameHeaderActionsProps) {
  return (
    <ThemedView style={styles.container}>
      {historyPath != null ? (
        <HeaderIcon
          name="clock.arrow.circlepath"
          onPress={() => {
            router.push(historyPath);
          }}
          accessibilityLabel={
            historyAccessibilityLabel ?? "게임 기록 보기"
          }
          accessibilityHint={
            historyAccessibilityHint ?? "게임 기록 화면으로 이동합니다"
          }
        />
      ) : null}
      <HeaderIcon
        name="gearshape"
        onPress={() => {
          router.push("/setting");
        }}
        accessibilityLabel="설정"
        accessibilityHint="설정 화면으로 이동합니다"
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 6,
  },
});
