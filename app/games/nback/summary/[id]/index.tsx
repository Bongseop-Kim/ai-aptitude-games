import { NbackSummaryWidget } from "@/widgets/nback-summary";
import { Stack, useLocalSearchParams } from "expo-router";
import React from "react";

export default function NBackResultScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <NbackSummaryWidget sessionId={Number(id)} />
    </>
  );
}
