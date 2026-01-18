import { Badge } from "@/components/badge";
import { Countdown } from "@/components/countdown";
import { FixedButtonView } from "@/components/fixed-button-view";
import { SegmentedPicker } from "@/components/segmented-picker";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { TimerProgressBar } from "@/components/timer-progressbar";
import { GAMES_MAP } from "@/constants/games";
import NBACK_GAME from "@/constants/games/nback";
import { Image } from "expo-image";
import { useState } from "react";
import { Dimensions, StyleSheet } from "react-native";

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
      <Badge
        variant="success"
        type="fill"
        kind="text"
        shape="speech"
        tailPosition="top"
      >
        응답완료
      </Badge>

      <ThemedView style={styles.contentContainer}>
        <Badge variant="default" type="ghost" kind="text" style={styles.remainingBadge}>
          남은 문항 20
        </Badge>

        <ThemedText type="title1" style={styles.headerText}>
          {NBACK_GAME[1].headerContent}
        </ThemedText>

        <Image source={game.image} style={styles.gameImage} />
        <SegmentedPicker
          options={[
            { label: "다름", value: "0" },
            { label: "같음", value: "1" },
          ]}
          value={selectedValue}
          onChange={setSelectedValue} 
          columns={3} // 3열 그리드
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
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 24,
  },
  remainingBadge: {
    marginBottom: 8,
    alignSelf: "flex-end",
  },
  headerText: {
    textAlign: "center",
    marginBottom: 8,
  },
  gameImage: {
    width: "100%",
    height: Dimensions.get("window").width - 32,
    borderRadius: 12,
    marginVertical: 16,
  },
  segmentedPicker: {
    marginTop: 8,
  },
});
