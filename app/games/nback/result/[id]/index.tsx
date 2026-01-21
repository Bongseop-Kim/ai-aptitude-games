import { FixedButtonView } from "@/components/fixed-button-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useLocalSearchParams } from "expo-router";
import React from "react";

export default function NBackResultScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <FixedButtonView>
      <ThemedView>
        <ThemedText>NbackResultScreen</ThemedText>
      </ThemedView>
    </FixedButtonView>
  );
}
