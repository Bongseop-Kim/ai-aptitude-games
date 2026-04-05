import { useRpsGame } from "@/features/rps-game";
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
import { StyleSheet } from "react-native";
import { useEffect, useState } from "react";

const RPS_OPTIONS = [
  { label: "주먹(나)", value: "rock" },
  { label: "보(나)", value: "paper" },
  { label: "가위(나)", value: "scissors" },
] as const;

export function RpsPlayWidget() {
  const {
    currentIndex,
    currentRound,
    currentRule,
    totalRounds,
    answerMarkerRatio,
    finishedAccuracy,
    handEmoji,
    handleAnswer,
    handleCountdownComplete,
    handleTimeUp,
    isAnswerLocked,
    isTimerRunning,
    questionDurationSec,
    showCountdown,
  } = useRpsGame();
  const [isFinishedModalVisible, setIsFinishedModalVisible] = useState(false);

  useEffect(() => {
    if (finishedAccuracy !== null && currentIndex + 1 >= totalRounds) {
      setIsFinishedModalVisible(true);
    }
  }, [currentIndex, finishedAccuracy, totalRounds]);

  if (!currentRound) {
    return null;
  }

  const ruleText =
    currentRule === "win" ? "내가 이겨야 합니다" : "내가 져야 합니다";
  const opponent = handEmoji[currentRound.opponentHand] ?? "✊";
  const trialNumber = currentIndex + 1;
  const isLastRound = currentIndex + 1 === totalRounds;
  const phaseText = isLastRound ? "마지막 라운드" : `라운드 ${trialNumber} / ${totalRounds}`;

  return (
    <FixedButtonView>
      <GameExitGuard />
      <TimerProgressBar
        duration={questionDurationSec}
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
        <ThemedText type="title3">가위바위보 (규칙 전환)</ThemedText>
        <Spacer size="spacing12" />
        <ThemedText type="captionM">{phaseText}</ThemedText>
        <Spacer size="spacing24" />
        <ThemedText type="captionM">상대: {opponent}</ThemedText>
        <Spacer size="spacing8" />
        <ThemedText type="body1">{ruleText}</ThemedText>

        <Spacer size="spacing24" />
        <SegmentedPicker
          options={RPS_OPTIONS}
          value={undefined}
          onChange={handleAnswer}
          columns={3}
          disabled={isAnswerLocked}
          style={styles.picker}
        />
        <Spacer size="spacing24" />
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
    paddingHorizontal: 16,
    alignItems: "center",
  },
  picker: {
    width: "100%",
  },
});
