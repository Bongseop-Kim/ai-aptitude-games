import { getAliasTokens } from "@/shared/config/theme";
import { Badge } from "@/shared/ui/badge";
import { Countdown } from "@/shared/ui/countdown";
import { FixedButtonView } from "@/shared/ui/fixed-button-view";
import { GameExitGuard } from "@/shared/ui/game-exit-guard";
import { Spacer } from "@/shared/ui/spacer";
import { TimerProgressBar } from "@/shared/ui/timer-progressbar";
import { ThemedModal } from "@/shared/ui/themed-modal";
import { ThemedText } from "@/shared/ui/themed-text";
import { ThemedView } from "@/shared/ui/themed-view";
import { useColorScheme } from "@/shared/lib/use-color-scheme";
import { useRotationGame } from "@/features/rotation-game";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

const CELL_SIZE = 24;

const ShapeGrid = ({
  matrix,
  label,
}: {
  matrix: number[][];
  label: string;
}) => {
  const colorScheme = useColorScheme();
  const colors = getAliasTokens(colorScheme ?? "light");

  return (
    <View style={styles.shapeWrap}>
      <ThemedText type="captionS" style={styles.labelText}>
        {label}
      </ThemedText>
      <ThemedView style={styles.shapeFrame}>
        {matrix.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.row}>
            {row.map((cell, colIndex) => (
              <View
                key={`cell-${rowIndex}-${colIndex}`}
                style={[
                  styles.cell,
                  {
                    backgroundColor: cell
                      ? colors.brand.accent
                      : colors.surface.muted,
                  },
                ]}
              />
            ))}
          </View>
        ))}
      </ThemedView>
    </View>
  );
};

export function RotationPlayWidget() {
  const {
    currentIndex,
    totalQuestions,
    phase,
    puzzleTarget,
    transformedPuzzle,
    rotateRight,
    flipHorizontalAxis,
    flipVerticalAxis,
    resetTransform,
    handleSubmit,
    handleTimeUp,
    handleCountdownComplete,
    answerMarkerRatio,
    showCountdown,
    isTimerRunning,
    isAnswerLocked,
    remainingTime,
    correctAnswers,
  } = useRotationGame();

  const colorScheme = useColorScheme();
  const colors = getAliasTokens(colorScheme ?? "light");
  const [isFinishedModalVisible, setIsFinishedModalVisible] = useState(false);

  const isPlaying = phase === "playing";
  const finishedAccuracy =
    totalQuestions === 0
      ? 0
      : Math.round((correctAnswers / totalQuestions) * 100);

  const transformedPuzzleWithFallback = useMemo(() => {
    if (!transformedPuzzle.length) {
      return [];
    }
    return transformedPuzzle;
  }, [transformedPuzzle]);

  useEffect(() => {
    if (phase === "finished") {
      setIsFinishedModalVisible(true);
    }
  }, [phase]);

  if (!puzzleTarget.length || !transformedPuzzleWithFallback.length) {
    return null;
  }

  return (
    <FixedButtonView>
      <GameExitGuard />
      <TimerProgressBar
        duration={remainingTime}
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
        <Spacer size="spacing16" />
        <ThemedText type="title2">도형 회전 / 반전</ThemedText>
        <Spacer size="spacing16" />
        <ThemedText type="captionM">
          목표 도형과 동일해지도록 회전/반전을 조작하세요.
        </ThemedText>
        <Spacer size="spacing8" />
        <ThemedText type="captionM">
          문제 {currentIndex + 1} / {totalQuestions}
        </ThemedText>

        <Spacer size="spacing20" />
        <ThemedView style={styles.panesContainer}>
          <ShapeGrid matrix={puzzleTarget} label="목표" />
          <ShapeGrid matrix={transformedPuzzleWithFallback} label="현재" />
        </ThemedView>

        <Spacer size="spacing20" />
        <View style={styles.controlRow}>
          <Pressable
            onPress={rotateRight}
            disabled={isAnswerLocked || !isPlaying}
            style={({ pressed }) => [
              styles.controlButton,
              {
                backgroundColor: pressed
                  ? colors.brand.primaryAlpha20
                  : colors.surface.layer2,
              },
            ]}
          >
            <ThemedText>회전</ThemedText>
          </Pressable>
          <Pressable
            onPress={flipHorizontalAxis}
            disabled={isAnswerLocked || !isPlaying}
            style={({ pressed }) => [
              styles.controlButton,
              {
                backgroundColor: pressed
                  ? colors.brand.primaryAlpha20
                  : colors.surface.layer2,
              },
            ]}
          >
            <ThemedText>가로반전</ThemedText>
          </Pressable>
          <Pressable
            onPress={flipVerticalAxis}
            disabled={isAnswerLocked || !isPlaying}
            style={({ pressed }) => [
              styles.controlButton,
              {
                backgroundColor: pressed
                  ? colors.brand.primaryAlpha20
                  : colors.surface.layer2,
              },
            ]}
          >
            <ThemedText>세로반전</ThemedText>
          </Pressable>
          <Pressable
            onPress={resetTransform}
            disabled={isAnswerLocked || !isPlaying}
            style={({ pressed }) => [
              styles.controlButton,
              {
                backgroundColor: pressed
                  ? colors.brand.primaryAlpha20
                  : colors.surface.layer2,
              },
            ]}
          >
            <ThemedText>초기화</ThemedText>
          </Pressable>
        </View>

        <Spacer size="spacing24" />

        <Pressable
          onPress={handleSubmit}
          disabled={isAnswerLocked || !isPlaying}
          style={({ pressed }) => [
            styles.submitButton,
            {
              backgroundColor: pressed
                ? colors.brand.secondary
                : colors.brand.primary,
              opacity: isAnswerLocked || !isPlaying ? 0.6 : 1,
            },
          ]}
        >
          <ThemedText style={{ color: colors.text.inversePrimary }}>
            정답 확인
          </ThemedText>
        </Pressable>
      </ThemedView>

      <Countdown
        startCount={3}
        visible={showCountdown}
        onComplete={handleCountdownComplete}
      />

      <ThemedModal
        visible={isFinishedModalVisible}
        title="게임 종료"
        description={`전체 정답률 ${finishedAccuracy}%`}
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
    padding: 16,
  },
  panesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  shapeWrap: {
    flex: 1,
    alignItems: "center",
  },
  shapeFrame: {
    padding: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    borderColor: "rgba(0,0,0,0.12)",
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  row: {
    flexDirection: "row",
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 6,
    margin: 2,
  },
  labelText: {
    marginBottom: 8,
  },
  controlRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "space-between",
  },
  controlButton: {
    width: "48%",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  submitButton: {
    marginTop: 24,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
});
