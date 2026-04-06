import { usePotionGame, renderSample, sampleLabel } from "@/features/potion-game";
import { BorderRadius, BorderWidth, Padding, Spacing, getAliasTokens } from "@/shared/config/theme";
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
import { StyleSheet } from "react-native";

const COIN_OPTIONS = [
  { label: "빨강", value: "red" },
  { label: "파랑", value: "blue" },
  { label: "초록", value: "green" },
] as const;

export function PotionPlayWidget() {
  const colorScheme = useColorScheme();
  const colors = getAliasTokens(colorScheme ?? "light");
  const { goHome, goPreGame, goHistory } = useGameNavigation("potion");

  const {
    answerMarkerRatio,
    currentIndex,
    currentStep,
    currentCounts,
    finishedAccuracy,
    isAnswerLocked,
    isTimerRunning,
    phase,
    showCountdown,
    stepDurationSec,
    totalSteps,
    handleCountdownComplete,
    handleSelect,
    handleTimeUp,
  } = usePotionGame();

  if (!currentStep || !currentCounts) {
    return null;
  }

  return (
    <FixedButtonView>
      <GameExitGuard />

      <TimerProgressBar
        duration={stepDurationSec}
        isRunning={isTimerRunning}
        onComplete={handleTimeUp}
        markerRatio={answerMarkerRatio}
        markerContent={
          <Badge variant="success" type="fill" kind="text" shape="speech" tailPosition="top">
            응답완료
          </Badge>
        }
      />

      <ThemedView style={styles.contentContainer}>
        <Spacer size="spacing16" />
        <ThemedText type="title2">마법약 만들기</ThemedText>
        <Spacer size="spacing8" />
        <ThemedText type="captionM">각 라운드마다 두 시료의 조합으로 가장 가능성 높은 색을 선택하세요.</ThemedText>
        <Spacer size="spacing12" />
        <ThemedText type="captionM">문제 {currentIndex + 1} / {totalSteps}</ThemedText>
        <Spacer size="spacing16" />

        <ThemedView style={[styles.sampleCard, { borderColor: colors.border.alpha }]}>
          <ThemedText>{`시료 A: ${renderSample(currentStep.sampleA)}\n시료 B: ${renderSample(currentStep.sampleB)}`}</ThemedText>
          <Spacer size="spacing8" />
          <ThemedText type="captionM">
            현재 빈도: 빨강 {currentCounts.red}, 파랑 {currentCounts.blue}, 초록 {currentCounts.green}
          </ThemedText>
        </ThemedView>

        <Spacer size="spacing16" />
        <SegmentedPicker
          options={COIN_OPTIONS}
          value={undefined}
          onChange={handleSelect}
          columns={3}
          disabled={isAnswerLocked}
          style={styles.picker}
          accessibilityHint="현재 단계의 시료 조합을 기준으로 색상을 선택하세요"
        />
        <Spacer size="spacing8" />
        <ThemedText type="captionS">정답 정답표기: {sampleLabel(currentStep.correctColor)}</ThemedText>
      </ThemedView>

      <Countdown startCount={3} visible={showCountdown} onComplete={handleCountdownComplete} />

      <ThemedModal
        visible={phase === "finished"}
        title="게임 종료"
        description={`정답률 ${finishedAccuracy}%`}
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
    gap: Spacing.spacing10,
    paddingHorizontal: Padding.m,
    alignItems: "center",
  },
  sampleCard: {
    borderWidth: BorderWidth.s,
    borderRadius: BorderRadius.s,
    padding: Spacing.spacing12,
    width: "100%",
    gap: Spacing.spacing6,
  },
  picker: {
    width: "100%",
  },
});
