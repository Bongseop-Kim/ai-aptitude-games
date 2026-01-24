import { ThemedText } from "@/components/themed-text";
import { TypographyKey } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";

export type TimerProps = {
  /**
   * 타이머 시간 (초)
   */
  duration: number;
  /**
   * 타이머가 시작되었는지 여부
   */
  isRunning?: boolean;
  /**
   * 타이머가 종료되었을 때 호출되는 콜백
   */
  onTimeUp?: () => void;
  /**
   * 매 초마다 남은 시간을 전달하는 콜백
   */
  onTick?: (remainingSeconds: number) => void;
  /**
   * 경고 시간 (초) - 이 시간 이하로 남았을 때 경고 색상 표시
   */
  warningThreshold?: number;
  /**
   * 타이머 텍스트 타입
   */
  textType?: TypographyKey;
};

export function Timer({
  duration,
  isRunning = false,
  onTimeUp,
  onTick,
  warningThreshold = 10,
  textType = "title2",
}: TimerProps) {
  const [remainingTime, setRemainingTime] = useState(duration);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasCalledTimeUp = useRef(false);

  // 테마 색상 가져오기
  const errorColor = useThemeColor({}, "feedback.errorFg");
  const warningColor = useThemeColor({}, "feedback.warningFg");

  // duration이 변경되면 타이머 초기화
  useEffect(() => {
    setRemainingTime(duration);
    hasCalledTimeUp.current = false;
  }, [duration]);

  useEffect(() => {
    if (isRunning && remainingTime > 0) {
      intervalRef.current = setInterval(() => {
        setRemainingTime((prev) => {
          const newTime = Math.max(0, prev - 1);

          // onTick 콜백 호출
          if (onTick) {
            onTick(newTime);
          }

          // 시간이 다 되었을 때
          if (newTime === 0 && !hasCalledTimeUp.current) {
            hasCalledTimeUp.current = true;
            if (onTimeUp) {
              // 약간의 지연 후 콜백 호출 (UI 업데이트 후)
              setTimeout(() => {
                onTimeUp();
              }, 100);
            }
          }

          return newTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, remainingTime, onTimeUp, onTick]);

  // 시간을 MM:SS 형식으로 변환
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // 경고 색상 결정
  const isWarning = remainingTime <= warningThreshold && remainingTime > 0;
  const isDanger = remainingTime === 0;

  const textColor = isDanger
    ? errorColor
    : isWarning
    ? warningColor
    : undefined;

  return (
    <View style={styles.container}>
      <ThemedText
        type={textType}
        style={[styles.timerText, textColor && { color: textColor }]}
      >
        {formatTime(remainingTime)}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  timerText: {
    fontVariant: ["tabular-nums"],
  },
});
