import { useGoNoGoGame } from "@/features/gonogo-game";
import { BorderRadius, Padding, getAliasTokens } from "@/shared/config/theme";
import { Badge } from "@/shared/ui/badge";
import { Countdown } from "@/shared/ui/countdown";
import { FixedButtonView } from "@/shared/ui/fixed-button-view";
import { GameExitGuard } from "@/shared/ui/game-exit-guard";
import { Spacer } from "@/shared/ui/spacer";
import { ThemedModal } from "@/shared/ui/themed-modal";
import { ThemedText } from "@/shared/ui/themed-text";
import { ThemedView } from "@/shared/ui/themed-view";
import { TimerProgressBar } from "@/shared/ui/timer-progressbar";
import { useColorScheme } from "@/shared/lib/use-color-scheme";
import { useGameNavigation } from "@/shared/lib/use-game-navigation";
import { Pressable, StyleSheet } from "react-native";

const GO_NO_GO_COPY = {
  title: "Go / No-Go",
  subtitle:
    "🟢가 나오면 즉시 탭, 🔴가 나오면 반응을 멈춰주세요.",
  goLabel: "자극 탭",
  finishTitle: "게임 종료",
  accuracyLabel: "정답률",
  waiting: "준비 중...",
};

export function GoNoGoPlayWidget() {
  const colorScheme = useColorScheme();
  const colors = getAliasTokens(colorScheme ?? "light");
  const { goHome, goPreGame, goHistory } = useGameNavigation("gonogo");

  const {
    accuracyPercent,
    answerMarkerRatio,
    currentIndex,
    currentTrial,
    handleCountdownComplete,
    handleTap,
    handleTimeUp,
    isAnswerLocked,
    isFinished,
    isTapCorrect,
    isTimerRunning,
    showCountdown,
    totalTrials,
    trialTimeSec,
  } = useGoNoGoGame();

  if (!currentTrial) {
    return null;
  }

  const trialNumber = Math.min(totalTrials, currentIndex + 1);
  const isCorrectLabel = isTapCorrect === null ? null : isTapCorrect ? "정답" : "오답";

  return (
    <FixedButtonView>
      <GameExitGuard />
      <TimerProgressBar
        duration={trialTimeSec}
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

      <ThemedView style={styles.contentContainer}>
        <Spacer size="spacing48" />
        <ThemedText type="title3">{GO_NO_GO_COPY.title}</ThemedText>
        <Spacer size="spacing16" />
        <ThemedText type="captionM">{GO_NO_GO_COPY.subtitle}</ThemedText>
        <Spacer size="spacing16" />
        <ThemedText type="captionM">
          문항 {trialNumber} / {totalTrials}
        </ThemedText>
        {isCorrectLabel ? <ThemedText type="captionS">{isCorrectLabel}</ThemedText> : null}
        <Spacer size="spacing20" />

        <ThemedView
          style={[
            styles.stimulusBox,
            { backgroundColor: colors.surface.layer1 },
          ]}
        >
          <ThemedText type="title1">{currentTrial.label}</ThemedText>
        </ThemedView>

        <Spacer size="spacing24" />
        <Pressable
          onPress={handleTap}
          disabled={isAnswerLocked}
          accessibilityRole="button"
          accessibilityLabel={GO_NO_GO_COPY.goLabel}
          accessibilityHint="문항을 확인한 뒤 탭해 즉시 반응을 기록하세요"
          accessibilityState={{ disabled: isAnswerLocked, selected: false }}
          style={({ pressed }) => [
            styles.actionButton,
            {
              backgroundColor: pressed
                ? colors.brand.primaryAlpha30
                : colors.brand.primary,
              opacity: isAnswerLocked ? 0.6 : 1,
            },
          ]}
        >
          <ThemedText type="body1" style={{ color: colors.text.inversePrimary }}>
            {GO_NO_GO_COPY.goLabel}
          </ThemedText>
        </Pressable>
      </ThemedView>

      <Countdown
        startCount={3}
        visible={showCountdown}
        onComplete={handleCountdownComplete}
      />

      <ThemedModal
        visible={isFinished}
        title={GO_NO_GO_COPY.finishTitle}
        description={`${GO_NO_GO_COPY.accuracyLabel}: ${accuracyPercent}%`}
        onRequestClose={goHome}
        primaryAction={{
          label: "다시 시작",
          onPress: goPreGame,
        }}
        secondaryAction={{
          label: "기록 보기",
          onPress: goHistory,
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
  stimulusBox: {
    width: 140,
    height: 140,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: BorderRadius.s,
  },
  actionButton: {
    width: "100%",
    borderRadius: BorderRadius.s,
    paddingVertical: Padding.m,
    alignItems: "center",
  },
});
