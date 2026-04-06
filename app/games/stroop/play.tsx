import { Stack } from "expo-router";
import { StroopPlayWidget } from "@/widgets/stroop-play";
import { GameHeaderActions } from "@/shared/ui/game-header-actions";

export default function StroopGameScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => <GameHeaderActions historyPath="/games/stroop/history" />,
        }}
      />
      <StroopPlayWidget />
    </>
  );
}
