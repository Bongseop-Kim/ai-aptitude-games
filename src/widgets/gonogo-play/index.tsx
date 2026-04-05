import { useGoNoGoGame } from "@/features/gonogo-game";
import { getAliasTokens } from "@/shared/config/theme";
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
import { useEffect, useState } from "react";
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

  const [isFinishedModalVisible, setIsFinishedModalVisible] = useState(false);

  useEffect(() => {
    if (isFinished) {
      setIsFinishedModalVisible(true);
    }
  }, [isFinished]);

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
        visible={isFinishedModalVisible}
        title={GO_NO_GO_COPY.finishTitle}
        description={`${GO_NO_GO_COPY.accuracyLabel}: ${accuracyPercent}%`}
        onRequestClose={() => setIsFinishedModalVisible(false)}
        primaryAction={{
          label: "확인",
          onPress: () => setIsFinishedModalVisible(false),
        }}
      />
    </FixedButtonView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 16,
  },
  stimulusBox: {
    width: 140,
    height: 140,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  actionButton: {
    width: "100%",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
});
