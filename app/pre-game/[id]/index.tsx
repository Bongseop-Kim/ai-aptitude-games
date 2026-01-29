import DifficultyStars from "@/components/difficulty-stars";
import { FixedButtonScroll } from "@/components/fixed-button-scroll";
import HeaderIcon from "@/components/header-icon";
import { ImageCarousel } from "@/components/image-carousel";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { GAMES_MAP } from "@/constants/games";
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
      // TODO: 다른 게임 라우트 구현 시 case 추가
      // case "rotation":
      //   router.push("/games/rotation/play");
      //   break;
      default:
        console.warn(`[handleStart] 미구현 게임: ${id}`);
        break;
    }
  };

  const handleHistory = () => {
    switch (id) {
      case "nback":
        router.push("/games/nback/history");
        break;
      // TODO: 다른 게임 히스토리 라우트 구현 시 case 추가
      // case "rotation":
      //   router.push("/games/rotation/history");
      //   break;
      default:
        console.warn(`[handleHistory] 미구현 게임: ${id}`);
        break;
    }
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
