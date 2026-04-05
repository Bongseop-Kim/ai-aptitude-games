import { useStroopGame } from "@/features/stroop-game";
import { Badge } from "@/shared/ui/badge";
import { Countdown } from "@/shared/ui/countdown";
import { FixedButtonView } from "@/shared/ui/fixed-button-view";
import { GameExitGuard } from "@/shared/ui/game-exit-guard";
import { SegmentedPicker } from "@/shared/ui/segmented-picker";
import { Spacer } from "@/shared/ui/spacer";
import { ThemedModal } from "@/shared/ui/themed-modal";
import { ThemedText } from "@/shared/ui/themed-text";
import { ThemedView } from "@/shared/ui/themed-view";
import { router } from "expo-router";
import { TimerProgressBar } from "@/shared/ui/timer-progressbar";
import { Padding } from "@/shared/config/theme";
import { StyleSheet } from "react-native";

const STROOP_COPY = {
  questionHeader: "단어와 색상이 일치하나요?",
  answerHint: "의미가 아니라 글자 색상만 보고 판단해주세요.",
  matchLabel: "같음",
  mismatchLabel: "다름",
};

export function StroopPlayWidget() {
  const {
    currentQuestion,
    answerMarkerRatio,
    finishedAccuracy,
    gamePhase,
    handleAnswer,
    handleCountdownComplete,
    handleTimeUp,
    isAnswerLocked,
    isTimerRunning,
    remainingQuestions,
    answeredQuestions,
    selectedAnswer,
    showCountdown,
    questionDurationSec,
  } = useStroopGame();

  const isFinished = gamePhase === "finished";
  const accuracyPercent =
    finishedAccuracy === null ? 0 : Math.round(finishedAccuracy * 100);

  if (!currentQuestion) {
    return null;
  }

  const { word, displayedColor } = currentQuestion;
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
        <ThemedText type="title3">Stroop Test</ThemedText>
        <Spacer size="spacing16" />
        <ThemedText type="captionM">{STROOP_COPY.answerHint}</ThemedText>
        <Spacer size="spacing12" />
        <ThemedText type="captionM">
          남은 문항: {remainingQuestions}개
        </ThemedText>
        <Spacer size="spacing28" />
        <ThemedText type="title1" style={[styles.word, { color: displayedColor.value }]}>
          {word.label}
        </ThemedText>
        <Spacer size="spacing16" />
        <ThemedText type="captionM">{STROOP_COPY.questionHeader}</ThemedText>
        <Spacer size="spacing8" />
        <SegmentedPicker
          options={[
            { label: STROOP_COPY.matchLabel, value: "match" },
            { label: STROOP_COPY.mismatchLabel, value: "mismatch" },
          ]}
          value={selectedAnswer}
          onChange={handleAnswer}
          disabled={isAnswerLocked || gamePhase !== "playing"}
        />
      </ThemedView>
      <Countdown
        startCount={3}
        visible={showCountdown}
        onComplete={handleCountdownComplete}
      />
      <ThemedModal
        visible={isFinished}
        title="시험 종료"
        description={`${answeredQuestions}문항을 완료했어요. 정확도 ${accuracyPercent}%`}
        onRequestClose={() => router.replace("/")}
        primaryAction={{
          label: "확인",
          onPress: () => router.replace("/"),
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
  word: {
    fontSize: 52,
    fontWeight: "700",
  },
});
