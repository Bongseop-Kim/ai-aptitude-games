import { useThemeColor } from "@/hooks/use-theme-color";
import { ReactNode, useEffect, useState } from "react";
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
  /**
   * 응답 마커 비율 (0~1)
   */
  markerRatio?: number | null;
  /**
   * 응답 마커 콘텐츠
   */
  markerContent?: ReactNode;
};

export function TimerProgressBar({
  duration,
  isRunning = false,
  onComplete,
  height = 4,
  color,
  backgroundColor,
  style,
  markerRatio,
  markerContent,
}: TimerProgressBarProps) {
  const progress = useSharedValue(0);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  const [markerWidth, setMarkerWidth] = useState<number | null>(null);

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

  const clampedMarkerRatio =
    markerRatio === null || markerRatio === undefined
      ? null
      : Math.min(1, Math.max(0, markerRatio));
  const markerLeft =
    clampedMarkerRatio !== null &&
    containerWidth !== null &&
    markerWidth !== null
      ? Math.min(
          Math.max(
            clampedMarkerRatio * containerWidth - markerWidth / 2,
            0
          ),
          Math.max(containerWidth - markerWidth, 0)
        )
      : null;

  return (
    <View
      style={[styles.wrapper, style]}
      onLayout={(event) => {
        const nextWidth = event.nativeEvent.layout.width;
        setContainerWidth((prev) => (prev === nextWidth ? prev : nextWidth));
      }}
    >
      <View
        style={[
          styles.barContainer,
          {
            height,
            backgroundColor: bgColor,
          },
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
      {markerContent && clampedMarkerRatio !== null && (
        <View
          pointerEvents="none"
          style={[
            styles.markerContainer,
            {
              left: markerLeft ?? 0,
              top: height - 4,
            },
          ]}
        >
          <View
            onLayout={(event) => {
              const nextWidth = event.nativeEvent.layout.width;
              setMarkerWidth((prev) => (prev === nextWidth ? prev : nextWidth));
            }}
          >
            {markerContent}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    position: "relative",
    overflow: "visible",
  },
  barContainer: {
    width: "100%",
    overflow: "hidden",
  },
  markerContainer: {
    position: "absolute",
    alignItems: "center",
    zIndex: 1,
  },
});
