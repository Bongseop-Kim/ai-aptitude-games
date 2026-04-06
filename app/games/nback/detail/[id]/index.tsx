import { NbackDetailWidget } from "@/widgets/nback-detail";
import { parseSessionIdParam } from "@/shared/lib";
import { useLocalSearchParams } from "expo-router";
import { ThemedView } from "@/shared/ui/themed-view";
import { ThemedText } from "@/shared/ui/themed-text";

export default function NBackDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const sessionId = parseSessionIdParam(id);

  if (sessionId === null) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ThemedText>잘못된 세션 ID입니다.</ThemedText>
      </ThemedView>
    );
  }

  return <NbackDetailWidget sessionId={sessionId} />;
}
