import { useRpsGame } from "@/features/rps-game";
import { Padding } from "@/shared/config/theme";
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
import { useGameNavigation } from "@/shared/lib/use-game-navigation";
import { StyleSheet } from "react-native";

const RPS_OPTIONS = [
  { label: "주먹(나)", value: "rock" },
  { label: "보(나)", value: "paper" },
  { label: "가위(나)", value: "scissors" },
] as const;

export function RpsPlayWidget() {
  const { goHome, goPreGame, goHistory } = useGameNavigation("rps");
  const {
    phase,
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
  const isFinished = phase === "finished";

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
          accessibilityHint="현재 라운드 규칙에 맞는 손동작을 탭해 선택하세요"
        />
        <Spacer size="spacing24" />
      </ThemedView>

      <Countdown
        startCount={3}
        visible={showCountdown}
        onComplete={handleCountdownComplete}
      />

      <ThemedModal
        visible={isFinished}
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
    paddingHorizontal: Padding.m,
    alignItems: "center",
  },
  picker: {
    width: "100%",
  },
});
