import { StyleSheet } from "react-native";

import { ThemedText } from "@/shared/ui/themed-text";
import { ThemedView } from "@/shared/ui/themed-view";

type GameHistoryPlaceholderProps = {
  gameName: string;
};

export function GameHistoryPlaceholder({
  gameName,
}: GameHistoryPlaceholderProps) {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title1">{gameName} 히스토리</ThemedText>
      <ThemedText type="body">준비 중인 기능입니다.</ThemedText>
      <ThemedText type="captionM">
        현재 게임 히스토리는 추후 출시 버전에 반영 예정입니다.
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 12,
    justifyContent: "center",
  },
});
