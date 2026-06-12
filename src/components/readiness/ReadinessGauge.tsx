import { useEffect } from 'react';
import { useIsFocused } from 'expo-router';

import { Box } from '../../design-system/components/Box';
import { Float } from '../../design-system/components/Float';
import { VStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';
import { resolveColor } from '../../design-system/components/style-props';
import { useDesignSystemTheme } from '../../design-system/provider';
import { readinessTempColors } from '../../domain/readiness';
import { Canvas, Easing, Path, Skia, useSharedValue, withTiming } from '../../lib/native-motion';

export type ReadinessGaugeProps = {
  score: number;
  size?: number;
  strokeWidth?: number;
};

function clampScore(score: number) {
  return Math.max(0, Math.min(100, score));
}

export function ReadinessGauge({ score, size = 116, strokeWidth = 12 }: ReadinessGaugeProps) {
  const { theme } = useDesignSystemTheme();
  const isFocused = useIsFocused();
  const colors = readinessTempColors(score);
  const clamped = clampScore(score);
  const isCompact = size < 80;
  const trackColor = resolveColor(theme, colors.bg);
  const progressColor = resolveColor(theme, colors.text);
  const progress = useSharedValue(0);
  const inset = strokeWidth / 2;
  const path = Skia.PathBuilder.Make()
    .addArc(
      { x: inset, y: inset, width: size - strokeWidth, height: size - strokeWidth },
      -90,
      359.99,
    )
    .detach();

  useEffect(() => {
    if (!isFocused) return;

    progress.set(withTiming(clamped / 100, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    }));
  }, [clamped, isFocused, progress]);

  return (
    <Box
      accessibilityLabel={`준비도 ${score}도`}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: clamped }}
      height={size}
      position="relative"
      width={size}
    >
      <Canvas style={{ width: size, height: size }}>
        <Path path={path} style="stroke" strokeWidth={strokeWidth} color={trackColor} />
        <Path
          path={path}
          style="stroke"
          strokeWidth={strokeWidth}
          strokeCap="round"
          color={progressColor}
          start={0}
          end={progress}
        />
      </Canvas>
      <Float placement="middle-center">
        <VStack align="center" gap="x0_5">
          <Text color={colors.text} textStyle={isCompact ? 't5Bold' : 't10Bold'} maxLines={1}>
            {isCompact ? score : `${score}°`}
          </Text>
          <Text color="fg.neutralMuted" textStyle="t2Medium" maxLines={1}>
            {isCompact ? '점' : '준비도'}
          </Text>
        </VStack>
      </Float>
    </Box>
  );
}
