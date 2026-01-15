import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, StyleSheet } from "react-native";

import DifficultyStars from "@/components/difficulty-stars";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import GAMES from "@/constants/games";
import { AliasTokens } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function ModalScreen() {
  const { gameId } = useLocalSearchParams<{ gameId: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();

  const game = GAMES.find((g) => g.id === gameId);

  if (!game) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title">게임을 찾을 수 없습니다</ThemedText>
        <Link href="/" dismissTo style={styles.link}>
          <ThemedText type="link">홈으로 돌아가기</ThemedText>
        </Link>
      </ThemedView>
    );
  }

  const handleStart = () => {
    router.back();
    // TODO: 게임 시작 로직
    alert(`${game.name} 시작!`);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        {game.name}
      </ThemedText>

      <DifficultyStars level={game.difficulty} size={18} />

      <ThemedText style={styles.sectionLabel}>측정 역량</ThemedText>
      <ThemedText style={styles.text}>
        {game.measuredSkills.join(", ")}
      </ThemedText>

      <ThemedText style={styles.sectionLabel}>진행 방법</ThemedText>
      <ThemedText style={styles.text}>{game.description}</ThemedText>

      <Pressable
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: AliasTokens[colorScheme ?? "light"].brand.primary,
            opacity: pressed ? 0.8 : 1,
          },
        ]}
        onPress={handleStart}
      >
        <ThemedText style={styles.buttonText}>시작하기</ThemedText>
      </Pressable>

      <Link href="/" dismissTo style={styles.link}>
        <ThemedText style={styles.linkText}>닫기</ThemedText>
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    opacity: 0.6,
    marginTop: 8,
    marginBottom: 4,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  link: {
    paddingVertical: 10,
    alignItems: "center",
  },
  linkText: {
    fontSize: 15,
    opacity: 0.6,
  },
});
