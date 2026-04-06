import DifficultyStars from "@/shared/ui/difficulty-stars";
import { FixedButtonScroll } from "@/shared/ui/fixed-button-scroll";
import { ImageCarousel } from "@/shared/ui/image-carousel";
import { ThemedModal } from "@/shared/ui/themed-modal";
import { BlockButton } from "@/shared/ui/block-button";
import {
  BorderRadius,
  Padding,
  Spacing,
  getAliasTokens,
  getSemanticTokens,
} from "@/shared/config/theme";
import {
  getPracticeModalSettings,
} from "@/shared/config/feature-flags";
import {
  getPracticeModalCopy,
  PRACTICE_MODAL_I18N_KEYS,
} from "@/shared/config/practice-modal-copy";
import { useColorScheme } from "@/shared/lib/use-color-scheme";
import { ThemedText } from "@/shared/ui/themed-text";
import { ThemedView } from "@/shared/ui/themed-view";
import { GAMES_MAP } from "@/entities/game";
import { IconSymbol } from "@/shared/ui/icon-symbol";
import { Link, Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { GameHeaderActions } from "@/shared/ui/game-header-actions";

export default function PreGameScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const aliasColors = useMemo(() => getAliasTokens(colorScheme ?? "light"), [colorScheme]);
  const semanticColors = useMemo(
    () => getSemanticTokens(colorScheme ?? "light"),
    [colorScheme]
  );
  const modalLocale = useMemo(() => {
    if (typeof Intl === "undefined") {
      return "ko";
    }
    const locale = Intl.DateTimeFormat().resolvedOptions().locale.toLowerCase();
    return locale.startsWith("en") ? "en" : "ko";
  }, []);

  const practiceModalSettings = useMemo(
    () =>
      getPracticeModalSettings(new Date(), process.env.EXPO_PUBLIC_PRACTICE_MODAL_CONFIG),
    []
  );
  const practiceModalEnabled = practiceModalSettings.enabled;
  const [showPracticeModal, setShowPracticeModal] = useState(
    practiceModalEnabled && practiceModalSettings.variant !== "v3"
  );
  const [showPracticeBanner, setShowPracticeBanner] = useState(
    practiceModalEnabled && practiceModalSettings.variant === "v3"
  );
  const [showDetails, setShowDetails] = useState(false);

  const game = id ? GAMES_MAP[id] : undefined;

  const durationLabel = useMemo(() => {
    if (!game) {
      return "";
    }
    const minutes = Math.floor(game.timeLimit / 60);
    const seconds = game.timeLimit % 60;
    if (minutes === 0) {
      return `${seconds}초`;
    }
    return seconds === 0 ? `${minutes}분` : `${minutes}분 ${seconds}초`;
  }, [game]);

  if (!game) {
    return (
      <ThemedView style={styles.notFoundContainer}>
        <ThemedText type="title1">게임을 찾을 수 없습니다</ThemedText>
        <Link
          href="/"
          dismissTo
          accessibilityRole="button"
          accessibilityLabel="홈으로 돌아가기"
          accessibilityHint="홈 화면으로 이동합니다"
        >
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
        Alert.alert("준비 중", "선택한 게임은 아직 구현되지 않았습니다.");
        break;
    }
  };

  return (
    <>
      {practiceModalSettings.variant !== "v3" ? (
        <ThemedModal
          visible={showPracticeModal}
          title={getPracticeModalCopy(
            practiceModalSettings.variant === "v2"
              ? PRACTICE_MODAL_I18N_KEYS.shortTitle
              : PRACTICE_MODAL_I18N_KEYS.title,
            modalLocale
          )}
          description={getPracticeModalCopy(
            practiceModalSettings.variant === "v2"
              ? PRACTICE_MODAL_I18N_KEYS.shortBody
              : PRACTICE_MODAL_I18N_KEYS.body,
            modalLocale
          )}
          onRequestClose={() => setShowPracticeModal(false)}
          secondaryAction={
            practiceModalSettings.variant === "v2"
              ? undefined
              : {
                  label: getPracticeModalCopy(
                    PRACTICE_MODAL_I18N_KEYS.ctaSecondary,
                    modalLocale
                  ),
                  onPress: () => setShowPracticeModal(false),
                  variant: "secondary",
                }
          }
          primaryAction={{
            label: getPracticeModalCopy(
              PRACTICE_MODAL_I18N_KEYS.ctaPrimary,
              modalLocale
            ),
            onPress: () => setShowPracticeModal(false),
            variant: "primary",
          }}
          modalProps={{ animationType: "none" }}
        >
          {practiceModalSettings.variant === "v1" ? (
            <>
              <ThemedText type="body2">
                {getPracticeModalCopy(PRACTICE_MODAL_I18N_KEYS.bullet1, modalLocale)}
              </ThemedText>
              <ThemedText type="body2">
                {getPracticeModalCopy(PRACTICE_MODAL_I18N_KEYS.bullet2, modalLocale)}
              </ThemedText>
              <ThemedText type="body2">
                {getPracticeModalCopy(PRACTICE_MODAL_I18N_KEYS.bullet3, modalLocale)}
              </ThemedText>
              <ThemedText type="captionM">
                {getPracticeModalCopy(PRACTICE_MODAL_I18N_KEYS.footer, modalLocale)}
              </ThemedText>
            </>
          ) : (
            <ThemedText type="body2">
              {getPracticeModalCopy(PRACTICE_MODAL_I18N_KEYS.shortBody, modalLocale)}
            </ThemedText>
          )}
        </ThemedModal>
      ) : showPracticeBanner ? (
        <View
          style={[
            styles.bannerContainer,
            { backgroundColor: semanticColors.feedback.warningBg },
          ]}
          accessibilityRole="alert"
        >
          <ThemedText type="body2" style={{ color: aliasColors.text.inversePrimary }}>
            {getPracticeModalCopy(PRACTICE_MODAL_I18N_KEYS.bannerText, modalLocale)}
          </ThemedText>
          <BlockButton
            variant="tertiary"
            onPress={() => setShowPracticeBanner(false)}
            accessibilityRole="button"
          >
            {getPracticeModalCopy(PRACTICE_MODAL_I18N_KEYS.bannerCta, modalLocale)}
          </BlockButton>
        </View>
      ) : null}
      <Stack.Screen
        options={{
          headerRight: () => (
            <GameHeaderActions
              historyPath={id ? `/games/${id}/history` : undefined}
              historyAccessibilityLabel={`${game.name} 기록 보기`}
              historyAccessibilityHint="게임 기록 화면으로 이동합니다"
            />
          ),
        }}
      />
      <FixedButtonScroll
        buttonProps={{
          onPress: handleStart,
          accessibilityRole: "button",
          accessibilityLabel: `${game.name} 시작하기`,
          accessibilityHint: `${game.name} 게임 플레이 화면으로 이동합니다`,
          children: "시작하기",
        }}
      >
        <ImageCarousel images={game.images} />

        <ThemedView style={styles.contentContainer}>
          <ThemedText type="title1">{game.name}</ThemedText>

          <ItemContainer header="핵심 규칙">
            <ThemedText type="body1" lightColor={aliasColors.text.secondary}>
              {game.description}
            </ThemedText>
          </ItemContainer>

          <ItemContainer header="핵심 지표">
            <ThemedView style={styles.metaCards}>
              <ThemedView
                style={[
                  styles.metaItem,
                  {
                    backgroundColor: semanticColors.field.bgMuted,
                    borderColor: semanticColors.field.borderDefault,
                  },
                ]}
              >
                <ThemedText type="captionS">예상 소요 시간</ThemedText>
                <ThemedText type="labelL">{durationLabel}</ThemedText>
              </ThemedView>
              <ThemedView
                style={[
                  styles.metaItem,
                  {
                    backgroundColor: semanticColors.field.bgMuted,
                    borderColor: semanticColors.field.borderDefault,
                  },
                ]}
              >
                <ThemedText type="captionS">라운드 수</ThemedText>
                <ThemedText type="labelL">{game.numberOfRounds}</ThemedText>
              </ThemedView>
              <ThemedView
                style={[
                  styles.metaItem,
                  {
                    backgroundColor: semanticColors.field.bgMuted,
                    borderColor: semanticColors.field.borderDefault,
                  },
                ]}
              >
                <ThemedText type="captionS">문항 수</ThemedText>
                <ThemedText type="labelL">
                  {game.numberOfQuestions ?? "준비중"}
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </ItemContainer>

          <ItemContainer header="측정 역량">
            <ThemedText type="body2" style={{ color: aliasColors.text.secondary }}>
              {game.measuredSkills.join(" · ")}
            </ThemedText>
          </ItemContainer>

          <Pressable
            onPress={() => setShowDetails((prev) => !prev)}
            style={({ pressed }) => [
              styles.toggleContainer,
              {
                backgroundColor: pressed
                  ? semanticColors.field.bgHover
                  : semanticColors.field.bgDefault,
                borderColor: pressed
                  ? semanticColors.field.borderHover
                  : semanticColors.field.borderDefault,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={
              showDetails ? "게임 안내 접기" : "게임 안내 펼치기"
            }
            accessibilityHint={
              showDetails
                ? "탭하면 상세 내용을 접고 기본 정보를 다시 봅니다"
                : "탭하면 게임 진행 방식과 측정 역량을 확인할 수 있습니다"
            }
            accessibilityState={{ expanded: showDetails }}
          >
            <ThemedText type="labelL">
              {showDetails ? "게임 안내 접기" : "게임 안내 펼치기"}
            </ThemedText>
            <IconSymbol
              name="chevron.down"
              size={18}
              color={aliasColors.text.secondary}
              style={{ transform: [{ rotate: showDetails ? "0deg" : "-90deg" }] }}
            />
          </Pressable>

          {showDetails && (
            <View style={styles.detailsContent}>
              <ItemContainer header="난이도">
                <DifficultyStars level={game.difficulty} size={18} />
              </ItemContainer>
            </View>
          )}
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
  contentContainer: {
    padding: 16,
    gap: 24,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
    gap: 16,
  },
  metaCards: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.spacing8,
    flexWrap: "wrap",
  },
  metaItem: {
    width: "31%",
    minWidth: 96,
    alignItems: "center",
    padding: 12,
    borderRadius: BorderRadius.s,
    borderWidth: 1,
  },
  toggleContainer: {
    minHeight: 44,
    borderRadius: BorderRadius.s,
    paddingVertical: Spacing.spacing12,
    paddingHorizontal: Padding.m,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    marginVertical: Spacing.spacing8,
  },
  detailsContent: {
    gap: 20,
    paddingBottom: 8,
  },
  header: {
    width: 64,
  },
  content: {
    flex: 1,
  },
  bannerContainer: {
    margin: Padding.m,
    borderRadius: BorderRadius.s,
    padding: Padding.m,
    gap: Spacing.spacing8,
  },
});
