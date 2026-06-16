import { useEffect } from 'react';
import { useIsFocused } from 'expo-router';

import { Box } from '../../design-system/components/Box';
import { Float } from '../../design-system/components/Float';
import { VStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';
import { resolveColor, resolveLength, type TokenLength } from '../../design-system/components/style-props';
import { useDesignSystemTheme } from '../../design-system/provider';
import { readinessTempColors } from '../../domain/readiness';
import { Canvas, Easing, Path, Skia, useSharedValue, withTiming } from '../../lib/native-motion';

export type ReadinessGaugeProps = {
  score: number;
  size?: TokenLength;
  strokeWidth?: number;
  unit?: 'degree' | 'point' | 'none';
};

function clampScore(score: number) {
  return Math.max(0, Math.min(100, score));
}

const defaultGaugeSize: TokenLength = 'x29';

export function ReadinessGauge({ score, size = defaultGaugeSize, strokeWidth, unit = 'degree' }: ReadinessGaugeProps) {
  const { theme } = useDesignSystemTheme();
  const resolvedStrokeWidth = strokeWidth ?? theme.dimension.x.x3;
  const resolvedSize = resolveLength(theme, size);
  const numericSize = typeof resolvedSize === 'number' ? resolvedSize : theme.dimension.x.x29;
  const isFocused = useIsFocused();
  const colors = readinessTempColors(score);
  const clamped = clampScore(score);
  const isCompact = numericSize < 80;
  const trackColor = resolveColor(theme, colors.bg);
  const progressColor = resolveColor(theme, colors.text);
  const progress = useSharedValue(0);
  const inset = resolvedStrokeWidth / 2;
  const path = Skia.PathBuilder.Make()
    .addArc(
      { x: inset, y: inset, width: numericSize - resolvedStrokeWidth, height: numericSize - resolvedStrokeWidth },
      -90,
      359.99,
    )
    .detach();
  const showLabel = unit !== 'none';
  const displayScore = unit === 'degree' && !isCompact ? `${score}°` : score;
  const label = unit === 'degree' && !isCompact ? '준비도' : '점';
  const accessibilityUnit = unit === 'degree' ? '도' : '점';

  useEffect(() => {
    if (!isFocused) return;

    progress.set(withTiming(clamped / 100, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    }));
  }, [clamped, isFocused, progress]);

  return (
    <Box
      accessibilityLabel={`준비도 ${score}${accessibilityUnit}`}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: clamped }}
      height={numericSize}
      position="relative"
      width={numericSize}
    >
      <Canvas style={{ width: numericSize, height: numericSize }}>
        <Path path={path} style="stroke" strokeWidth={resolvedStrokeWidth} color={trackColor} />
        <Path
          path={path}
          style="stroke"
          strokeWidth={resolvedStrokeWidth}
          strokeCap="round"
          color={progressColor}
          start={0}
          end={progress}
        />
      </Canvas>
      <Float placement="middle-center">
        <VStack align="center" gap="x0_5">
          <Text color={colors.text} textStyle={isCompact ? 't5Bold' : 't10Bold'} maxLines={1}>
            {displayScore}
          </Text>
          {showLabel ? (
            <Text color="fg.neutralMuted" textStyle="t2Medium" maxLines={1}>
              {label}
            </Text>
          ) : null}
        </VStack>
      </Float>
    </Box>
  );
}
