import { Stack } from "expo-router";
import { PotionPlayWidget } from "@/widgets/potion-play";
import { GameHeaderActions } from "@/shared/ui/game-header-actions";

export default function PotionGameScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => <GameHeaderActions historyPath="/games/potion/history" />,
        }}
      />
      <PotionPlayWidget />
    </>
  );
}
