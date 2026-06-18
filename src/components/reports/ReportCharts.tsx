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
  Easing,
  Group,
  Rect,
  RoundedRect,
  Skia,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from '../../lib/native-motion';

type ChartSize = { width: number; height: number };

const EMPTY_SIZE = { width: 0, height: 0 };
const BULLET_BAR_TOKENS = {
  trackHeight: 'x1_5',
  markerHeight: 'x3',
  markerWidth: 'x1',
  radius: 'r1_5',
} as const;

function clamp(value: number, min = 0, max = 100) {
  'worklet';
  return Math.max(min, Math.min(max, value));
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
  const markerColor = resolveColor(theme, 'fg.neutral');
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
