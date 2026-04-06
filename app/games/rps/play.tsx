import { Stack } from "expo-router";
import { RpsPlayWidget } from "@/widgets/rps-play";
import { GameHeaderActions } from "@/shared/ui/game-header-actions";

export default function RpsGameScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => <GameHeaderActions historyPath="/games/rps/history" />,
        }}
      />
      <RpsPlayWidget />
    </>
  );
}
