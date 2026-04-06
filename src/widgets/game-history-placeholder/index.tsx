import { GAMES_MAP } from "@/entities/game";
import { BorderRadius, Padding, Spacing } from "@/shared/config/theme";
import { HStack, VStack } from "@/shared/ui/stack";
import { BlockButton } from "@/shared/ui/block-button";
import { ThemedText } from "@/shared/ui/themed-text";
import { ThemedView } from "@/shared/ui/themed-view";
import { useThemeColor } from "@/shared/lib/use-theme-color";
import { Image } from "expo-image";
import { RelativePathString, router } from "expo-router";
import { StyleSheet, View } from "react-native";

type GameHistoryPlaceholderProps = {
  gameId: string;
};

export function GameHistoryPlaceholder({
  gameId,
}: GameHistoryPlaceholderProps) {
  const game = GAMES_MAP[gameId];
  const cardBgColor = useThemeColor({}, "surface.base");
  const borderColor = useThemeColor({}, "border.base");
  const mutedTextColor = useThemeColor({}, "text.secondary");
  const hasGame = game != null;
  const questionText =
    game?.numberOfQuestions === null
      ? "자유 설정"
      : game
      ? `${game.numberOfQuestions}문항`
      : "-";

  return (
    <ThemedView style={styles.container}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: cardBgColor,
            borderColor,
          },
        ]}
      >
        <View style={styles.headerCard}>
          {game?.image ? (
            <Image
              source={game.image}
              style={styles.heroImage}
              contentFit="cover"
            />
          ) : null}
          <VStack spacing="spacing8" style={styles.headerTextBlock}>
            <ThemedText type="title1">
              {game?.name ?? "이 게임"} 기록
            </ThemedText>
            <ThemedText type="body2" lightColor={mutedTextColor}>
              기록이 아직 없습니다. 아래 기준으로 시작 화면을 확인하고
              첫 기록을 남겨보세요.
            </ThemedText>
          </VStack>
        </View>

        <View style={styles.metricsCard}>
          <SummaryRow
            label="예상 소요 시간"
            value={`${Math.floor((game?.timeLimit ?? 0) / 60)}분 ${game?.timeLimit ? (game.timeLimit % 60 === 0 ? "" : `${game.timeLimit % 60}초`) : ""}`.trim()}
          />
          <SummaryRow label="문항 수" value={questionText} />
          <SummaryRow
            label="측정 역량"
            value={game?.measuredSkills.join(", ") ?? "-"}
          />
          <SummaryRow
            label="라운드"
            value={`${game?.numberOfRounds ?? "-"} 라운드`}
          />
        </View>
      </View>

      <View style={styles.actions}>
        <BlockButton
          onPress={() => router.push(`/pre-game/${gameId}` as RelativePathString)}
          accessibilityRole="button"
          accessibilityLabel={`${game?.name ?? "게임"} 게임 시작`}
          accessibilityHint="현재 게임의 시작 화면으로 이동"
        >
          게임 시작하기
        </BlockButton>
        {hasGame && (
          <BlockButton
            variant="secondary"
            onPress={() => router.push(`/games/${gameId}/history` as RelativePathString)}
            accessibilityRole="button"
            accessibilityLabel={`${game?.name ?? "게임"} 기록 보기`}
            accessibilityHint={`${game?.name ?? "게임"} 기록 화면으로 이동합니다`}
          >
            {game?.name ?? "게임"} 기록 보기
          </BlockButton>
        )}
        <BlockButton
          variant="tertiary"
          onPress={() => router.push("/" as RelativePathString)}
          accessibilityRole="button"
          accessibilityLabel="홈 화면으로 돌아가기"
          accessibilityHint="게임 목록 화면으로 이동합니다"
        >
          홈으로 돌아가기
        </BlockButton>
      </View>
    </ThemedView>
  );
}

const SummaryRow = ({ label, value }: { label: string; value: string }) => {
  return (
    <HStack justify="space-between" style={styles.summaryRow}>
      <ThemedText type="captionM">{label}</ThemedText>
      <ThemedText type="labelM">{value}</ThemedText>
    </HStack>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: Spacing.spacing20,
    gap: Spacing.spacing24,
  },
  card: {
    gap: Spacing.spacing12,
    borderRadius: BorderRadius.s,
    padding: Padding.m,
    borderWidth: 1,
  },
  headerCard: {
    gap: Spacing.spacing12,
  },
  headerTextBlock: {
    gap: Spacing.spacing6,
  },
  heroImage: {
    width: "100%",
    aspectRatio: 3.2,
    borderRadius: 10,
  },
  metricsCard: {
    gap: Spacing.spacing10,
    marginTop: Spacing.spacing4,
  },
  summaryRow: {
    justifyContent: "space-between",
    alignItems: "center",
  },
  actions: {
    gap: Spacing.spacing12,
  },
});
