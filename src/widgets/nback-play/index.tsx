import { useNBackGame } from "@/features/nback-game";
import { NBACK_GAME } from "@/entities/nback";
import { BorderRadius, BorderWidth, Padding, Spacing, WIDTH, getAliasTokens } from "@/shared/config/theme";
import { Badge } from "@/shared/ui/badge";
import { Countdown } from "@/shared/ui/countdown";
import { FixedButtonView } from "@/shared/ui/fixed-button-view";
import { GameExitGuard } from "@/shared/ui/game-exit-guard";
import { SegmentedPicker } from "@/shared/ui/segmented-picker";
import { Spacer } from "@/shared/ui/spacer";
import { ThemedModal } from "@/shared/ui/themed-modal";
import { ThemedText } from "@/shared/ui/themed-text";
import { ThemedView } from "@/shared/ui/themed-view";
import { TimerProgressBar } from "@/shared/ui/timer-progressbar";
import { useColorScheme } from "@/shared/lib/use-color-scheme";
import { useGameNavigation } from "@/shared/lib/use-game-navigation";
import { router } from "expo-router";
import { useMemo } from "react";
import { StyleSheet } from "react-native";

export function NbackPlayWidget() {
  const stimulusSec = NBACK_GAME.rules.stimulusSec;
  const colorScheme = useColorScheme();
  const colors = getAliasTokens(colorScheme ?? "light");

  const {
    currentStage,
    currentShape,
    handleAnswer,
    handleCountdownComplete,
    handleTimeUp,
    headerText,
    isPickerDisabled,
    isTimerRunning,
    answerMarkerRatio,
    finishedAccuracy,
    gamePhase,
    remainingQuestions,
    selectedValue,
    showCountdown,
    finishedSessionId,
  } = useNBackGame();

  const { goHome, goPreGame } = useGameNavigation("nback");
  const stageNumber = useMemo(
    () => NBACK_GAME.stages.findIndex((stage) => stage === currentStage) + 1,
    [currentStage]
  );

  if (!currentStage) {
    return null;
  }

  const { copy } = currentStage;
  const SvgComponent = currentShape?.svg;
  const totalQuestions = currentStage.rules.totalQuestions;
  const answeredQuestions = Math.max(0, totalQuestions - remainingQuestions);
  const stageCount = NBACK_GAME.stages.length;
  const accuracyText =
    finishedAccuracy !== null
      ? `정답률 ${Math.round(finishedAccuracy * 100)}%`
      : "정답률 집계중";
  const handleOpenSummary = () => {
    if (finishedSessionId === null) return;
    router.replace(`/games/nback/summary/${finishedSessionId}`);
  };

  return (
    <FixedButtonView>
      <GameExitGuard />
      <TimerProgressBar
        duration={stimulusSec}
        isRunning={isTimerRunning}
        onComplete={handleTimeUp}
        markerRatio={answerMarkerRatio}
        markerContent={
          <Badge
            variant="success"
            type="fill"
            kind="text"
            shape="speech"
            tailPosition="top"
          >
            응답완료
          </Badge>
        }
      />

      {gamePhase !== "countdown" && (
        <ThemedView style={styles.contentContainer}>
          <Spacer size="spacing48" />
          <ThemedView style={styles.hudRow}>
            <Badge
              variant="default"
              type="ghost"
              kind="text"
              style={styles.remainingBadge}
            >
              {`Stage ${stageNumber}/${stageCount}`}
            </Badge>
            <Badge variant="default" type="ghost" kind="text">
              {`${answeredQuestions}/${totalQuestions} 진행`}
            </Badge>
          </ThemedView>
          <Spacer size="spacing8" />

          <ThemedText type="title1" style={styles.headerText}>
            {headerText}
          </ThemedText>
          <Spacer size="spacing32" />
          <ThemedView
            style={[
              styles.shapeContainer,
              {
                backgroundColor: colors.surface.layer1,
                borderColor: colors.border.base,
              },
            ]}
            accessible
            accessibilityLabel="현재 제시된 도형"
          >
            <SvgComponent
              width={WIDTH / 2}
              height={WIDTH / 2}
              color={colors.brand.tertiary}
            />
          </ThemedView>

          <Spacer size="spacing40" />
          <SegmentedPicker
            options={copy.options.map((opt) => ({
              label: opt.label,
              value: String(opt.value),
            }))}
            value={
              selectedValue !== undefined ? String(selectedValue) : undefined
            }
            onChange={handleAnswer}
            columns={3}
            disabled={isPickerDisabled}
            style={styles.segmentedPicker}
            accessibilityHint="보기를 탭해 정답을 선택하세요"
          />
        </ThemedView>
      )}

      <Countdown
        startCount={3}
        visible={showCountdown}
        onComplete={handleCountdownComplete}
      />

      <ThemedModal
        visible={gamePhase === "finished"}
        title="게임 종료"
        description={`모든 스테이지를 완료했어요. ${accuracyText}`}
        onRequestClose={goHome}
        primaryAction={{
          label: "결과 요약 보기",
          onPress: handleOpenSummary,
          disabled: finishedSessionId === null,
        }}
        secondaryAction={{
          label: "다시 시작",
          onPress: goPreGame,
        }}
      />
    </FixedButtonView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: Padding.m,
  },
  hudRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.spacing8,
  },
  remainingBadge: {
    alignSelf: "flex-start",
  },
  headerText: {
    textAlign: "center",
    height: 80,
    textAlignVertical: "center",
  },
  shapeContainer: {
    borderWidth: BorderWidth.s,
    borderRadius: BorderRadius.m,
    padding: Spacing.spacing12,
  },
  segmentedPicker: {
    width: "100%",
  },
});
