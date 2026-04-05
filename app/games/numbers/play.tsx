import { Stack } from "expo-router";
import { NumbersPlayWidget } from "@/widgets/numbers-play";
import { GameHeaderActions } from "@/shared/ui/game-header-actions";

export default function NumbersGameScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => <GameHeaderActions historyPath="/games/numbers/history" />,
        }}
      />
      <NumbersPlayWidget />
    </>
  );
}
