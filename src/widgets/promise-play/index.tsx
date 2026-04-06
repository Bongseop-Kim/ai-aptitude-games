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
import { BorderRadius, Padding, Spacing, getAliasTokens } from "@/shared/config/theme";
import { useColorScheme } from "@/shared/lib/use-color-scheme";
import { useGameNavigation } from "@/shared/lib/use-game-navigation";
import { StyleSheet } from "react-native";
import { useMemo, useState, useEffect } from "react";

const SYMBOL_LABELS: Record<string, string> = {
  none: "없음",
};

export function PromisePlayWidget() {
  const colorScheme = useColorScheme();
  const colors = getAliasTokens(colorScheme ?? "light");
  const { goHome, goPreGame, goHistory } = useGameNavigation("promise");

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
      label: SYMBOL_LABELS[value] ?? value,
      value,
    }));
  }, [currentRound]);

  const [selectedAnswer, setSelectedAnswer] = useState<string | undefined>(undefined);

  useEffect(() => {
    setSelectedAnswer(undefined);
  }, [currentIndex]);

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
          <ThemedText type="captionS" style={{ color: colors.text.inversePrimary }}>
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
            <ThemedView
              key={item.title}
              style={[styles.promptRow, { borderColor: colors.border.alpha }]}
            >
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
          value={selectedAnswer}
          onChange={(value) => {
            if (!isAnswerLocked) {
              setSelectedAnswer(value);
            }
            handleAnswer(value);
          }}
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
    padding: Padding.m,
    gap: Spacing.spacing8,
  },
  promptWrap: {
    gap: Spacing.spacing10,
  },
  promptRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: BorderRadius.s,
    paddingVertical: Spacing.spacing10,
    paddingHorizontal: Spacing.spacing12,
  },
  picker: {
    width: "100%",
  },
});
