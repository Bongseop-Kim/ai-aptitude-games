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
        onPress: () => router.replace("/pre-game/nback"),
        accessibilityRole: "button",
        accessibilityLabel: "N-back 다시 시작",
        accessibilityHint: "게임 시작 전 화면으로 이동해 다시 플레이합니다",
        children: "다시 시작",
      }}
      secondaryButtonProps={{
        onPress: () => router.push(`/games/nback/detail/${sessionId}`),
        accessibilityRole: "button",
        accessibilityLabel: "세션 기록 상세 보기",
        accessibilityHint: "문항별 기록 상세 화면으로 이동합니다",
        children: "기록 상세 보기",
      }}
    >
      <FeedbackLayout sessionFeedback={sessionFeedback} />
    </FixedButtonView>
  );
}
