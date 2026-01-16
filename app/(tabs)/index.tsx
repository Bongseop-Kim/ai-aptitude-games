import DifficultyStars from "@/components/difficulty-stars";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import GAMES from "@/constants/games";
import Game from "@/types/game";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { FlatList, Pressable, StyleSheet } from "react-native";

export default function HomeScreen() {
  return (
    <ThemedView>
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
    <Pressable key={game.id} onPress={() => handleGamePress(game.id)}>
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
  gameCardContent: {
    padding: 16,
  },
  gameImage: {
    width: 114,
    height: 114,
    borderRadius: 12,
  },
  gameNameContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    flex: 1,
  },
  gameInfo: {
    flex: 1,
    gap: 4,
  },
});
