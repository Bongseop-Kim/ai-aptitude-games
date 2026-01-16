import { FixedButtonView } from "@/components/fixed-button-view";
import { Timer } from "@/components/timer";
import { GAMES_MAP } from "@/constants/games";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

export default function InGameScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const game = id ? GAMES_MAP[id] : undefined;

  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const handleStart = () => {
    setIsTimerRunning(true);
  };

  const handleTimeUp = () => {
    console.log("시간 종료!");
    setIsTimerRunning(false);
    // 게임 종료 로직 추가
  };

  const handleTick = (remainingSeconds: number) => {
    // 매 초마다 실행되는 로직 (필요시)
    console.log("남은 시간:", remainingSeconds);
  };

  return (
    <FixedButtonView>
      <View style={styles.container}>
        <Timer
          duration={60} // 60초 타이머
          isRunning={isTimerRunning}
          onTimeUp={handleTimeUp}
          onTick={handleTick}
          warningThreshold={10} // 10초 이하일 때 경고 색상
          textType="title1"
        />
      </View>
    </FixedButtonView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
