import { useEffect, useState } from 'react';
import { useIsFocused } from 'expo-router';

import { Box } from '../../design-system/components/Box';
import { resolveColor } from '../../design-system/components/style-props';
import { useDesignSystemTheme } from '../../design-system/provider';
import { Canvas, Circle, Easing, Path, Skia, useSharedValue, withTiming } from '../../lib/native-motion';

export type MockExamTrendLineProps = {
  scores: number[];
};

const HORIZONTAL_INSET = 10;
const VERTICAL_INSET = 6;
const POINT_RADIUS = 3;

function createTrendPoints(scores: number[], size: { width: number; height: number }) {
  if (scores.length === 0 || size.width <= 0 || size.height <= 0) {
    return [];
  }

  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const range = max - min || 1;
  const drawableWidth = Math.max(0, size.width - HORIZONTAL_INSET * 2);
  const drawableHeight = Math.max(0, size.height - VERTICAL_INSET * 2);

  return scores.map((score, index) => {
    const x = scores.length === 1
      ? size.width / 2
      : HORIZONTAL_INSET + (drawableWidth * index) / (scores.length - 1);
    const normalized = max === min ? 0.5 : (score - min) / range;
    const y = VERTICAL_INSET + drawableHeight * (1 - normalized);

    return { x, y };
  });
}

function createTrendPath(points: { x: number; y: number }[]) {
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

export function MockExamTrendLine({ scores }: MockExamTrendLineProps) {
  const { theme } = useDesignSystemTheme();
  const isFocused = useIsFocused();
  const [size, setSize] = useState({ width: 0, height: 0 });
  const brandColor = resolveColor(theme, 'bg.brandSolid');
  const pointFillColor = resolveColor(theme, 'bg.layerDefault');
  const progress = useSharedValue(0);
  const firstScore = scores[0] ?? 0;
  const lastScore = scores[scores.length - 1] ?? firstScore;
  const points = createTrendPoints(scores, size);
  const path = createTrendPath(points);

  useEffect(() => {
    if (!isFocused) return;

    progress.set(withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    }));
  }, [isFocused, progress, scores]);

  return (
    <Box
      accessibilityLabel={`회차별 점수 추이, ${firstScore}점에서 ${lastScore}점`}
      accessibilityRole="image"
      height="x11"
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;

        setSize((current) => (
          current.width === width && current.height === height ? current : { width, height }
        ));
      }}
      width="full"
    >
      <Canvas style={{ width: '100%', height: '100%' }}>
        {points.length > 0 ? (
          <>
            <Path
              path={path}
              style="stroke"
              strokeWidth={2.5}
              strokeCap="round"
              strokeJoin="round"
              color={brandColor}
              start={0}
              end={progress}
            />
            {points.map((point, index) => (
              <Circle
                key={`${index}-${scores[index]}`}
                cx={point.x}
                cy={point.y}
                r={POINT_RADIUS}
                color={pointFillColor}
              />
            ))}
            {points.map((point, index) => (
              <Circle
                key={`stroke-${index}-${scores[index]}`}
                cx={point.x}
                cy={point.y}
                r={POINT_RADIUS}
                color={brandColor}
                style="stroke"
                strokeWidth={1.5}
              />
            ))}
          </>
        ) : null}
      </Canvas>
    </Box>
  );
}
