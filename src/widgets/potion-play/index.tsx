import { usePotionGame } from "@/features/potion-game";
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
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet } from "react-native";

const COIN_OPTIONS = [
  { label: "빨강", value: "red" },
  { label: "파랑", value: "blue" },
  { label: "초록", value: "green" },
] as const;

export function PotionPlayWidget() {
  const {
    answerMarkerRatio,
    currentIndex,
    currentStep,
    currentCounts,
    finishedAccuracy,
    isAnswerLocked,
    isTimerRunning,
    phase,
    renderSample,
    sampleLabel,
    showCountdown,
    stepDurationSec,
    totalSteps,
    handleCountdownComplete,
    handleSelect,
    handleTimeUp,
  } = usePotionGame();

  const [isFinishedModalVisible, setIsFinishedModalVisible] = useState(false);

  useEffect(() => {
    if (phase === "finished") {
      setIsFinishedModalVisible(true);
    }
  }, [phase]);

  const progressText = useMemo(() => {
    if (!currentStep) return "";
    const a = renderSample(currentStep.sampleA);
    const b = renderSample(currentStep.sampleB);
    return `시료 A: ${a}\n시료 B: ${b}`;
  }, [currentStep, renderSample]);
  const closeAndGoHome = () => {
    setIsFinishedModalVisible(false);
    router.replace("/");
  };
  const handleRestart = () => {
    setIsFinishedModalVisible(false);
    router.replace("/pre-game/potion");
  };
  const handleHistory = () => {
    setIsFinishedModalVisible(false);
    router.push("/games/potion/history");
  };

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
        markerContent={<Badge variant="success" type="fill" kind="text" shape="speech" tailPosition="top">응답완료</Badge>}
      />

      <ThemedView style={styles.contentContainer}>
        <Spacer size="spacing16" />
        <ThemedText type="title2">마법약 만들기</ThemedText>
        <Spacer size="spacing8" />
        <ThemedText type="captionM">각 라운드마다 두 시료의 조합으로 가장 가능성 높은 색을 선택하세요.</ThemedText>
        <Spacer size="spacing12" />
        <ThemedText type="captionM">문제 {currentIndex + 1} / {totalSteps}</ThemedText>
        <Spacer size="spacing16" />

        <ThemedView style={styles.sampleCard}>
          <ThemedText>{progressText}</ThemedText>
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
        visible={isFinishedModalVisible}
        title="게임 종료"
        description={`정답률 ${finishedAccuracy}%`}
        onRequestClose={closeAndGoHome}
        primaryAction={{
          label: "다시 시작",
          onPress: handleRestart,
        }}
        secondaryAction={{
          label: "기록 보기",
          onPress: handleHistory,
        }}
      />
    </FixedButtonView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    gap: 10,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  sampleCard: {
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.12)",
    borderRadius: 12,
    padding: 12,
    width: "100%",
    gap: 6,
  },
  picker: {
    width: "100%",
  },
});
