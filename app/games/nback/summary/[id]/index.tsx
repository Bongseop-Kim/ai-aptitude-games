import { FeedbackLayout } from "@/components/feedback-layout";
import { FixedButtonView } from "@/components/fixed-button-view";
import { getStagesBySessionId } from "@/db/services/nback";
import { SessionFeedback } from "@/types/nback/generate";
import { generateSessionFeedback } from "@/utils/nback/generate";
import { Stack, router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";

export default function NBackResultScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [sessionFeedback, setSessionFeedback] = useState<SessionFeedback>();

  useEffect(() => {
    const fetchStages = async () => {
      const stages = await getStagesBySessionId(Number(id));
      setSessionFeedback(generateSessionFeedback(stages));
    };
    fetchStages();
  }, [id]);

  return (
    <FixedButtonView buttonProps={{
      onPress: () => {
        router.back();
      },
      children: '한 번 더',
    }}
      secondaryButtonProps={{
        onPress: () => {
          router.push(`/games/nback/detail/${id}`);
        },
        children: '기록 확인',
      }}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <FeedbackLayout sessionFeedback={sessionFeedback} />

    </FixedButtonView>
  );
}
