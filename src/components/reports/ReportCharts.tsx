import { useEffect, useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { useIsFocused } from 'expo-router';

import { Box } from '../../design-system/components/Box';
import { HStack, VStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';
import { resolveColor } from '../../design-system/components/style-props';
import { useDesignSystemTheme } from '../../design-system/provider';
import {
  Canvas,
  Circle,
  Easing,
  Group,
  LinearGradient,
  Path,
  Rect,
  RoundedRect,
  Skia,
  useDerivedValue,
  useSharedValue,
  vec,
  withTiming,
} from '../../lib/native-motion';

type ChartSize = { width: number; height: number };
type Point = { x: number; y: number };

const EMPTY_SIZE = { width: 0, height: 0 };
const RESPONSE_PATTERN_POINTS = [
  { id: 'baseline-1', x: 0.45, y: 0.6 },
  { id: 'baseline-2', x: 0.52, y: 0.55 },
  { id: 'baseline-3', x: 0.58, y: 0.48 },
  { id: 'baseline-4', x: 0.48, y: 0.52 },
  { id: 'baseline-5', x: 0.55, y: 0.5 },
  { id: 'baseline-6', x: 0.5, y: 0.57 },
] as const;
const BULLET_BAR_TOKENS = {
  trackHeight: 'x1_5',
  markerHeight: 'x3',
  markerWidth: 'x0_5',
  radius: 'r1_5',
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
      accessibilityValue={{ min: 0, max: 100, now: clamped }}
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
};

export function StressResilienceChart({ values }: StressResilienceChartProps) {
  const { theme } = useDesignSystemTheme();
  const { size, onLayout } = useMeasuredChart();
  const progress = useFocusProgress();
  const brandColor = resolveColor(theme, 'bg.brandSolid');
  const warningBg = resolveColor(theme, 'mannerTemp.l4Bg');
  const points = values.map((value, index) => {
    const x = values.length === 1 ? size.width / 2 : 10 + ((size.width - 20) * index) / (values.length - 1);
    const y = 8 + (size.height - 16) * (1 - clamp(value) / 100);
    return { x, y };
  });
  const path = buildPolylinePath(points);
  const bandX = size.width * 0.46;
  const bandWidth = size.width * 0.18;

  return (
    <Box accessibilityRole="image" height={120} onLayout={onLayout} width="full">
      <Canvas style={{ width: '100%', height: '100%' }}>
        {size.width > 0 ? (
          <>
            <RoundedRect x={0} y={0} width={size.width} height={size.height} r={12} color={resolveColor(theme, 'bg.neutralWeak')} />
            <Rect x={bandX} y={8} width={bandWidth} height={size.height - 16} color={warningBg} />
            <Path
              path={path}
              color={brandColor}
              style="stroke"
              strokeWidth={2.5}
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

export function ResponsePatternChart() {
  const { theme } = useDesignSystemTheme();
  const { size, onLayout } = useMeasuredChart();
  const progress = useFocusProgress(450);
  const brandColor = resolveColor(theme, 'bg.brandSolid');
  const gridColor = resolveColor(theme, 'stroke.neutralWeak');
  const pointColor = resolveColor(theme, 'fg.neutralSubtle');
  const activeRadius = useDerivedValue(() => 4 + progress.value * 6, []);

  return (
    <VStack gap="x2">
      <Box accessibilityRole="image" height={210} onLayout={onLayout} width="full">
        <Canvas style={{ width: '100%', height: '100%' }}>
          {size.width > 0 ? (
            <>
              <RoundedRect x={0} y={0} width={size.width} height={size.height} r={12} color={resolveColor(theme, 'bg.neutralWeak')} />
              <Path path={buildPolylinePath([{ x: size.width / 2, y: 12 }, { x: size.width / 2, y: size.height - 12 }])} color={gridColor} style="stroke" strokeWidth={1} />
              <Path path={buildPolylinePath([{ x: 12, y: size.height / 2 }, { x: size.width - 12, y: size.height / 2 }])} color={gridColor} style="stroke" strokeWidth={1} />
              {RESPONSE_PATTERN_POINTS.map((point) => (
                <Circle
                  key={point.id}
                  cx={point.x * size.width}
                  cy={point.y * size.height}
                  r={4}
                  color={pointColor}
                />
              ))}
              <Circle cx={0.68 * size.width} cy={0.28 * size.height} r={activeRadius} color={brandColor} />
            </>
          ) : null}
        </Canvas>
      </Box>
      <Text align="center" color="fg.brand" textStyle="t4Bold">
        통찰형 직관 결정가
      </Text>
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
  const markerWidth = 3;
  const markerX = useDerivedValue(() => {
    const targetX = size.width * ((100 - clampedPercentile) / 100) * progress.value;
    return clamp(targetX, 0, Math.max(0, size.width - markerWidth));
  }, [clampedPercentile, size.width]);

  return (
    <VStack gap="x2">
      <Box height="x12" onLayout={onLayout} position="relative" width="full">
        <Canvas style={{ width: '100%', height: '100%' }}>
          {size.width > 0 ? (
            <>
              <RoundedRect x={0} y={18} width={size.width} height={24} r={6} color={resolveColor(theme, 'bg.brandWeak')}>
                <LinearGradient
                  start={vec(0, 18)}
                  end={vec(size.width, 18)}
                  colors={[
                    resolveColor(theme, 'bg.brandWeak') ?? 'transparent',
                    resolveColor(theme, 'palette.yellow100') ?? 'transparent',
                    resolveColor(theme, 'mannerTemp.l4Bg') ?? 'transparent',
                  ]}
                />
              </RoundedRect>
              <Group>
                <Rect x={markerX} y={10} width={markerWidth} height={40} color={resolveColor(theme, 'fg.neutral')} />
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
  const min = Math.min(...scores, 55);
  const max = Math.max(...scores, 85);
  const range = max - min || 1;
  const points = scores.map((score, index) => ({
    x: scores.length === 1 ? size.width / 2 : 14 + ((size.width - 28) * index) / (scores.length - 1),
    y: 12 + (size.height - 28) * (1 - (score - min) / range),
  }));
  const path = buildPolylinePath(points);

  return (
    <Box accessibilityRole="image" height={100} onLayout={onLayout} width="full">
      <Canvas style={{ width: '100%', height: '100%' }}>
        {size.width > 0 ? (
          <>
            <Path
              path={path}
              color={brandColor}
              style="stroke"
              strokeWidth={2.5}
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
                strokeWidth={2}
              />
            ))}
          </>
        ) : null}
      </Canvas>
    </Box>
  );
}
