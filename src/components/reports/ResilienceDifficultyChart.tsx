import { useEffect, useState } from 'react';
import { useIsFocused } from 'expo-router';

import { Box } from '../../design-system/components/Box';
import { HStack, VStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';
import { resolveColor } from '../../design-system/components/style-props';
import { useDesignSystemTheme } from '../../design-system/provider';
import { Canvas, Circle, Easing, Path, Skia, useSharedValue, withTiming } from '../../lib/native-motion';
import { Card } from '../ui/Card';
import { HelpBubbleInfoTrigger, type HelpBubbleInfo } from '../ui/HelpBubble';

export type ResilienceChartPoint = {
  key: string;
  actual: number;
  difficulty: number;
};

const POINT_RADIUS = 3;
const LINE_WIDTH = 2.5;

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function barHeight(value: number) {
  return `${Math.max(3, clampScore(value))}%`;
}

function buildDifficultyPath(points: { x: number; y: number }[]) {
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

export function ResilienceDifficultyChart({
  points,
  help,
}: {
  points: ResilienceChartPoint[];
  help?: HelpBubbleInfo;
}) {
  const { theme } = useDesignSystemTheme();
  const isFocused = useIsFocused();
  const [size, setSize] = useState({ width: 0, height: 0 });
  const progress = useSharedValue(0);

  const lineColor = resolveColor(theme, 'fg.neutral');
  const pointFill = resolveColor(theme, 'bg.layerFloating');

  const linePoints = points.map((point, index) => ({
    key: point.key,
    x: points.length === 1 ? size.width / 2 : (index + 0.5) * (size.width / points.length),
    y: size.height * (1 - clampScore(point.difficulty) / 100),
  }));
  const difficultyPath = buildDifficultyPath(linePoints);

  useEffect(() => {
    if (!isFocused) return;

    progress.set(0);
    progress.set(withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) }));
  }, [isFocused, progress, points.length]);

  return (
    <Card p="spacingX.globalGutter" position="relative">
      {help ? <HelpBubbleInfoTrigger title={help.title} description={help.description} /> : null}
      <VStack gap="x2" pt={help ? 'x10' : undefined}>
        <Box
          height="x23"
          position="relative"
          width="full"
          onLayout={(event) => {
            const { width, height } = event.nativeEvent.layout;
            setSize((current) =>
              current.width === width && current.height === height ? current : { width, height },
            );
          }}
        >
          <HStack align="flexEnd" height="full">
            {points.map((point) => (
              <VStack key={point.key} align="center" flex={1} height="full" justify="flexEnd">
                <Box bg="bg.brandSolid" borderRadius="r1" height={barHeight(point.actual)} width="x3" />
              </VStack>
            ))}
          </HStack>
          {size.width > 0 ? (
            <Box bottom="x0" left="x0" position="absolute" right="x0" top="x0">
              <Canvas style={{ width: '100%', height: '100%' }}>
                <Path
                  color={lineColor}
                  end={progress}
                  path={difficultyPath}
                  start={0}
                  strokeCap="round"
                  strokeJoin="round"
                  strokeWidth={LINE_WIDTH}
                  style="stroke"
                />
                {linePoints.map((point) => (
                  <Circle key={`${point.key}-fill`} color={pointFill} cx={point.x} cy={point.y} r={POINT_RADIUS} />
                ))}
                {linePoints.map((point) => (
                  <Circle
                    key={`${point.key}-stroke`}
                    color={lineColor}
                    cx={point.x}
                    cy={point.y}
                    r={POINT_RADIUS}
                    strokeWidth={1.5}
                    style="stroke"
                  />
                ))}
              </Canvas>
            </Box>
          ) : null}
        </Box>
        <HStack>
          {points.map((point, index) => (
            <Box key={point.key} flex={1}>
              <Text align="center" color="fg.neutralSubtle" maxLines={1} textStyle="t1Regular">
                {index + 1}
              </Text>
            </Box>
          ))}
        </HStack>
        <HStack align="center" columnGap="x2" justify="flexEnd" rowGap="x1" wrap="wrap">
          <HStack align="center" gap="x1">
            <Box bg="bg.brandSolid" borderRadius="r1" height="x4" width="x3" />
            <Text color="fg.neutralMuted" textStyle="t1Regular">
              실제 점수
            </Text>
          </HStack>
          <HStack align="center" gap="x1">
            <Box bg="fg.neutral" borderRadius="full" height="x0_5" width="x6" />
            <Text color="fg.neutralMuted" textStyle="t1Regular">
              출제 난이도
            </Text>
          </HStack>
        </HStack>
      </VStack>
    </Card>
  );
}
