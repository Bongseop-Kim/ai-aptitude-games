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
  LinearGradient,
  Path,
  Rect,
  RoundedRect,
  Skia,
  useDerivedValue,
  useSharedValue,
  withTiming,
  vec,
} from '../../lib/native-motion';

type ChartSize = { width: number; height: number };

const EMPTY_SIZE = { width: 0, height: 0 };
const BULLET_BAR_TOKENS = {
  trackHeight: 'x1_5',
  markerHeight: 'x3',
  markerWidth: 'x1',
  radius: 'r1_5',
} as const;
const PATTERN_TRACK_TOKENS = {
  centerTickWidth: 'x0_5',
  markerGap: 'x1',
  markerHeight: 'x3',
  paddingY: 'x1',
  trackHeight: 'x1_5',
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

function createTriangleMarkerPath({
  centerX,
  markerTop,
  markerHeight,
}: {
  centerX: number;
  markerTop: number;
  markerHeight: number;
}) {
  const halfWidth = markerHeight / 2;
  const path = Skia.Path.Make();

  path.moveTo(centerX, markerTop);
  path.lineTo(centerX - halfWidth, markerTop + markerHeight);
  path.lineTo(centerX + halfWidth, markerTop + markerHeight);
  path.close();

  return path;
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

// One bipolar scale: full-width spectrum, a center tick at 50%, and one marker
// positioned at `value`% (성향, not 우열).
function PatternTrack({ value }: { value: number }) {
  const { theme } = useDesignSystemTheme();
  const { size, onLayout } = useMeasuredChart();
  const clamped = clamp(value);
  const edgeColor = theme.color.mannerTemp.l5Text;
  const centerColor = theme.color.bg.brandSolid;
  const markerColor = theme.color.fg.neutral;
  const tickColor = theme.color.stroke.neutralWeak;
  const centerTickWidth = theme.dimension.x[PATTERN_TRACK_TOKENS.centerTickWidth];
  const markerGap = theme.dimension.x[PATTERN_TRACK_TOKENS.markerGap];
  const markerHeight = theme.dimension.x[PATTERN_TRACK_TOKENS.markerHeight];
  const paddingY = theme.dimension.x[PATTERN_TRACK_TOKENS.paddingY];
  const trackHeight = theme.dimension.x[PATTERN_TRACK_TOKENS.trackHeight];
  const trackRadius = theme.radius[PATTERN_TRACK_TOKENS.radius];
  const chartHeight = paddingY * 2 + trackHeight + markerGap + markerHeight;
  const trackY = paddingY;
  const markerTop = trackY + trackHeight + markerGap;
  const markerHalfWidth = markerHeight / 2;
  const markerCenterX = clamp(
    markerHalfWidth + (Math.max(0, size.width - markerHeight) * clamped) / 100,
    markerHalfWidth,
    Math.max(markerHalfWidth, size.width - markerHalfWidth),
  );
  const markerPath = createTriangleMarkerPath({ centerX: markerCenterX, markerTop, markerHeight });
  const tickX = Math.max(0, Math.min(size.width - centerTickWidth, size.width / 2 - centerTickWidth / 2));

  return (
    <Box
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: clamped, text: `성향 위치 ${clamped}점` }}
      flex={1}
      height={chartHeight}
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
            >
              <LinearGradient
                start={vec(0, trackY)}
                end={vec(size.width, trackY)}
                colors={[edgeColor, centerColor, edgeColor]}
                positions={[0, 0.5, 1]}
              />
            </RoundedRect>
            <Rect x={tickX} y={trackY} width={centerTickWidth} height={trackHeight} color={tickColor} />
            <Path path={markerPath} color={markerColor} />
          </>
        ) : null}
      </Canvas>
    </Box>
  );
}

export function ResponsePatternRows({ scales }: { scales: ReportResponsePatternScale[] }) {
  return (
    <VStack>
      {scales.map((scale) => (
        <HStack key={scale.key} align="center" gap="x3" py="x3">
          <Box flex={0.4} minWidth="x14">
            <Text textStyle="t4Medium" maxLines={2}>
              {scale.left}
            </Text>
          </Box>
          <PatternTrack value={scale.value} />
          <Box flex={0.4} minWidth="x14">
            <Text align="right" textStyle="t4Medium" maxLines={2}>
              {scale.right}
            </Text>
          </Box>
        </HStack>
      ))}
    </VStack>
  );
}
