import DifficultyStars from "@/shared/ui/difficulty-stars";
import { FixedButtonScroll } from "@/shared/ui/fixed-button-scroll";
import HeaderIcon from "@/shared/ui/header-icon";
import { ImageCarousel } from "@/shared/ui/image-carousel";
import { ThemedText } from "@/shared/ui/themed-text";
import { ThemedView } from "@/shared/ui/themed-view";
import { GAMES_MAP } from "@/entities/game";
import { Link, Stack, useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet } from "react-native";

export default function PreGameScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const game = id ? GAMES_MAP[id] : undefined;

  if (!game) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: "center", padding: 16 }}>
        <ThemedText type="title1">게임을 찾을 수 없습니다</ThemedText>
        <Link href="/" dismissTo>
          <ThemedText>홈으로 돌아가기</ThemedText>
        </Link>
      </ThemedView>
    );
  }

  const handleStart = () => {
    switch (id) {
      case "nback":
        router.push("/games/nback/play");
        break;
      case "rotation":
        router.push("/games/rotation/play");
        break;
      case "stroop":
        router.push("/games/stroop/play");
        break;
      case "gonogo":
        router.push("/games/gonogo/play");
        break;
      case "rps":
        router.push("/games/rps/play");
        break;
      case "promise":
        router.push("/games/promise/play");
        break;
      case "numbers":
        router.push("/games/numbers/play");
        break;
      case "potion":
        router.push("/games/potion/play");
        break;
      default:
        console.warn(`[handleStart] 미구현 게임: ${id}`);
        break;
    }
  };

  const handleHistory = () => {
    if (!id) {
      console.warn("[handleHistory] 게임 ID 누락");
      return;
    }

    router.push(`/games/${id}/history`);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <ThemedView style={styles.headerRightContainer}>
              <HeaderIcon
                name="clock.arrow.circlepath"
                onPress={handleHistory}
              />
            </ThemedView>
          ),
        }}
      />
      <FixedButtonScroll
        buttonProps={{
          onPress: handleStart,
          children: "시작하기",
        }}
      >
        <ImageCarousel images={game.images} />

        <ThemedView style={styles.contentContainer}>
          <ThemedText type="title1">{game.name}</ThemedText>

          <ItemContainer header="난이도">
            <DifficultyStars level={game.difficulty} size={18} />
          </ItemContainer>
          <ItemContainer header="측정 역량">
            <ThemedText type="captionM">
              {game.measuredSkills.join(", ")}
            </ThemedText>
          </ItemContainer>

          <ItemContainer header="진행 방법">
            <ThemedText type="captionM">{game.description}</ThemedText>
          </ItemContainer>

          <ItemContainer header="라운드 수">
            <ThemedText type="captionM">{game.numberOfRounds}</ThemedText>
          </ItemContainer>

          <ItemContainer header="문제 수">
            <ThemedText type="captionM">{game.numberOfQuestions}</ThemedText>
          </ItemContainer>

          <ItemContainer header="응시시간">
            <ThemedText type="captionM">
              {Math.floor(game.timeLimit / 60)}분
            </ThemedText>
          </ItemContainer>
        </ThemedView>
      </FixedButtonScroll>
    </>
  );
}

const ItemContainer = ({
  header,
  children,
}: {
  header: string;
  children: React.ReactNode;
}) => {
  return (
    <ThemedView style={styles.itemContainer}>
      <ThemedView style={styles.header}>
        <ThemedText type="captionS">{header}</ThemedText>
      </ThemedView>
      <ThemedView style={styles.content}>{children}</ThemedView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  headerRightContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  contentContainer: {
    padding: 16,
    gap: 24,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  header: {
    width: 64,
  },
  content: {
    flex: 1,
  },
});
