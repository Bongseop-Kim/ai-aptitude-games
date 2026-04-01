import { useNbackResults } from "@/features/nback-results";
import { FeedbackLayout } from "@/shared/ui/feedback-layout";
import { FixedButtonView } from "@/shared/ui/fixed-button-view";
import { router } from "expo-router";
import React from "react";

export function NbackSummaryWidget({ sessionId }: { sessionId: number }) {
  const { sessionFeedback } = useNbackResults(sessionId);

  return (
    <FixedButtonView
      buttonProps={{
        onPress: () => router.back(),
        children: "한 번 더",
      }}
      secondaryButtonProps={{
        onPress: () => router.push(`/games/nback/detail/${sessionId}`),
        children: "기록 확인",
      }}
    >
      <FeedbackLayout sessionFeedback={sessionFeedback} />
    </FixedButtonView>
  );
}
