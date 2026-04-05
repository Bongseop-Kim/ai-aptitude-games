import { SessionResultSummaryWidget } from "@/widgets/session-result-summary";
import { Stack, useLocalSearchParams } from "expo-router";
import { ThemedView } from "@/shared/ui/themed-view";
import { ThemedText } from "@/shared/ui/themed-text";

export default function NumbersResultScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const sessionId = typeof id === "string" && id.trim().length > 0 ? id : null;

  if (sessionId == null) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <ThemedView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ThemedText>올바르지 않은 세션입니다.</ThemedText>
        </ThemedView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SessionResultSummaryWidget gameKey="numbers" sessionId={sessionId} />
    </>
  );
}
