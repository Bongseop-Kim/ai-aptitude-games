import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { HStack, VStack } from "@/components/ui/stack";
import { SHAPE_POOL } from "@/constants/nback/nback";
import {
  BorderRadius,
  BorderWidth,
  Padding,
  Spacing,
  getAliasTokens,
} from "@/constants/theme";
import { getNbackDetailStages } from "@/db/services/nback";
import { useColorScheme } from "@/hooks/use-color-scheme.web";
import { NbackDetailStage, NbackDetailTrial } from "@/types/nback/nback";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { FlatList, StyleSheet } from "react-native";

export default function NBackDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [stages, setStages] = useState<NbackDetailStage[]>([]);
  const colorScheme = useColorScheme();
  const colors = useMemo(
    () => getAliasTokens(colorScheme ?? "light"),
    [colorScheme]
  );
  const shapeMap = useMemo(
    () => new Map(SHAPE_POOL.map((shape) => [shape.id, shape.svg])),
    []
  );

  useEffect(() => {
    const fetchStages = async () => {
      if (!id) return;
      const data = await getNbackDetailStages(Number(id));
      setStages(data);
    };
    fetchStages();
  }, [id]);

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={stages}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.stageIndex.toString()}
        renderItem={({ item: stage }) => (
          <VStack
            spacing="spacing12"
            style={[
              styles.stageCard,
              {
                backgroundColor: colors.surface.layer1,
                borderColor: colors.border.base,
              },
            ]}
          >
            <VStack
              spacing="spacing8"
              style={[
                styles.chartSection,
                {
                  backgroundColor: colors.surface.layer1,
                  borderBottomColor: colors.border.muted,
                },
              ]}
            >
              <HStack spacing={8} wrap="wrap" style={styles.grid}>
                {stage.trials.map((trial) => {
                  const Shape = shapeMap.get(trial.shownShapeId);
                  return (
                    <VStack
                      key={trial.trialIndex}
                      align="center"
                      justify="center"
                      style={[
                        styles.cell,
                        {
                          backgroundColor: getHeatmapColor(
                            trial,
                            colors.border.layer2,
                            colors.feedback.successFg,
                            colors.feedback.errorFg
                          ),
                        },
                      ]}
                    >
                      {Shape ? (
                        <Shape
                          width={ICON_SIZE}
                          height={ICON_SIZE}
                          color={colors.surface.base}
                        />
                      ) : null}
                    </VStack>
                  );
                })}
              </HStack>
            </VStack>
            <VStack
              spacing="spacing4"
              style={[
                styles.bottomSection,
                { backgroundColor: colors.surface.base },
              ]}
            >
              <ThemedText type="captionM">
                {stage.trials.length}문제 중{" "}
                <ThemedText
                  type="labelM"
                  style={[styles.metricEmphasis, { color: colors.text.link }]}
                >
                  {countCorrect(stage.trials)}
                </ThemedText>
                문제를 맞혔어요
              </ThemedText>
              <ThemedText type="captionM">
                정확도는{" "}
                <ThemedText
                  type="labelM"
                  style={[styles.metricEmphasis, { color: colors.text.link }]}
                >
                  {(stage.accuracy * 100).toFixed(1)}%
                </ThemedText>
                예요
              </ThemedText>
              <ThemedText type="captionM">
                평균{" "}
                <ThemedText
                  type="labelM"
                  style={[styles.metricEmphasis, { color: colors.text.link }]}
                >
                  {formatAvgRt(stage.trials)}
                </ThemedText>{" "}
                만에 결정했어요
              </ThemedText>
            </VStack>
          </VStack>
        )}
        contentContainerStyle={styles.listContent}
      />
    </ThemedView>
  );
}

const MAX_RT_MS = 3000;
const CELL_SIZE = 34;
const ICON_SIZE = 20;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const hexToRgb = (hex: string) => {
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) {
    return { r: 0, g: 0, b: 0 };
  }
  const num = parseInt(normalized, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
};

const mixColors = (from: string, to: string, t: number) => {
  const start = hexToRgb(from);
  const end = hexToRgb(to);
  const ratio = clamp(t, 0, 1);
  const r = Math.round(start.r + (end.r - start.r) * ratio);
  const g = Math.round(start.g + (end.g - start.g) * ratio);
  const b = Math.round(start.b + (end.b - start.b) * ratio);
  return `rgb(${r}, ${g}, ${b})`;
};

const getHeatmapColor = (
  trial: NbackDetailTrial,
  neutral: string,
  correctBase: string,
  incorrectBase: string
) => {
  if (trial.rtMs == null) {
    return neutral;
  }
  const base = trial.isCorrect ? correctBase : incorrectBase;
  const normalized = clamp(trial.rtMs / MAX_RT_MS, 0, 1);
  return mixColors(base, neutral, normalized);
};

const countCorrect = (trials: NbackDetailTrial[]) =>
  trials.filter((trial) => trial.isCorrect).length;

const formatAvgRt = (trials: NbackDetailTrial[]) => {
  const rtValues = trials
    .map((trial) => trial.rtMs)
    .filter((rt): rt is number => rt != null);
  if (rtValues.length === 0) return "-";
  const avg = Math.round(
    rtValues.reduce((sum, value) => sum + value, 0) / rtValues.length
  );
  return `${(avg / 1000).toFixed(1)}초`;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Padding.m,
  },
  listContent: {
    gap: Spacing.spacing16,
    paddingBottom: Padding.m,
  },
  stageCard: {
    borderRadius: BorderRadius.s,
    borderWidth: BorderWidth.s,
    overflow: "hidden",
  },
  bottomSection: {
    padding: Padding.m,
  },
  metricEmphasis: {
    fontFamily: "Pretendard-SemiBold",
  },
  grid: {
    rowGap: Spacing.spacing8,
  },
  chartSection: {
    padding: Padding.m,
    borderBottomWidth: BorderWidth.s,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: BorderRadius.xs,
    alignItems: "center",
    justifyContent: "center",
  },
});
