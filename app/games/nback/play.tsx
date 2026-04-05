import { Stack } from "expo-router";
import { NbackPlayWidget } from "@/widgets/nback-play";
import { GameHeaderActions } from "@/shared/ui/game-header-actions";

export default function NBackGameScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => <GameHeaderActions historyPath="/games/nback/history" />,
        }}
      />
      <NbackPlayWidget />
    </>
  );
}
