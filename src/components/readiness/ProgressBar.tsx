import { useEffect, useState } from 'react';
import { useIsFocused } from 'expo-router';

import { Box } from '../../design-system/components/Box';
import { resolveColor } from '../../design-system/components/style-props';
import { useDesignSystemTheme } from '../../design-system/provider';
import type { Tone } from '../../domain/types';
import { toneColors } from '../../domain/tone';
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

export type ProgressBarProps = {
  value: number;
  tone?: Tone;
  layout?: 'block' | 'inline';
};

function clampScore(score: number) {
  return Math.max(0, Math.min(100, score));
}

export function ProgressBar({ value, tone = 'brand', layout = 'block' }: ProgressBarProps) {
  const { theme } = useDesignSystemTheme();
  const isFocused = useIsFocused();
  const [size, setSize] = useState({ width: 0, height: 0 });
  const clamped = clampScore(value);
  const isInline = layout === 'inline';
  const trackColor = resolveColor(theme, 'bg.neutralWeak');
  const progressColor = resolveColor(theme, toneColors[tone].fg);
  const progress = useSharedValue(0);
  const fillWidth = useDerivedValue(() => progress.value * size.width, [size.width]);
  const clip = Skia.RRectXY(Skia.XYWHRect(0, 0, size.width, size.height), size.height / 2, size.height / 2);

  useEffect(() => {
    if (!isFocused) return;

    progress.set(withTiming(clamped / 100, {
      duration: 400,
      easing: Easing.out(Easing.cubic),
    }));
  }, [clamped, isFocused, progress]);

  return (
    <Box
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: clamped }}
      flex={isInline ? 1 : undefined}
      height="x1_5"
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;

        setSize((current) => (
          current.width === width && current.height === height ? current : { width, height }
        ));
      }}
      width={isInline ? undefined : 'full'}
    >
      <Canvas style={{ width: '100%', height: '100%' }}>
        {size.width > 0 ? (
          <>
            <RoundedRect
              x={0}
              y={0}
              width={size.width}
              height={size.height}
              r={size.height / 2}
              color={trackColor}
            />
            <Group clip={clip}>
              <Rect x={0} y={0} width={fillWidth} height={size.height} color={progressColor} />
            </Group>
          </>
        ) : null}
      </Canvas>
    </Box>
  );
}
