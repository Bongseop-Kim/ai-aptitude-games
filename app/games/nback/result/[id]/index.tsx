import { ThemedView } from "@/components/themed-view";
import { useLocalSearchParams } from "expo-router";
import React from "react";

export default function NBackResultScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ThemedView>NbackResultScreen</ThemedView>;
}
