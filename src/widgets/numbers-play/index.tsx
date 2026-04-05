import { Countdown } from "@/shared/ui/countdown";
import { FixedButtonView } from "@/shared/ui/fixed-button-view";
import { GameExitGuard } from "@/shared/ui/game-exit-guard";
import { Spacer } from "@/shared/ui/spacer";
import { TimerProgressBar } from "@/shared/ui/timer-progressbar";
import { ThemedModal } from "@/shared/ui/themed-modal";
import { ThemedText } from "@/shared/ui/themed-text";
import { ThemedView } from "@/shared/ui/themed-view";
import { useNumbersGame } from "@/features/numbers-game";
import { Pressable, StyleSheet, View } from "react-native";
import { useEffect, useState } from "react";

const NUMBER_BUTTONS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export function NumbersPlayWidget() {
  const {
    phase,
    currentIndex,
    totalSteps,
    currentStep,
    isTimerRunning,
    isAnswerLocked,
    isDoublePressReady,
    answerMarkerRatio,
    showCountdown,
    finishedAccuracy,
    stepDurationSec,
    handleDigit,
    handleSkip,
    handleCountdownComplete,
    handleTimeUp,
  } = useNumbersGame();

  const [isFinishedModalVisible, setIsFinishedModalVisible] = useState(false);

  useEffect(() => {
    if (phase === "finished") {
      setIsFinishedModalVisible(true);
    }
  }, [phase]);

  if (!currentStep) {
    return null;
  }

  const hint =
    currentStep.rule === "single"
      ? `${currentStep.value}를 1번 눌러 주세요.`
      : currentStep.rule === "double"
        ? `${currentStep.value}를 2번 눌러 주세요.`
        : "건너뛰기";

  return (
    <FixedButtonView>
      <GameExitGuard />
      <TimerProgressBar
        duration={stepDurationSec}
        isRunning={isTimerRunning}
        onComplete={handleTimeUp}
        markerRatio={answerMarkerRatio}
        markerContent={
          <ThemedText type="captionS" style={styles.markerText}>
            응답완료
          </ThemedText>
        }
      />

      <ThemedView style={styles.contentContainer}>
        <Spacer size="spacing16" />
        <ThemedText type="title2">숫자 누르기</ThemedText>
        <Spacer size="spacing8" />
        <ThemedText type="captionM">
          문제 {currentIndex + 1} / {totalSteps}
        </ThemedText>
        <Spacer size="spacing24" />
        <ThemedView style={styles.card}>
          <ThemedText type="title1">
            {currentStep.rule === "skip" ? "건너뛰기 라운드" : `활성 숫자: ${currentStep.value}`}
          </ThemedText>
          <ThemedText type="body1" style={styles.hintText}>
            {hint}
          </ThemedText>
          {isDoublePressReady ? (
            <ThemedText type="captionM">2번째 입력을 기다립니다</ThemedText>
          ) : null}
        </ThemedView>

        <Spacer size="spacing24" />
        <View style={styles.grid}>
          {NUMBER_BUTTONS.map((digit) => (
            <Pressable
              key={digit}
              disabled={isAnswerLocked}
              style={({ pressed }) => [
                styles.digitButton,
                {
                  opacity: isAnswerLocked ? 0.6 : pressed ? 0.8 : 1,
                },
              ]}
              onPress={() => handleDigit(String(digit))}
            >
              <ThemedText>{digit}</ThemedText>
            </Pressable>
          ))}
        </View>

        <Spacer size="spacing12" />
        <Pressable
          disabled={isAnswerLocked}
          onPress={handleSkip}
          style={({ pressed }) => [
            styles.skipButton,
            { opacity: isAnswerLocked ? 0.6 : pressed ? 0.8 : 1 },
          ]}
        >
          <ThemedText>건너뛰기</ThemedText>
        </Pressable>
      </ThemedView>

      <Countdown
        startCount={3}
        visible={showCountdown}
        onComplete={handleCountdownComplete}
      />

      <ThemedModal
        visible={isFinishedModalVisible}
        title="게임 종료"
        description={`정답률 ${finishedAccuracy}%`}
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
    padding: 16,
    gap: 8,
  },
  card: {
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.12)",
    borderRadius: 12,
    padding: 14,
    gap: 6,
  },
  hintText: {
    marginTop: 4,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 8,
  },
  digitButton: {
    width: "30%",
    alignItems: "center",
    justifyContent: "center",
    height: 58,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.2)",
  },
  skipButton: {
    borderRadius: 12,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.24)",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  markerText: {
    color: "#ffffff",
  },
});
