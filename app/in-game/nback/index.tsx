import { NBACK_GAME } from "@/app/in-game/nback/constants";
import { Badge } from "@/components/badge";
import { Countdown } from "@/components/countdown";
import { FixedButtonView } from "@/components/fixed-button-view";
import { SegmentedPicker } from "@/components/segmented-picker";
import { ThemedModal } from "@/components/themed-modal";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { TimerProgressBar } from "@/components/timer-progressbar";
import { Spacer } from "@/components/ui/spacer";
import { Padding, WIDTH, getAliasTokens } from "@/constants/theme";
import { useEffect, useState } from "react";
import { StyleSheet, useColorScheme } from "react-native";
import { useNBackGame } from "./useHook";

export default function NBackGameScreen() {
  const stimulusSec = NBACK_GAME.rules.stimulusSec;
  const colorScheme = useColorScheme();
  const colors = getAliasTokens(colorScheme ?? "light");

  const {
    currentStage,
    currentShape,
    handleAnswer,
    handleCountdownComplete,
    handleTimeUp,
    headerText,
    isPickerDisabled,
    isTimerRunning,
    answerMarkerRatio,
    finishedAccuracy,
    gamePhase,
    remainingQuestions,
    selectedValue,
    showCountdown,
  } = useNBackGame();

  const [isFinishedModalVisible, setIsFinishedModalVisible] = useState(false);

  useEffect(() => {
    if (gamePhase === "finished") {
      setIsFinishedModalVisible(true);
    }
  }, [gamePhase]);

  // 현재 스테이지가 없으면 null 반환
  if (!currentStage) {
    return null;
  }

  const { copy } = currentStage;
  const SvgComponent = currentShape?.svg;
  const accuracyText =
    finishedAccuracy !== null
      ? `정답률 ${Math.round(finishedAccuracy * 100)}%`
      : "정답률 집계중";

  return (
    <FixedButtonView>
      <TimerProgressBar
        duration={stimulusSec}
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
        <Badge
          variant="default"
          type="ghost"
          kind="text"
          style={styles.remainingBadge}
        >
          남은 문항 {remainingQuestions}
        </Badge>
        <Spacer size="spacing8" />

        <ThemedText type="title1" style={styles.headerText}>
          {headerText}
        </ThemedText>
        <Spacer size="spacing32" />
        <SvgComponent
          width={WIDTH / 2}
          height={WIDTH / 2}
          color={colors.brand.tertiary}
        />

        <Spacer size="spacing40" />
        <SegmentedPicker
          options={copy.options.map((opt) => ({
            label: opt.label,
            value: String(opt.value),
          }))}
          value={
            selectedValue !== undefined ? String(selectedValue) : undefined
          }
          onChange={handleAnswer}
          columns={3}
          disabled={isPickerDisabled}
          style={styles.segmentedPicker}
        />
      </ThemedView>

      <Countdown
        startCount={3}
        visible={showCountdown}
        onComplete={handleCountdownComplete}
      />

      <ThemedModal
        visible={isFinishedModalVisible}
        title="시험 종료"
        description={`모든 스테이지를 완료했어요. ${accuracyText}`}
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
    alignItems: "center",

    paddingHorizontal: Padding.m,
  },
  remainingBadge: {
    alignSelf: "flex-end",
  },
  headerText: {
    textAlign: "center",
    height: 80,
    textAlignVertical: "center",
  },
  segmentedPicker: {
    width: "100%",
  },
});
