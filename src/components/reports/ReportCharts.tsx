import { useEffect, useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { useIsFocused } from 'expo-router';

import { Box } from '../../design-system/components/Box';
import { HStack, VStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';
import { resolveColor } from '../../design-system/components/style-props';
import { useDesignSystemTheme } from '../../design-system/provider';
import type { ReportCompetency } from '../../domain/types';
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

function clamp(value: number, min = 0, max = 100) {
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

function buildPolygonPath(points: Point[]) {
  const builder = Skia.PathBuilder.Make();

  points.forEach((point, index) => {
    if (index === 0) {
      builder.moveTo(point.x, point.y);
      return;
    }

    builder.lineTo(point.x, point.y);
  });

  builder.close();
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

export type CompetencyRadarChartProps = {
  competencies: ReportCompetency[];
};

export function CompetencyRadarChart({ competencies }: CompetencyRadarChartProps) {
  const { theme } = useDesignSystemTheme();
  const { size, onLayout } = useMeasuredChart();
  const progress = useFocusProgress();
  const brandColor = resolveColor(theme, 'bg.brandSolid');
  const brandWeakColor = resolveColor(theme, 'bg.brandWeak');
  const gridColor = resolveColor(theme, 'stroke.neutralWeak');
  const peerColor = resolveColor(theme, 'fg.neutralSubtle');
  const center = { x: size.width / 2, y: size.height / 2 };
  const radius = Math.max(0, Math.min(size.width, size.height) / 2 - 12);
  const angles = competencies.map((_, index) => -Math.PI / 2 + (Math.PI * 2 * index) / competencies.length);
  const gridPaths = [0.25, 0.5, 0.75, 1].map((scale) => buildPolygonPath(
    angles.map((angle) => ({
      x: center.x + Math.cos(angle) * radius * scale,
      y: center.y + Math.sin(angle) * radius * scale,
    })),
  ));
  const peerPath = buildPolygonPath(
    angles.map((angle) => ({
      x: center.x + Math.cos(angle) * radius * 0.7,
      y: center.y + Math.sin(angle) * radius * 0.7,
    })),
  );
  const userPoints = competencies.map((competency, index) => {
    const value = clamp(competency.score) / 100;
    return {
      x: center.x + Math.cos(angles[index]) * radius * value,
      y: center.y + Math.sin(angles[index]) * radius * value,
    };
  });
  const userPath = buildPolygonPath(userPoints);

  return (
    <VStack gap="x2">
      <Box
        accessibilityLabel="5대 역량 레이더 차트"
        accessibilityRole="image"
        height={210}
        onLayout={onLayout}
        width="full"
      >
        <Canvas style={{ width: '100%', height: '100%' }}>
          {size.width > 0 ? (
            <>
              {gridPaths.map((path, index) => (
                <Path
                  key={index}
                  path={path}
                  color={gridColor}
                  style="stroke"
                  strokeWidth={1}
                />
              ))}
              {angles.map((angle, index) => (
                <Path
                  key={`axis-${index}`}
                  path={buildPolylinePath([
                    center,
                    {
                      x: center.x + Math.cos(angle) * radius,
                      y: center.y + Math.sin(angle) * radius,
                    },
                  ])}
                  color={gridColor}
                  style="stroke"
                  strokeWidth={1}
                />
              ))}
              <Path path={peerPath} color={peerColor} style="stroke" strokeWidth={1.5} />
              <Path path={userPath} color={brandWeakColor} />
              <Path
                path={userPath}
                color={brandColor}
                style="stroke"
                strokeWidth={2.5}
                strokeJoin="round"
                start={0}
                end={progress}
              />
              {userPoints.map((point, index) => (
                <Circle
                  key={`${competencies[index].key}-${competencies[index].score}`}
                  cx={point.x}
                  cy={point.y}
                  r={4}
                  color={brandColor}
                />
              ))}
            </>
          ) : null}
        </Canvas>
      </Box>
      <HStack align="center" justify="center" gap="x4">
        <HStack align="center" gap="x1_5">
          <Box bg="bg.brandSolid" borderRadius="full" height="x1" width="x4" />
          <Text color="fg.neutralMuted" textStyle="t2Regular">나</Text>
        </HStack>
        <HStack align="center" gap="x1_5">
          <Box bg="bg.neutralWeak" borderRadius="full" height="x1" width="x4" />
          <Text color="fg.neutralSubtle" textStyle="t2Regular">또래 평균</Text>
        </HStack>
      </HStack>
    </VStack>
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
