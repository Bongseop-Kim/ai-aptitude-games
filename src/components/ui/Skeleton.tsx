import { useEffect, useState } from 'react';
import { useIsFocused } from 'expo-router';

import { Box, type BoxProps } from '../../design-system/components/Box';
import {
  resolveColor,
  resolveRadius,
} from '../../design-system/components/style-props';
import { useDesignSystemTheme } from '../../design-system/provider';
import {
  Canvas,
  cancelAnimation,
  Easing,
  Group,
  LinearGradient,
  Rect,
  RoundedRect,
  Skia,
  useDerivedValue,
  useSharedValue,
  vec,
  withRepeat,
  withTiming,
} from '../../lib/native-motion';

const SHIMMER_DURATION_MS = 1200;
const HIGHLIGHT_WIDTH_RATIO = 0.45;
const HIGHLIGHT_MIN_HEIGHT_RATIO = 2;

export type SkeletonProps = Pick<
  BoxProps,
  | 'alignSelf'
  | 'flex'
  | 'height'
  | 'maxWidth'
  | 'minWidth'
  | 'width'
> & {
  borderRadius?: NonNullable<BoxProps['borderRadius']>;
};

export function Skeleton({
  borderRadius = 'r2',
  height,
  width = 'full',
  ...props
}: SkeletonProps) {
  const { theme } = useDesignSystemTheme();
  const isFocused = useIsFocused();
  const [size, setSize] = useState({ width: 0, height: 0 });
  const progress = useSharedValue(0);
  const trackColor = resolveColor(theme, 'bg.neutralWeak') ?? 'transparent';
  const highlightColor = resolveColor(theme, 'bg.neutralSubtle') ?? 'transparent';
  const resolvedRadius = resolveRadius(theme, borderRadius);
  const cornerRadius = typeof resolvedRadius === 'number'
    ? Math.min(resolvedRadius, size.width / 2, size.height / 2)
    : size.height / 2;
  const shimmerWidth = Math.max(
    size.width * HIGHLIGHT_WIDTH_RATIO,
    size.height * HIGHLIGHT_MIN_HEIGHT_RATIO,
  );
  const shimmerStart = -shimmerWidth;
  const shimmerDistance = size.width + shimmerWidth * 2;
  const shimmerX = useDerivedValue(
    () => shimmerStart + progress.value * shimmerDistance,
    [shimmerDistance, shimmerStart],
  );
  const clip = Skia.RRectXY(
    Skia.XYWHRect(0, 0, size.width, size.height),
    cornerRadius,
    cornerRadius,
  );

  useEffect(() => {
    if (!isFocused) {
      cancelAnimation(progress);
      progress.set(0);
      return;
    }

    progress.set(0);
    progress.set(withRepeat(withTiming(1, {
      duration: SHIMMER_DURATION_MS,
      easing: Easing.linear,
    }), -1));

    return () => {
      cancelAnimation(progress);
    };
  }, [isFocused, progress]);

  return (
    <Box
      accessibilityElementsHidden
      borderRadius={borderRadius}
      height={height}
      importantForAccessibility="no-hide-descendants"
      onLayout={(event) => {
        const { width: nextWidth, height: nextHeight } = event.nativeEvent.layout;

        setSize((current) => (
          current.width === nextWidth && current.height === nextHeight
            ? current
            : { width: nextWidth, height: nextHeight }
        ));
      }}
      overflow="hidden"
      width={width}
      {...props}
    >
      <Canvas style={{ width: '100%', height: '100%' }}>
        {size.width > 0 && size.height > 0 ? (
          <>
            <RoundedRect
              x={0}
              y={0}
              width={size.width}
              height={size.height}
              r={cornerRadius}
              color={trackColor}
            />
            <Group clip={clip}>
              <Rect x={shimmerX} y={0} width={shimmerWidth} height={size.height}>
                <LinearGradient
                  start={vec(0, 0)}
                  end={vec(shimmerWidth, 0)}
                  colors={['transparent', highlightColor, 'transparent']}
                />
              </Rect>
            </Group>
          </>
        ) : null}
      </Canvas>
    </Box>
  );
}
