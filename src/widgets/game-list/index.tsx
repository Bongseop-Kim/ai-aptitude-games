import { GAMES, type Game } from "@/entities/game";
import { BorderRadius, getAliasTokens, getSemanticTokens, Padding, Spacing } from "@/shared/config/theme";
import { useColorScheme } from "@/shared/lib/use-color-scheme";
import DifficultyStars from "@/shared/ui/difficulty-stars";
import { ThemedText } from "@/shared/ui/themed-text";
import { ThemedView } from "@/shared/ui/themed-view";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { FlatList, Pressable, StyleSheet } from "react-native";

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  if (minutes === 0) {
    return `${remainder}초`;
  }
  return remainder === 0 ? `${minutes}분` : `${minutes}분 ${remainder}초`;
};

export function GameListWidget() {
  const colorScheme = useColorScheme();
  const aliasColors = getAliasTokens(colorScheme ?? "light");

  return (
    <ThemedView style={styles.flex1}>
      <FlatList
        data={GAMES}
        renderItem={({ item }) => <GameCard game={item} />}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <ThemedView style={styles.listHeader}>
            <ThemedText type="headlineS">AI 역량 훈련 게임</ThemedText>
            <ThemedText type="body2" style={{ color: aliasColors.text.secondary }}>
              오늘은 어떤 역량을 강화할지 선택해 보세요.
            </ThemedText>
          </ThemedView>
        }
      />
    </ThemedView>
  );
}

const GameCard = ({ game }: { game: Game }) => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = getSemanticTokens(colorScheme ?? "light");
  const skills = game.measuredSkills.join(", ");

  const handleGamePress = (gameId: string) => {
    router.push(`/pre-game/${gameId}`);
  };

  return (
    <Pressable
      onPress={() => handleGamePress(game.id)}
      style={({ pressed }) => [
        styles.gameCardContent,
        {
          backgroundColor: pressed
            ? colors.field.bgHover
            : colors.field.bgDefault,
          borderColor: pressed
            ? colors.field.borderHover
            : colors.field.borderDefault,
          transform: [{ scale: pressed ? 0.99 : 1 }],
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${game.name}, 난이도 ${game.difficulty}, 측정 역량 ${skills}, 상세 화면으로 이동`}
      accessibilityHint="탭하면 게임 시작 전 화면으로 이동합니다"
    >
      <ThemedView style={styles.gameNameContainer}>
        <Image source={game.image} style={styles.gameImage} />
        <ThemedView style={styles.gameInfo}>
          <ThemedText type="labelL">{game.name}</ThemedText>
          <DifficultyStars level={game.difficulty} size={14} />
          <ThemedText type="captionM">{skills}</ThemedText>
          <ThemedView style={styles.metaRow}>
            <ThemedView
              style={[
                styles.metaPill,
                {
                  backgroundColor: colors.field.bgMuted,
                  borderColor: colors.field.borderDefault,
                },
              ]}
            >
              <ThemedText type="captionS">총 {game.numberOfRounds} 라운드</ThemedText>
            </ThemedView>
            <ThemedView
              style={[
                styles.metaPill,
                {
                  backgroundColor: colors.field.bgMuted,
                  borderColor: colors.field.borderDefault,
                },
              ]}
            >
              <ThemedText type="captionS">{formatDuration(game.timeLimit)}</ThemedText>
            </ThemedView>
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
  listContent: {
    paddingBottom: Spacing.spacing20,
  },
  listHeader: {
    gap: Spacing.spacing8,
    paddingHorizontal: Spacing.spacing12,
    paddingTop: Spacing.spacing12,
    paddingBottom: Spacing.spacing4,
  },
  gameCardContent: {
    padding: Padding.m,
    marginHorizontal: Spacing.spacing12,
    marginVertical: Spacing.spacing8,
    borderRadius: BorderRadius.m,
    borderWidth: 1,
    minHeight: 80,
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
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.spacing6,
    marginTop: Spacing.spacing4,
  },
  metaPill: {
    borderRadius: BorderRadius.s,
    borderWidth: 1,
    paddingHorizontal: Spacing.spacing8,
    paddingVertical: Spacing.spacing4,
  },
});
