import { Fragment, useEffect, useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { useIsFocused } from 'expo-router';

import { Box } from '../../design-system/components/Box';
import { HStack, VStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';
import { resolveColor } from '../../design-system/components/style-props';
import { useDesignSystemTheme } from '../../design-system/provider';
import type { ReportResponsePatternScale } from '../../domain/report';
import { Card } from '../ui/Card';
import { HelpBubbleInfoTrigger, type HelpBubbleInfo } from '../ui/HelpBubble';
import { List } from '../ui/List';
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
  withTiming,
  vec,
} from '../../lib/native-motion';

type ChartSize = { width: number; height: number };
type RadarScale = { x: number; y: number };

const EMPTY_SIZE = { width: 0, height: 0 };
const RADAR_FOUR_POINT_RATIO = 1.06;
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
const RADAR_GRID_STEPS = [20, 40, 60, 80, 100] as const;
const RADAR_AXIS_LABEL_WIDTH = 72;
const RADAR_AXIS_LABEL_HEIGHT = 34;
const RADAR_HORIZONTAL_INSET = RADAR_AXIS_LABEL_WIDTH / 2 + 18;
const RADAR_VERTICAL_INSET = RADAR_AXIS_LABEL_HEIGHT / 2 + 22;
const RADAR_LABEL_GAP = 22;
const RADAR_VALUE_POINT_RADIUS = 3.5;
const RADAR_COMPARISON_POINT_RADIUS = 2.5;
const RADAR_STROKE_WIDTH = 2;
const RADAR_LINE_PHASE_END = 0.72;

function clamp(value: number, min = 0, max = 100) {
  'worklet';
  return Math.max(min, Math.min(max, value));
}

function phaseProgress(value: number, start: number, end: number) {
  'worklet';
  return clamp((value - start) / (end - start), 0, 1);
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

function useFocusProgress(duration = 600, resetKey: string | number = '') {
  const isFocused = useIsFocused();
  const progress = useSharedValue(0);

  useEffect(() => {
    if (!isFocused) return;

    progress.set(0);
    progress.set(withTiming(1, {
      duration,
      easing: Easing.out(Easing.cubic),
    }));
  }, [duration, isFocused, progress, resetKey]);

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

function resolvePatternMarkerCenterX({
  width,
  markerHeight,
  value,
}: {
  width: number;
  markerHeight: number;
  value: number;
}) {
  const markerHalfWidth = markerHeight / 2;

  return clamp(
    markerHalfWidth + (Math.max(0, width - markerHeight) * value) / 100,
    markerHalfWidth,
    Math.max(markerHalfWidth, width - markerHalfWidth),
  );
}

type RadarCoordinate = {
  angle: number;
  x: number;
  y: number;
};

export type RadarChartPoint = {
  label: string;
  value: number | null;
  comparisonValue?: number | null;
};

type RadarChartProps = {
  points: RadarChartPoint[];
  help?: HelpBubbleInfo;
  valueLabel?: string;
  comparisonLabel?: string;
  unavailableLabel?: string;
};

function resolveRadarCenter(size: ChartSize) {
  return {
    x: size.width / 2,
    y: size.height / 2,
  };
}

function resolveRadarScale(size: ChartSize, total: number): RadarScale {
  if (size.width <= 0 || size.height <= 0) {
    return { x: 0, y: 0 };
  }

  const availableWidth = Math.max(0, size.width - RADAR_HORIZONTAL_INSET * 2);
  const availableHeight = Math.max(0, size.height - RADAR_VERTICAL_INSET * 2);

  if (total === 4) {
    const xRadius = Math.min(availableWidth / 2, (availableHeight * RADAR_FOUR_POINT_RATIO) / 2);

    return { x: xRadius, y: xRadius / RADAR_FOUR_POINT_RATIO };
  }

  const radius = Math.min(availableWidth, availableHeight) / 2;

  return { x: radius, y: radius };
}

function resolveRadarLabelScale(size: ChartSize, center: { x: number; y: number }, scale: RadarScale) {
  return {
    x: Math.min(
      scale.x + RADAR_LABEL_GAP,
      Math.max(0, center.x - RADAR_AXIS_LABEL_WIDTH / 2),
      Math.max(0, size.width - center.x - RADAR_AXIS_LABEL_WIDTH / 2),
    ),
    y: Math.min(
      scale.y + RADAR_LABEL_GAP,
      Math.max(0, center.y - RADAR_AXIS_LABEL_HEIGHT / 2),
      Math.max(0, size.height - center.y - RADAR_AXIS_LABEL_HEIGHT / 2),
    ),
  };
}

function resolveRadarAngle(index: number, total: number) {
  return -Math.PI / 2 + (index * Math.PI * 2) / total;
}

function resolveRadarCoordinate({
  angle,
  center,
  scale,
  value,
}: {
  angle: number;
  center: { x: number; y: number };
  scale: RadarScale;
  value: number;
}) {
  const distanceRatio = clamp(value) / 100;

  return {
    angle,
    x: center.x + Math.cos(angle) * scale.x * distanceRatio,
    y: center.y + Math.sin(angle) * scale.y * distanceRatio,
  };
}

function buildRadarPath(points: RadarCoordinate[]) {
  const path = Skia.Path.Make();

  points.forEach((point, index) => {
    if (index === 0) {
      path.moveTo(point.x, point.y);
      return;
    }

    path.lineTo(point.x, point.y);
  });
  path.close();

  return path;
}

function buildRadarLinePath(start: { x: number; y: number }, end: RadarCoordinate) {
  const path = Skia.Path.Make();

  path.moveTo(start.x, start.y);
  path.lineTo(end.x, end.y);

  return path;
}

function formatRadarValue(point: RadarChartPoint, unavailableLabel: string) {
  if (point.value == null) {
    return `${point.label} ${unavailableLabel}`;
  }

  return `${point.label} ${Math.round(clamp(point.value))}점`;
}

function RadarAxisLabel({ label, x, y }: { label: string; x: number; y: number }) {
  return (
    <Box
      position="absolute"
      style={{
        left: x - RADAR_AXIS_LABEL_WIDTH / 2,
        top: y - RADAR_AXIS_LABEL_HEIGHT / 2,
        width: RADAR_AXIS_LABEL_WIDTH,
      }}
    >
      <Text align="center" color="fg.neutralMuted" maxLines={2} textStyle="t1Medium">
        {label}
      </Text>
    </Box>
  );
}

export function RadarChart({
  points,
  help,
  valueLabel = '내 점수',
  comparisonLabel,
  unavailableLabel = '분석 준비 중',
}: RadarChartProps) {
  const { theme } = useDesignSystemTheme();
  const { size, onLayout } = useMeasuredChart();
  const animationKey = points
    .map((point) => `${point.label}:${point.value ?? 'none'}:${point.comparisonValue ?? 'none'}`)
    .join('|');
  const progress = useFocusProgress(700, animationKey);
  const center = resolveRadarCenter(size);
  const canRenderRadar = points.length >= 3;
  const radarScale = resolveRadarScale(size, points.length);
  const labelScale = resolveRadarLabelScale(size, center, radarScale);
  const hasComparison = canRenderRadar && points.every((point) => point.comparisonValue != null);
  const gridColor = resolveColor(theme, 'stroke.neutralWeak');
  const axisColor = resolveColor(theme, 'stroke.neutralSubtle');
  const valueColor = resolveColor(theme, 'bg.brandSolid');
  const comparisonColor = resolveColor(theme, 'mannerTemp.l5Text');
  const pointFill = resolveColor(theme, 'bg.layerFloating');
  const lineProgress = useDerivedValue(
    () => phaseProgress(progress.get(), 0, RADAR_LINE_PHASE_END),
    [],
  );
  const fillProgress = useDerivedValue(
    () => phaseProgress(progress.get(), RADAR_LINE_PHASE_END, 1),
    [],
  );
  const comparisonFillOpacity = useDerivedValue(() => fillProgress.get() * 0.18, []);
  const valueFillOpacity = useDerivedValue(() => fillProgress.get() * 0.22, []);
  const axisCoordinates = canRenderRadar
    ? points.map((_, index) =>
        resolveRadarCoordinate({
          angle: resolveRadarAngle(index, points.length),
          center,
          scale: radarScale,
          value: 100,
        }),
      )
    : [];
  const valueCoordinates = canRenderRadar
    ? points.map((point, index) =>
        resolveRadarCoordinate({
          angle: resolveRadarAngle(index, points.length),
          center,
          scale: radarScale,
          value: point.value ?? 0,
        }),
      )
    : [];
  const comparisonCoordinates = hasComparison
    ? points.map((point, index) =>
        resolveRadarCoordinate({
          angle: resolveRadarAngle(index, points.length),
          center,
          scale: radarScale,
          value: point.comparisonValue ?? 0,
        }),
      )
    : [];
  const labelCoordinates = canRenderRadar
    ? points.map((point, index) => ({
        ...resolveRadarCoordinate({
          angle: resolveRadarAngle(index, points.length),
          center,
          scale: labelScale,
          value: 100,
        }),
        label: point.label,
      }))
    : [];
  const gridPaths = canRenderRadar
    ? RADAR_GRID_STEPS.map((step) =>
        buildRadarPath(
          points.map((_, index) =>
            resolveRadarCoordinate({
              angle: resolveRadarAngle(index, points.length),
              center,
              scale: radarScale,
              value: step,
            }),
          ),
        ),
      )
    : [];
  const axisPaths = canRenderRadar
    ? axisCoordinates.map((point) => buildRadarLinePath(center, point))
    : [];
  const valuePath = buildRadarPath(valueCoordinates);
  const comparisonPath = buildRadarPath(comparisonCoordinates);
  const accessibilityLabel = `${valueLabel}: ${points
    .map((point) => formatRadarValue(point, unavailableLabel))
    .join(', ')}`;

  if (!canRenderRadar) {
    return (
      <Card minHeight="x72" p="spacingX.globalGutter">
        <VStack align="center" justify="center" minHeight="x72">
          <Text align="center" color="fg.neutralMuted" textStyle="t3Regular">
            차트를 표시할 항목이 더 필요해요.
          </Text>
        </VStack>
      </Card>
    );
  }

  return (
    <Card p="spacingX.globalGutter" position="relative">
      {help ? <HelpBubbleInfoTrigger title={help.title} description={help.description} /> : null}
      <VStack gap="x3" pt={help ? 'x10' : undefined}>
        <Box
          accessible
          accessibilityLabel={accessibilityLabel}
          accessibilityRole="image"
          height="x72"
          onLayout={onLayout}
          position="relative"
          width="full"
        >
          {size.width > 0 && radarScale.x > 0 && radarScale.y > 0 ? (
            <>
              <Canvas style={{ width: '100%', height: '100%' }}>
                {gridPaths.map((path, index) => (
                  <Path
                    key={`grid-${RADAR_GRID_STEPS[index]}`}
                    color={gridColor}
                    path={path}
                    strokeWidth={index === RADAR_GRID_STEPS.length - 1 ? 1.2 : 0.8}
                    style="stroke"
                  />
                ))}
                {axisPaths.map((path, index) => (
                  <Path
                    key={`axis-${points[index].label}`}
                    color={axisColor}
                    path={path}
                    strokeWidth={0.8}
                    style="stroke"
                  />
                ))}
                {hasComparison ? (
                  <Group>
                    <Path
                      color={comparisonColor}
                      end={lineProgress}
                      path={comparisonPath}
                      strokeCap="round"
                      strokeJoin="round"
                      strokeWidth={RADAR_STROKE_WIDTH}
                      style="stroke"
                    />
                    <Path color={comparisonColor} opacity={comparisonFillOpacity} path={comparisonPath} />
                    {comparisonCoordinates.map((point) => (
                      <Circle
                        key={`comparison-${point.angle}`}
                        color={comparisonColor}
                        cx={point.x}
                        cy={point.y}
                        opacity={fillProgress}
                        r={RADAR_COMPARISON_POINT_RADIUS}
                      />
                    ))}
                  </Group>
                ) : null}
                <Group>
                  <Path
                    color={valueColor}
                    end={lineProgress}
                    path={valuePath}
                    strokeCap="round"
                    strokeJoin="round"
                    strokeWidth={RADAR_STROKE_WIDTH}
                    style="stroke"
                  />
                  <Path color={valueColor} opacity={valueFillOpacity} path={valuePath} />
                  {valueCoordinates.map((point) => (
                    <Circle
                      key={`value-fill-${point.angle}`}
                      color={pointFill}
                      cx={point.x}
                      cy={point.y}
                      opacity={fillProgress}
                      r={RADAR_VALUE_POINT_RADIUS}
                    />
                  ))}
                  {valueCoordinates.map((point) => (
                    <Circle
                      key={`value-stroke-${point.angle}`}
                      color={valueColor}
                      cx={point.x}
                      cy={point.y}
                      opacity={fillProgress}
                      r={RADAR_VALUE_POINT_RADIUS}
                      strokeWidth={1.8}
                      style="stroke"
                    />
                  ))}
                </Group>
              </Canvas>
              {labelCoordinates.map((point) => (
                <RadarAxisLabel key={point.label} label={point.label} x={point.x} y={point.y} />
              ))}
              <Box
                position="absolute"
                style={{
                  left: center.x - 20,
                  top: center.y - radarScale.y * 0.5 - 11,
                  width: 40,
                }}
              >
                <Text align="center" color="fg.neutralSubtle" textStyle="t1Regular">
                  50
                </Text>
              </Box>
              <Box
                position="absolute"
                style={{
                  left: center.x - 20,
                  top: center.y - radarScale.y - 16,
                  width: 40,
                }}
              >
                <Text align="center" color="fg.neutralSubtle" textStyle="t1Regular">
                  100
                </Text>
              </Box>
            </>
          ) : null}
        </Box>
        {hasComparison && comparisonLabel ? (
          <HStack align="center" columnGap="x2" justify="flexEnd" rowGap="x1" wrap="wrap">
            <HStack align="center" gap="x1">
              <Box bg="bg.brandSolid" borderRadius="r1" height="x2" width="x3" />
              <Text color="fg.neutralMuted" textStyle="t1Regular">
                {valueLabel}
              </Text>
            </HStack>
            <HStack align="center" gap="x1">
              <Box bg="mannerTemp.l5Text" borderRadius="r1" height="x2" width="x3" />
              <Text color="fg.neutralMuted" textStyle="t1Regular">
                {comparisonLabel}
              </Text>
            </HStack>
          </HStack>
        ) : null}
      </VStack>
    </Card>
  );
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
    () => (size.width * clamped) / 100 * progress.get(),
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
  const progress = useFocusProgress(500);
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
  const markerSpace = markerGap + markerHeight;
  const chartHeight = paddingY * 2 + markerSpace * 2 + trackHeight;
  const trackY = paddingY + markerSpace;
  const markerTop = trackY + trackHeight + markerGap;
  const markerStartX = resolvePatternMarkerCenterX({ width: size.width, markerHeight, value: 50 });
  const markerEndX = resolvePatternMarkerCenterX({ width: size.width, markerHeight, value: clamped });
  const markerTranslate = useDerivedValue(
    () => [{ translateX: (markerEndX - markerStartX) * progress.get() }],
    [markerEndX, markerStartX],
  );
  const markerPath = createTriangleMarkerPath({ centerX: markerStartX, markerTop, markerHeight });
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
            <Group transform={markerTranslate}>
              <Path path={markerPath} color={markerColor} />
            </Group>
          </>
        ) : null}
      </Canvas>
    </Box>
  );
}

export function ResponsePatternRows({ scales }: { scales: ReportResponsePatternScale[] }) {
  return (
    <List.Root>
      {scales.map((scale, index) => (
        <Fragment key={scale.key}>
          {index > 0 ? <List.Divider /> : null}
          <List.Item>
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
          </List.Item>
        </Fragment>
      ))}
    </List.Root>
  );
}
