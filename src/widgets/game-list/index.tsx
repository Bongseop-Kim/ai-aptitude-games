import { GAMES, type Game } from "@/entities/game";
import { BorderRadius, Padding, Spacing } from "@/shared/config/theme";
import DifficultyStars from "@/shared/ui/difficulty-stars";
import { ThemedText } from "@/shared/ui/themed-text";
import { ThemedView } from "@/shared/ui/themed-view";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { FlatList, Pressable, StyleSheet } from "react-native";

export function GameListWidget() {
  return (
    <ThemedView style={styles.flex1}>
      <FlatList
        data={GAMES}
        renderItem={({ item }) => <GameCard game={item} />}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
}

const GameCard = ({ game }: { game: Game }) => {
  const router = useRouter();

  const handleGamePress = (gameId: string) => {
    router.push(`/pre-game/${gameId}`);
  };

  return (
    <Pressable onPress={() => handleGamePress(game.id)}>
      <ThemedView style={styles.gameCardContent}>
        <ThemedView style={styles.gameNameContainer}>
          <Image source={game.image} style={styles.gameImage} />
          <ThemedView style={styles.gameInfo}>
            <ThemedText type="labelL">{game.name}</ThemedText>
            <DifficultyStars level={game.difficulty} size={14} />
            <ThemedText type="captionM">
              {game.measuredSkills.join(", ")}
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  gameCardContent: {
    padding: Padding.m,
  },
  gameImage: {
    width: 114,
    height: 114,
    borderRadius: BorderRadius.s,
  },
  gameNameContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.spacing12,
    flex: 1,
  },
  gameInfo: {
    flex: 1,
    gap: Spacing.spacing4,
  },
});