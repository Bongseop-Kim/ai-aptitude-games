import { NbackSummaryWidget } from "@/widgets/nback-summary";
import { Stack, useLocalSearchParams, router } from "expo-router";
import React, { useEffect } from "react";
import { ThemedView } from "@/shared/ui/themed-view";
import { ThemedText } from "@/shared/ui/themed-text";

export default function NBackResultScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const sessionId = Number(id);
  const isValidId = id && Number.isInteger(sessionId) && sessionId > 0;

  useEffect(() => {
    if (!isValidId) {
      router.back();
    }
  }, [isValidId]);

  if (!isValidId) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <ThemedView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ThemedText>잘못된 세션 ID입니다.</ThemedText>
        </ThemedView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <NbackSummaryWidget sessionId={sessionId} />
    </>
  );
}