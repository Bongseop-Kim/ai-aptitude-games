import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useEffect, useState } from "react";
import { Modal, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

export type CountdownProps = {
  /**
   * 카운트다운 시작 숫자 (기본값: 3)
   */
  startCount?: number;
  /**
   * 카운트다운이 완료되었을 때 호출되는 콜백
   */
  onComplete?: () => void;
  /**
   * 카운트다운이 표시되는지 여부
   */
  visible?: boolean;
};

export function Countdown({
  startCount = 3,
  onComplete,
  visible = true,
}: CountdownProps) {
  const [count, setCount] = useState(startCount);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  // 테마 색상 가져오기
  const overlayColor = useThemeColor({}, "overlay.base");
  const textColor = useThemeColor({}, "text.inversePrimary");

  useEffect(() => {
    if (!visible) return;

    // 카운트다운 시작
    setCount(startCount);
    scale.value = 0.5;
    opacity.value = 0;

    // 초기 애니메이션
    scale.value = withTiming(1, {
      duration: 200,
      easing: Easing.out(Easing.cubic),
    });
    opacity.value = withTiming(1, {
      duration: 200,
    });

    // 카운트다운 로직
    let currentCount = startCount;
    const interval = setInterval(() => {
      currentCount -= 1;

      if (currentCount > 0) {
        // 숫자 변경 애니메이션
        scale.value = withSequence(
          withTiming(1.2, {
            duration: 100,
            easing: Easing.out(Easing.cubic),
          }),
          withTiming(1, {
            duration: 100,
            easing: Easing.in(Easing.cubic),
          })
        );
        setCount(currentCount);
      } else {
        // 마지막 숫자 (0 또는 "시작")
        setCount(0);
        scale.value = withSequence(
          withTiming(1.3, {
            duration: 150,
            easing: Easing.out(Easing.cubic),
          }),
          withTiming(0.8, {
            duration: 150,
            easing: Easing.in(Easing.cubic),
          }),
          withTiming(1.5, {
            duration: 200,
            easing: Easing.out(Easing.cubic),
          })
        );
        opacity.value = withTiming(0, {
          duration: 200,
          easing: Easing.out(Easing.cubic),
        });

        clearInterval(interval);

        // 완료 콜백 호출
        setTimeout(() => {
          if (onComplete) {
            onComplete();
          }
        }, 300);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [visible, startCount, onComplete]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={[styles.overlay, { backgroundColor: overlayColor }]}>
        <Animated.View style={[styles.content, animatedStyle]}>
          <ThemedText type="display" style={{ color: textColor }}>
            {count > 0 ? count : "시작"}
          </ThemedText>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    justifyContent: "center",
    alignItems: "center",
  },
});
