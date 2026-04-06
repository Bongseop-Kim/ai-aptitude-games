import { Stack } from "expo-router";
import { PromisePlayWidget } from "@/widgets/promise-play";
import { GameHeaderActions } from "@/shared/ui/game-header-actions";

export default function PromiseGameScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => <GameHeaderActions historyPath="/games/promise/history" />,
        }}
      />
      <PromisePlayWidget />
    </>
  );
}
