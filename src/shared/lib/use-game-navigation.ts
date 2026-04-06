import { router } from "expo-router";
import type { RelativePathString } from "expo-router";

export function useGameNavigation(gameKey: string) {
  return {
    goHome: () => router.replace("/"),
    goPreGame: () =>
      router.replace(`/pre-game/${gameKey}` as RelativePathString),
    goHistory: () =>
      router.push(`/games/${gameKey}/history` as RelativePathString),
  };
}
