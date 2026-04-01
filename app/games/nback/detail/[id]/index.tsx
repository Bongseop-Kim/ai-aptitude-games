import { NbackDetailWidget } from "@/widgets/nback-detail";
import { useLocalSearchParams } from "expo-router";
import React from "react";

export default function NBackDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <NbackDetailWidget sessionId={Number(id)} />;
}
