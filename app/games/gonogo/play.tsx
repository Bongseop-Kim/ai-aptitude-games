import { Stack } from "expo-router";
import { GoNoGoPlayWidget } from "@/widgets/gonogo-play";
import { GameHeaderActions } from "@/shared/ui/game-header-actions";

export default function GoNoGoGameScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => <GameHeaderActions historyPath="/games/gonogo/history" />,
        }}
      />
      <GoNoGoPlayWidget />
    </>
  );
}
