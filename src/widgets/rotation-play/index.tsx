import { getAliasTokens } from "@/shared/config/theme";
import { BorderRadius, Padding, Spacing } from "@/shared/config/theme";
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
import { useGameNavigation } from "@/shared/lib/use-game-navigation";
import { useRotationGame } from "@/features/rotation-game";
import { Pressable, StyleSheet, View } from "react-native";

const CELL_SIZE = 24;

const ShapeGrid = ({
  matrix,
  label,
  colors,
}: {
  matrix: number[][];
  label: string;
  colors: ReturnType<typeof getAliasTokens>;
}) => {
  return (
    <View style={styles.shapeWrap}>
      <ThemedText type="captionS" style={styles.labelText}>
        {label}
      </ThemedText>
      <ThemedView
        style={[
          styles.shapeFrame,
          {
            borderColor: colors.border.alpha,
            backgroundColor: colors.surface.alpha,
          },
        ]}
      >
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
  const { goHome, goPreGame, goHistory } = useGameNavigation("rotation");

  const isPlaying = phase === "playing";
  const isFinished = phase === "finished";
  const finishedAccuracy =
    totalQuestions === 0
      ? 0
      : Math.round((correctAnswers / totalQuestions) * 100);

  if (!puzzleTarget.length || !transformedPuzzle.length) {
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
          <ShapeGrid matrix={puzzleTarget} label="목표" colors={colors} />
          <ShapeGrid matrix={transformedPuzzle} label="현재" colors={colors} />
        </ThemedView>

        <Spacer size="spacing20" />
        <View style={styles.controlRow}>
          <Pressable
            onPress={rotateRight}
            disabled={isAnswerLocked || !isPlaying}
            accessibilityRole="button"
            accessibilityLabel="회전"
            accessibilityHint="현재 도형을 오른쪽으로 회전합니다"
            accessibilityState={{ disabled: isAnswerLocked || !isPlaying }}
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
            accessibilityRole="button"
            accessibilityLabel="가로반전"
            accessibilityHint="현재 도형을 가로로 반전합니다"
            accessibilityState={{ disabled: isAnswerLocked || !isPlaying }}
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
            accessibilityRole="button"
            accessibilityLabel="세로반전"
            accessibilityHint="현재 도형을 세로로 반전합니다"
            accessibilityState={{ disabled: isAnswerLocked || !isPlaying }}
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
            accessibilityRole="button"
            accessibilityLabel="초기화"
            accessibilityHint="도형 조작을 초기 상태로 되돌립니다"
            accessibilityState={{ disabled: isAnswerLocked || !isPlaying }}
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
          accessibilityRole="button"
          accessibilityLabel="정답 확인"
          accessibilityHint="현재 조작 내용을 정답으로 제출합니다"
          accessibilityState={{ disabled: isAnswerLocked || !isPlaying }}
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
        visible={isFinished}
        title="게임 종료"
        description={`전체 정답률 ${finishedAccuracy}%`}
        onRequestClose={goHome}
        primaryAction={{
          label: "다시 시작",
          onPress: goPreGame,
        }}
        secondaryAction={{
          label: "기록 보기",
          onPress: goHistory,
        }}
      />
    </FixedButtonView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    padding: Padding.m,
  },
  panesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.spacing12,
  },
  shapeWrap: {
    flex: 1,
    alignItems: "center",
  },
  shapeFrame: {
    padding: Spacing.spacing10,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: BorderRadius.s,
    borderColor: "transparent",
    backgroundColor: "transparent",
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
    marginBottom: Spacing.spacing8,
  },
  controlRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.spacing8,
    justifyContent: "space-between",
  },
  controlButton: {
    width: "48%",
    paddingVertical: Spacing.spacing10,
    paddingHorizontal: Spacing.spacing12,
    borderRadius: 10,
    alignItems: "center",
  },
  submitButton: {
    marginTop: Spacing.spacing24,
    borderRadius: BorderRadius.s,
    paddingVertical: 14,
    alignItems: "center",
  },
});
