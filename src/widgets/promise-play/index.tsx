import { Countdown } from "@/shared/ui/countdown";
import { FixedButtonView } from "@/shared/ui/fixed-button-view";
import { GameExitGuard } from "@/shared/ui/game-exit-guard";
import { SegmentedPicker } from "@/shared/ui/segmented-picker";
import { Spacer } from "@/shared/ui/spacer";
import { ThemedModal } from "@/shared/ui/themed-modal";
import { ThemedText } from "@/shared/ui/themed-text";
import { ThemedView } from "@/shared/ui/themed-view";
import { TimerProgressBar } from "@/shared/ui/timer-progressbar";
import { usePromiseGame } from "@/features/promise-game";
import { router } from "expo-router";
import { StyleSheet } from "react-native";
import { useEffect, useMemo, useState } from "react";

const SYMBOL_LABELS: Record<string, string> = {
  A: "A",
  B: "B",
  C: "C",
  D: "D",
  E: "E",
  F: "F",
  none: "없음",
};

const SYMBOL_OPTIONS = [
  { label: SYMBOL_LABELS.A, value: "A" },
  { label: SYMBOL_LABELS.B, value: "B" },
  { label: SYMBOL_LABELS.C, value: "C" },
  { label: SYMBOL_LABELS.D, value: "D" },
  { label: SYMBOL_LABELS.E, value: "E" },
  { label: SYMBOL_LABELS.F, value: "F" },
  { label: SYMBOL_LABELS.none, value: "none" },
] as const;

export function PromisePlayWidget() {
  const {
    currentRound,
    currentIndex,
    totalRounds,
    isAnswerLocked,
    isTimerRunning,
    questionDurationSec,
    answerMarkerRatio,
    showCountdown,
    finishedAccuracy,
    handleAnswer,
    handleCountdownComplete,
    handleTimeUp,
    phase,
  } = usePromiseGame();

  const [isFinishedModalVisible, setIsFinishedModalVisible] = useState(false);

  const promptTexts = useMemo(() => {
    if (!currentRound) return [];
    return currentRound.promptCards.map((card, index) => ({
      title: `${index + 1}번째 제시`,
      values: card.join(", "),
    }));
  }, [currentRound]);

  const optionItems = useMemo(() => {
    if (!currentRound) return [];
    return currentRound.options.map((value) => ({
      label: SYMBOL_LABELS[value],
      value,
    }));
  }, [currentRound]);
  const closeAndGoHome = () => {
    setIsFinishedModalVisible(false);
    router.replace("/");
  };
  const handleRestart = () => {
    setIsFinishedModalVisible(false);
    router.replace("/pre-game/promise");
  };
  const handleHistory = () => {
    setIsFinishedModalVisible(false);
    router.push("/games/promise/history");
  };

  useEffect(() => {
    if (phase === "finished") {
      setIsFinishedModalVisible(true);
    }
  }, [phase]);

  if (!currentRound) {
    return null;
  }

  return (
    <FixedButtonView>
      <GameExitGuard />
      <TimerProgressBar
        duration={questionDurationSec}
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
        <ThemedText type="title2">약속 정하기</ThemedText>
        <Spacer size="spacing12" />
        <ThemedText type="captionM">
          3회로 제시된 항목에서 공통 항목이 있는지, 없다면 없음 선택
        </ThemedText>
        <Spacer size="spacing8" />
        <ThemedText type="captionM">
          문제 {currentIndex + 1} / {totalRounds}
        </ThemedText>

        <Spacer size="spacing16" />
        <ThemedView style={styles.promptWrap}>
          {promptTexts.map((item) => (
            <ThemedView key={item.title} style={styles.promptRow}>
              <ThemedText type="body1">{item.title}</ThemedText>
              <ThemedText type="body2">{item.values}</ThemedText>
            </ThemedView>
          ))}
        </ThemedView>

        <Spacer size="spacing24" />
        <ThemedText type="captionM">공통 항목(또는 없음)을 선택하세요</ThemedText>
        <Spacer size="spacing8" />
        <SegmentedPicker
          options={optionItems}
          value={undefined}
          onChange={handleAnswer}
          columns={3}
          disabled={isAnswerLocked}
          style={styles.picker}
          accessibilityHint="현재 카드에 공통으로 나타난 항목을 선택하세요"
        />
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
    padding: 16,
    gap: 8,
  },
  promptWrap: {
    gap: 10,
  },
  promptRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  picker: {
    width: "100%",
  },
  markerText: {
    color: "#ffffff",
  },
});
