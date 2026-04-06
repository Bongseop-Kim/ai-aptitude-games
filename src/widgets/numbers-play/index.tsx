import { Countdown } from "@/shared/ui/countdown";
import { FixedButtonView } from "@/shared/ui/fixed-button-view";
import { GameExitGuard } from "@/shared/ui/game-exit-guard";
import { Spacer } from "@/shared/ui/spacer";
import { TimerProgressBar } from "@/shared/ui/timer-progressbar";
import { ThemedModal } from "@/shared/ui/themed-modal";
import { ThemedText } from "@/shared/ui/themed-text";
import { ThemedView } from "@/shared/ui/themed-view";
import { useNumbersGame } from "@/features/numbers-game";
import { BorderRadius, BorderWidth, Padding, Spacing, getAliasTokens } from "@/shared/config/theme";
import { useColorScheme } from "@/shared/lib/use-color-scheme";
import { useGameNavigation } from "@/shared/lib/use-game-navigation";
import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import type { RelativePathString } from "expo-router";

const NUMBER_BUTTONS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export function NumbersPlayWidget() {
  const colorScheme = useColorScheme();
  const colors = getAliasTokens(colorScheme ?? "light");
  const { goHome, goPreGame } = useGameNavigation("numbers");

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

  if (!currentStep) {
    return null;
  }

  const hint =
    currentStep.rule === "single"
      ? `${currentStep.value}를 1번 눌러 주세요.`
      : currentStep.rule === "double"
        ? `${currentStep.value}를 2번 눌러 주세요.`
        : "건너뛰기";
  const handleOpenResult = () =>
    router.replace(`/games/numbers/result/${sessionId}` as RelativePathString);

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
        visible={phase === "finished"}
        title="게임 종료"
        description={`정답률 ${finishedAccuracy}%`}
        onRequestClose={goHome}
        primaryAction={{
          label: "결과 보기",
          onPress: handleOpenResult,
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
    padding: Padding.m,
    gap: Spacing.spacing8,
  },
  card: {
    borderWidth: BorderWidth.s,
    borderColor: "transparent",
    borderRadius: BorderRadius.s,
    padding: 14,
    gap: Spacing.spacing6,
  },
  hintText: {
    marginTop: Spacing.spacing4,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: Spacing.spacing8,
  },
  digitButton: {
    width: "30%",
    alignItems: "center",
    justifyContent: "center",
    height: 58,
    borderRadius: BorderRadius.s,
    borderWidth: BorderWidth.s,
    borderColor: "transparent",
  },
  skipButton: {
    borderRadius: BorderRadius.s,
    height: Spacing.spacing52,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: BorderWidth.s,
    borderColor: "transparent",
  },
});
