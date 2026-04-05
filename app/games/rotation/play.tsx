import { Stack } from "expo-router";
import { RotationPlayWidget } from "@/widgets/rotation-play";
import { GameHeaderActions } from "@/shared/ui/game-header-actions";

export default function RotationGameScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => <GameHeaderActions historyPath="/games/rotation/history" />,
        }}
      />
      <RotationPlayWidget />
    </>
  );
}
