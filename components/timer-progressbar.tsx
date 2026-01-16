import { useThemeColor } from "@/hooks/use-theme-color";
import { useEffect } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

export type TimerProgressBarProps = {
  /**
   * 타이머 지속 시간 (초)
   */
  duration: number;
  /**
   * 타이머가 시작되었는지 여부
   */
  isRunning?: boolean;
  /**
   * 타이머가 종료되었을 때 호출되는 콜백
   */
  onComplete?: () => void;
  /**
   * 프로그레스바 높이 (기본값: 4)
   */
  height?: number;
  /**
   * 프로그레스바 색상
   */
  color?: string;
  /**
   * 배경 색상
   */
  backgroundColor?: string;
  /**
   * 컨테이너 스타일
   */
  style?: ViewStyle;
};

export function TimerProgressBar({
  duration,
  isRunning = false,
  onComplete,
  height = 4,
  color,
  backgroundColor,
  style,
}: TimerProgressBarProps) {
  const progress = useSharedValue(0);

  // 테마 색상 가져오기
  const defaultProgressColor = useThemeColor({}, "brand.primary");
  const defaultBackgroundColor = useThemeColor({}, "surface.muted");

  const progressColor = color || defaultProgressColor;
  const bgColor = backgroundColor || defaultBackgroundColor;

  useEffect(() => {
    if (isRunning) {
      // 타이머 시작 - 0에서 1로 애니메이션
      progress.value = 0;
      progress.value = withTiming(
        1,
        {
          duration: duration * 1000,
          easing: Easing.linear,
        },
        (finished) => {
          // worklet 컨텍스트에서 JavaScript 함수 호출 시 scheduleOnRN 사용 (공식 권장 방식)
          if (finished && onComplete) {
            scheduleOnRN(onComplete);
          }
        }
      );
    } else {
      // 타이머 정지
      progress.value = withTiming(0, {
        duration: 0,
      });
    }
  }, [isRunning, duration, onComplete]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${progress.value * 100}%`,
    };
  });

  return (
    <View
      style={[
        styles.container,
        {
          height,
          backgroundColor: bgColor,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          {
            height,
            backgroundColor: progressColor,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    overflow: "hidden",
  },
});
