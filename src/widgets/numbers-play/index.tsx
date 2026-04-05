import { Countdown } from "@/shared/ui/countdown";
import { FixedButtonView } from "@/shared/ui/fixed-button-view";
import { GameExitGuard } from "@/shared/ui/game-exit-guard";
import { Spacer } from "@/shared/ui/spacer";
import { TimerProgressBar } from "@/shared/ui/timer-progressbar";
import { ThemedModal } from "@/shared/ui/themed-modal";
import { ThemedText } from "@/shared/ui/themed-text";
import { ThemedView } from "@/shared/ui/themed-view";
import { useNumbersGame } from "@/features/numbers-game";
import { getAliasTokens } from "@/shared/config/theme";
import { useColorScheme } from "@/shared/lib/use-color-scheme";
import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { useEffect, useState } from "react";

const NUMBER_BUTTONS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export function NumbersPlayWidget() {
  const colorScheme = useColorScheme();
  const colors = getAliasTokens(colorScheme ?? "light");

  const {
    phase,
    currentIndex,
    totalSteps,
    currentStep,
    isTimerRunning,
    isAnswerLocked,
    isDoublePressReady,
    sessionId,
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
  const closeAndGoHome = () => {
    setIsFinishedModalVisible(false);
    router.replace("/");
  };
  const handleOpenResult = () => {
    setIsFinishedModalVisible(false);
    router.replace(`/games/numbers/result/${sessionId}`);
  };
  const handleRestart = () => {
    setIsFinishedModalVisible(false);
    router.replace("/pre-game/numbers");
  };
  return (
    <FixedButtonView>
      <GameExitGuard />
      <TimerProgressBar
        duration={stepDurationSec}
        isRunning={isTimerRunning}
        onComplete={handleTimeUp}
        markerRatio={answerMarkerRatio}
        markerContent={
          <ThemedText type="captionS" style={{ color: colors.text.inversePrimary }}>
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
        <ThemedView style={[styles.card, { borderColor: colors.border.alpha }]}>
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
              accessibilityRole="button"
              accessibilityLabel={`${digit} 선택`}
              accessibilityHint={isAnswerLocked ? "정답 입력이 잠겨있습니다" : `${digit} 버튼을 탭해 숫자를 입력하세요`}
              accessibilityState={{ disabled: isAnswerLocked, selected: false }}
              style={({ pressed }) => [
                styles.digitButton,
                  {
                  borderColor: colors.border.layer2,
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
          accessibilityRole="button"
          accessibilityLabel="건너뛰기"
          accessibilityHint={isAnswerLocked ? "정답 입력이 잠겨있습니다" : "현재 라운드를 건너뛰려면 탭하세요"}
          accessibilityState={{ disabled: isAnswerLocked, selected: false }}
          onPress={handleSkip}
          style={({ pressed }) => [
            styles.skipButton,
            {
              borderColor: colors.border.layer1,
              backgroundColor: colors.surface.alpha,
              opacity: isAnswerLocked ? 0.6 : pressed ? 0.8 : 1,
            },
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
        onRequestClose={closeAndGoHome}
        primaryAction={{
          label: "결과 보기",
          onPress: handleOpenResult,
        }}
        secondaryAction={{
          label: "다시 시작",
          onPress: handleRestart,
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
    borderColor: "transparent",
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
    borderColor: "transparent",
  },
  skipButton: {
    borderRadius: 12,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
});
