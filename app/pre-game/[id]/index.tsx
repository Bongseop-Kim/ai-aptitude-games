import DifficultyStars from "@/components/difficulty-stars";
import { FixedButtonScroll } from "@/components/fixed-button-scroll";
import { ImageCarousel } from "@/components/image-carousel";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { GAMES_MAP } from "@/constants/games";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
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
        // router.push("/games/nback/summary/1");
        break;

      default:
        router.push(`/games/${id}/play` as any);
    }
  };

  const handlePractice = () => {
    router.back();
    // TODO: 게임 연습 로직
    alert(`${game.name} 연습!`);
  };

  return (
    <FixedButtonScroll
      buttonProps={{
        onPress: handleStart,
        children: "시작하기",
      }}
      secondaryButtonProps={{
        onPress: handlePractice,
        children: "연습",
      }}
    >
      <ImageCarousel images={game.images} />

      <ThemedView style={styles.contentContainer}>
        <ThemedText type="title1">{game.name}</ThemedText>

        <ItemContainer
          header="난이도"
          children={<DifficultyStars level={game.difficulty} size={18} />}
        />
        <ItemContainer
          header="측정 역량"
          children={
            <ThemedText type="captionM">
              {game.measuredSkills.join(", ")}
            </ThemedText>
          }
        />

        <ItemContainer
          header="진행 방법"
          children={<ThemedText type="captionM">{game.description}</ThemedText>}
        />

        <ItemContainer
          header="라운드 수"
          children={
            <ThemedText type="captionM">{game.numberOfRounds}</ThemedText>
          }
        />

        <ItemContainer
          header="문제 수"
          children={
            <ThemedText type="captionM">{game.numberOfQuestions}</ThemedText>
          }
        />

        <ItemContainer
          header="응시시간"
          children={
            <ThemedText type="captionM">
              {Math.floor(game.timeLimit / 60)}분
            </ThemedText>
          }
        />
      </ThemedView>
    </FixedButtonScroll>
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
