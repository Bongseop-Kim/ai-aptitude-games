import { Countdown } from "@/components/countdown";
import { FixedButtonView } from "@/components/fixed-button-view";
import { SegmentedPicker } from "@/components/segmented-picker";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { TimerProgressBar } from "@/components/timer-progressbar";
import { GAMES_MAP } from "@/constants/games";
import NBACK_GAME from "@/constants/games/nback";
import { useState } from "react";
import { StyleSheet } from "react-native";

export default function NBackGameScreen() {
  const game = GAMES_MAP["nback"];

  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showCountdown, setShowCountdown] = useState(true);
  const [selectedValue, setSelectedValue] = useState<string | undefined>();

  const handleCountdownComplete = () => {
    setShowCountdown(false);
    setIsTimerRunning(true);
  };

  const handleTimeUp = () => {
    console.log("시간 종료!");
    setIsTimerRunning(false);
    // 게임 종료 로직 추가
  };

  return (
    <FixedButtonView>
      <TimerProgressBar
        duration={3}
        isRunning={isTimerRunning}
        onComplete={handleTimeUp}
      />
      <ThemedView style={styles.contentContainer}>
        <ThemedText type="title1" style={styles.headerText}>
          {NBACK_GAME[1].headerContent}
        </ThemedText>

        <SegmentedPicker
          options={[
            { label: "모집공고", value: "모집공고" },
            { label: "특별공급", value: "특별공급" },
            { label: "1순위 청약", value: "1순위 청약" },
            { label: "2순위 청약", value: "2순위 청약" },
            { label: "당첨자 발표", value: "당첨자 발표" },
            { label: "계약기간", value: "계약기간" },
          ]}
          value={selectedValue}
          onChange={setSelectedValue}
          columns={3} // 3열 그리드
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
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  headerText: {
    textAlign: "center",
  },
});
