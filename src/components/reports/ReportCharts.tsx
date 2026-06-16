import { useEffect, useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { useIsFocused } from 'expo-router';

import { Box } from '../../design-system/components/Box';
import { HStack, VStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';
import { resolveColor } from '../../design-system/components/style-props';
import { useDesignSystemTheme } from '../../design-system/provider';
import type { ReportResponsePatternScale } from '../../domain/report';
import {
  Canvas,
  Circle,
  Easing,
  Group,
  Path,
  Rect,
  RoundedRect,
  Skia,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from '../../lib/native-motion';

type ChartSize = { width: number; height: number };
type Point = { x: number; y: number };

const EMPTY_SIZE = { width: 0, height: 0 };
const BULLET_BAR_TOKENS = {
  trackHeight: 'x1_5',
  markerHeight: 'x3',
  markerWidth: 'x1',
  radius: 'r1_5',
} as const;
const CHART_TOKENS = {
  stressHeight: 'x29',
  growthHeight: 'x23',
  percentileHeight: 'x12',
  cardRadius: 'r3',
  trackRadius: 'r1_5',
  lineStrokeWidth: 'x0_5',
  pointStrokeWidth: 'x0_5',
} as const;

function clamp(value: number, min = 0, max = 100) {
  'worklet';
  return Math.max(min, Math.min(max, value));
}

function buildPolylinePath(points: Point[]) {
  const builder = Skia.PathBuilder.Make();

  points.forEach((point, index) => {
    if (index === 0) {
      builder.moveTo(point.x, point.y);
      return;
    }

    builder.lineTo(point.x, point.y);
  });

  return builder.detach();
}

function useMeasuredChart() {
  const [size, setSize] = useState<ChartSize>(EMPTY_SIZE);

  return {
    size,
    onLayout: (event: LayoutChangeEvent) => {
      const { width, height } = event.nativeEvent.layout;
      setSize((current) => (
        current.width === width && current.height === height ? current : { width, height }
      ));
    },
  };
}

function useFocusProgress(duration = 600) {
  const isFocused = useIsFocused();
  const progress = useSharedValue(0);

  useEffect(() => {
    if (!isFocused) return;

    progress.set(0);
    progress.set(withTiming(1, {
      duration,
      easing: Easing.out(Easing.cubic),
    }));
  }, [duration, isFocused, progress]);

  return progress;
}

export type BulletBarProps = {
  value: number;
  peerMedian?: number | null;
};

// Cloned from readiness/ProgressBar — track + animated fill (transform/opacity-safe
// via Skia), plus an optional peer-median marker. score_range is shown on the cover
// only, never here.
export function BulletBar({ value, peerMedian = null }: BulletBarProps) {
  const { theme } = useDesignSystemTheme();
  const { size, onLayout } = useMeasuredChart();
  const progress = useFocusProgress(400);
  const clamped = clamp(value);
  const trackColor = resolveColor(theme, 'bg.neutralWeak');
  const fillColor = resolveColor(theme, 'bg.brandSolid');
  const markerColor = resolveColor(theme, 'fg.neutral');
  const fillWidth = useDerivedValue(
    () => (size.width * clamped) / 100 * progress.value,
    [size.width, clamped],
  );
  const trackHeight = theme.dimension.x[BULLET_BAR_TOKENS.trackHeight];
  const markerHeight = theme.dimension.x[BULLET_BAR_TOKENS.markerHeight];
  const markerWidth = theme.dimension.x[BULLET_BAR_TOKENS.markerWidth];
  const trackRadius = theme.radius[BULLET_BAR_TOKENS.radius];
  const hasMarker = peerMedian != null;
  const markerX = hasMarker
    ? Math.max(0, Math.min(size.width - markerWidth, (size.width * clamp(peerMedian)) / 100))
    : 0;
  const clip =
    size.width > 0
      ? Skia.RRectXY(Skia.XYWHRect(0, (markerHeight - trackHeight) / 2, size.width, trackHeight), trackRadius, trackRadius)
      : null;

  return (
    <Box
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: clamped, text: `점수 ${clamped}점` }}
      flex={1}
      height={markerHeight}
      onLayout={onLayout}
      width="full"
    >
      <Canvas style={{ width: '100%', height: '100%' }}>
        {size.width > 0 && clip ? (
          <>
            <RoundedRect
              x={0}
              y={(markerHeight - trackHeight) / 2}
              width={size.width}
              height={trackHeight}
              r={trackRadius}
              color={trackColor}
            />
            <Group clip={clip}>
              <Rect x={0} y={(markerHeight - trackHeight) / 2} width={fillWidth} height={trackHeight} color={fillColor} />
            </Group>
            {hasMarker ? (
              <Rect x={markerX} y={0} width={markerWidth} height={markerHeight} color={markerColor} />
            ) : null}
          </>
        ) : null}
      </Canvas>
    </Box>
  );
}

export type StressResilienceChartProps = {
  values: number[];
  warningBand?: { start: number; end: number } | null;
};

export function StressResilienceChart({ values, warningBand }: StressResilienceChartProps) {
  const { theme } = useDesignSystemTheme();
  const { size, onLayout } = useMeasuredChart();
  const progress = useFocusProgress();
  const brandColor = resolveColor(theme, 'bg.brandSolid');
  const warningBg = resolveColor(theme, 'mannerTemp.l4Bg');
  const chartHeight = theme.dimension.x[CHART_TOKENS.stressHeight];
  const chartRadius = theme.radius[CHART_TOKENS.cardRadius];
  const lineStrokeWidth = theme.dimension.x[CHART_TOKENS.lineStrokeWidth];
  const points = values.map((value, index) => {
    // Skia path geometry keeps small internal insets so strokes and warning
    // bands do not clip at chart edges.
    const x = values.length === 1 ? size.width / 2 : 10 + ((size.width - 20) * index) / (values.length - 1);
    const y = 8 + (size.height - 16) * (1 - clamp(value) / 100);
    return { x, y };
  });
  const path = buildPolylinePath(points);
  const bandX = warningBand ? size.width * warningBand.start : 0;
  const bandWidth = warningBand ? size.width * (warningBand.end - warningBand.start) : 0;
  const chartSummary = values.length > 0
    ? `스트레스 복원력 추이. 시작 ${clamp(values[0])}점, 마지막 ${clamp(values[values.length - 1])}점.`
    : '스트레스 복원력 추이를 준비하고 있어요.';

  return (
    <Box accessibilityLabel={chartSummary} accessibilityRole="image" height={chartHeight} onLayout={onLayout} width="full">
      <Canvas style={{ width: '100%', height: '100%' }}>
        {size.width > 0 ? (
          <>
            <RoundedRect x={0} y={0} width={size.width} height={size.height} r={chartRadius} color={resolveColor(theme, 'bg.neutralWeak')} />
            {warningBand ? (
              <Rect x={bandX} y={8} width={bandWidth} height={size.height - 16} color={warningBg} />
            ) : null}
            <Path
              path={path}
              color={brandColor}
              style="stroke"
              strokeWidth={lineStrokeWidth}
              strokeCap="round"
              strokeJoin="round"
              start={0}
              end={progress}
            />
          </>
        ) : null}
      </Canvas>
    </Box>
  );
}

// One bipolar scale: neutral full-width track, a center tick at 50%, and ONE
// neutral marker positioned at `value`% (성향, not 우열 — never brand/positive/critical).
// Mirrors BulletBar's clamp/measure/useDerivedValue pattern; only the marker x is
// animated (transform-safe).
function PatternTrack({ value }: { value: number }) {
  const { theme } = useDesignSystemTheme();
  const { size, onLayout } = useMeasuredChart();
  const progress = useFocusProgress(400);
  const clamped = clamp(value);
  const trackColor = resolveColor(theme, 'bg.neutralWeak');
  const tickColor = resolveColor(theme, 'stroke.neutralWeak');
  const markerColor = resolveColor(theme, 'fg.brand');
  const trackHeight = theme.dimension.x[BULLET_BAR_TOKENS.trackHeight];
  const markerHeight = theme.dimension.x[BULLET_BAR_TOKENS.markerHeight];
  const markerWidth = theme.dimension.x[BULLET_BAR_TOKENS.markerWidth];
  const trackRadius = theme.radius[BULLET_BAR_TOKENS.radius];
  const trackY = (markerHeight - trackHeight) / 2;
  const markerMax = Math.max(0, size.width - markerWidth);
  const tickX = Math.max(0, Math.min(markerMax, size.width / 2 - markerWidth / 2));
  const markerX = useDerivedValue(
    () => clamp((size.width * clamped) / 100 * progress.value, 0, markerMax),
    [size.width, clamped, markerMax],
  );

  return (
    <Box
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: clamped, text: `성향 위치 ${clamped}점` }}
      flex={1}
      height={markerHeight}
      onLayout={onLayout}
      width="full"
    >
      <Canvas style={{ width: '100%', height: '100%' }}>
        {size.width > 0 ? (
          <>
            <RoundedRect
              x={0}
              y={trackY}
              width={size.width}
              height={trackHeight}
              r={trackRadius}
              color={trackColor}
            />
            <Rect x={tickX} y={0} width={markerWidth} height={markerHeight} color={tickColor} />
            <Rect x={markerX} y={0} width={markerWidth} height={markerHeight} color={markerColor} />
          </>
        ) : null}
      </Canvas>
    </Box>
  );
}

export function ResponsePatternRows({ scales }: { scales: ReportResponsePatternScale[] }) {
  return (
    <VStack gap="x4">
      {scales.map((scale) => (
        <VStack key={scale.key} gap="x1">
          <HStack align="center" gap="x2">
            <Box flex={0.4} minWidth="x14">
              <Text color="fg.neutralSubtle" textStyle="t1Regular" maxLines={2}>
                {scale.left}
              </Text>
            </Box>
            <PatternTrack value={scale.value} />
            <Box flex={0.4} minWidth="x14">
              <Text align="right" color="fg.neutralSubtle" textStyle="t1Regular" maxLines={2}>
                {scale.right}
              </Text>
            </Box>
          </HStack>
          {/* Interpretation slot: reserved for a future one-line reading. The
              payload type carries no such field today, so nothing renders. */}
        </VStack>
      ))}
    </VStack>
  );
}

export type PercentileBarProps = {
  percentile: number;
};

export function PercentileBar({ percentile }: PercentileBarProps) {
  const { theme } = useDesignSystemTheme();
  const { size, onLayout } = useMeasuredChart();
  const progress = useFocusProgress(450);
  const clampedPercentile = clamp(percentile);
  const markerWidth = theme.dimension.x.x1;
  const trackRadius = theme.radius[CHART_TOKENS.trackRadius];
  const percentileHeight = theme.dimension.x[CHART_TOKENS.percentileHeight];
  const trackThickness = theme.dimension.x.x6;
  const trackY = (percentileHeight - trackThickness) / 2;
  const markerThickness = theme.dimension.x.x10;
  const markerY = (percentileHeight - markerThickness) / 2;
  const markerX = useDerivedValue(() => {
    const targetX = size.width * ((100 - clampedPercentile) / 100) * progress.value;
    return clamp(targetX, 0, Math.max(0, size.width - markerWidth));
  }, [clampedPercentile, size.width]);

  return (
    <VStack gap="x2">
      <Box height={percentileHeight} onLayout={onLayout} position="relative" width="full">
        <Canvas style={{ width: '100%', height: '100%' }}>
          {size.width > 0 ? (
            <>
              <RoundedRect
                x={0}
                y={trackY}
                width={size.width}
                height={trackThickness}
                r={trackRadius}
                color={resolveColor(theme, 'bg.neutralWeak')}
              />
              <Group>
                <Rect x={markerX} y={markerY} width={markerWidth} height={markerThickness} color={resolveColor(theme, 'fg.brand')} />
              </Group>
            </>
          ) : null}
        </Canvas>
      </Box>
      <HStack justify="spaceBetween">
        <Text color="fg.neutralSubtle" textStyle="t1Regular">상위 1%</Text>
        <Text color="fg.neutralSubtle" textStyle="t1Regular">50%</Text>
        <Text color="fg.neutralSubtle" textStyle="t1Regular">하위 1%</Text>
      </HStack>
    </VStack>
  );
}

export type GrowthTrendChartProps = {
  scores: number[];
};

export function GrowthTrendChart({ scores }: GrowthTrendChartProps) {
  const { theme } = useDesignSystemTheme();
  const { size, onLayout } = useMeasuredChart();
  const progress = useFocusProgress();
  const brandColor = resolveColor(theme, 'bg.brandSolid');
  const pointFillColor = resolveColor(theme, 'bg.layerFloating');
  const chartHeight = theme.dimension.x[CHART_TOKENS.growthHeight];
  const lineStrokeWidth = theme.dimension.x[CHART_TOKENS.lineStrokeWidth];
  const pointStrokeWidth = theme.dimension.x[CHART_TOKENS.pointStrokeWidth];
  const points = scores.map((score, index) => ({
    // Skia path geometry keeps small internal insets so points and strokes do
    // not clip at chart edges. A fixed 0–100 scale matches StressResilienceChart
    // and keeps growth comparable across reports instead of exaggerating small deltas.
    x: scores.length === 1 ? size.width / 2 : 14 + ((size.width - 28) * index) / (scores.length - 1),
    y: 12 + (size.height - 28) * (1 - clamp(score) / 100),
  }));
  const path = buildPolylinePath(points);
  const chartSummary = scores.length > 0
    ? `성장 추이. 첫 회차 ${scores[0]}점, 최근 ${scores[scores.length - 1]}점.`
    : '성장 추이를 준비하고 있어요.';

  return (
    <Box accessibilityLabel={chartSummary} accessibilityRole="image" height={chartHeight} onLayout={onLayout} width="full">
      <Canvas style={{ width: '100%', height: '100%' }}>
        {size.width > 0 ? (
          <>
            <Path
              path={path}
              color={brandColor}
              style="stroke"
              strokeWidth={lineStrokeWidth}
              strokeCap="round"
              strokeJoin="round"
              start={0}
              end={progress}
            />
            {points.map((point, index) => (
              <Circle key={index} cx={point.x} cy={point.y} r={4} color={pointFillColor} />
            ))}
            {points.map((point, index) => (
              <Circle
                key={`stroke-${index}`}
                cx={point.x}
                cy={point.y}
                r={4}
                color={brandColor}
                style="stroke"
                strokeWidth={pointStrokeWidth}
              />
            ))}
          </>
        ) : null}
      </Canvas>
    </Box>
  );
}
