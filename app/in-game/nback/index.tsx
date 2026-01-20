import { NBACK_GAME } from "@/app/in-game/nback/constants";
import { Badge } from "@/components/badge";
import { Countdown } from "@/components/countdown";
import { FixedButtonView } from "@/components/fixed-button-view";
import { SegmentedPicker } from "@/components/segmented-picker";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { TimerProgressBar } from "@/components/timer-progressbar";
import { GAMES_MAP } from "@/constants/games";
import { Image } from "expo-image";
import { Dimensions, StyleSheet } from "react-native";
import { useNBackGame } from "./useHook";

export default function NBackGameScreen() {
  const game = GAMES_MAP["nback"];
  const stimulusSec = NBACK_GAME.rules.stimulusSec;

  const {
    currentStage,
    currentShape,
    handleAnswer,
    handleCountdownComplete,
    handleTimeUp,
    headerText,
    isPickerDisabled,
    isTimerRunning,
    remainingQuestions,
    selectedValue,
    showCountdown,
  } = useNBackGame();

  // 현재 스테이지가 없으면 null 반환
  if (!currentStage) {
    return null;
  }

  const { copy } = currentStage;

  return (
    <FixedButtonView>
      <TimerProgressBar
        duration={stimulusSec}
        isRunning={isTimerRunning}
        onComplete={handleTimeUp}
      />

      <ThemedView style={styles.contentContainer}>
        <Badge
          variant="default"
          type="ghost"
          kind="text"
          style={styles.remainingBadge}
        >
          남은 문항 {remainingQuestions}
        </Badge>

        <ThemedText type="title1" style={styles.headerText}>
          {headerText}
        </ThemedText>

        <Image
          source={currentShape?.source ?? game.image}
          style={styles.gameImage}
        />

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
    </FixedButtonView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 24,
  },
  remainingBadge: {
    alignSelf: "flex-end",
    marginBottom: 16,
  },
  headerText: {
    textAlign: "center",
    height: 80,
    marginBottom: 24,
    textAlignVertical: "center",
  },
  gameImage: {
    width: "100%",
    height: Dimensions.get("window").width - 32,
    borderRadius: 12,
    marginBottom: 24,
  },
  segmentedPicker: {
    width: "100%",
    minHeight: 120,
  },
});
