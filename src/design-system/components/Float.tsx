import { useState, type ReactNode } from 'react';
import { type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';

import { useDesignSystemTheme } from '../provider';
import { resolveLength, type DimensionToken } from './style-props';
import { Box } from './Box';

export type FloatPlacement =
  | 'top-start'
  | 'top-center'
  | 'top-end'
  | 'middle-start'
  | 'middle-center'
  | 'middle-end'
  | 'bottom-start'
  | 'bottom-center'
  | 'bottom-end';

export type FloatProps = {
  children?: ReactNode;
  placement: FloatPlacement;
  offsetX?: 0 | number | DimensionToken;
  offsetY?: 0 | number | DimensionToken;
  zIndex?: number;
  style?: StyleProp<ViewStyle>;
};

type FloatSize = {
  width: number;
  height: number;
};

function placementStyle(
  placement: FloatPlacement,
  offsetX: number,
  offsetY: number,
  size: FloatSize,
) {
  const [vertical, horizontal] = placement.split('-') as [
    'top' | 'middle' | 'bottom',
    'start' | 'center' | 'end',
  ];
  const style: ViewStyle = { position: 'absolute' };
  const transform: ({ translateX: number } | { translateY: number })[] = [];

  if (vertical === 'top') style.top = offsetY;
  if (vertical === 'middle') {
    style.top = '50%';
    transform.push({ translateY: -(size.height / 2) + offsetY });
  }
  if (vertical === 'bottom') style.bottom = offsetY;

  if (horizontal === 'start') style.left = offsetX;
  if (horizontal === 'center') {
    style.left = '50%';
    transform.push({ translateX: -(size.width / 2) + offsetX });
  }
  if (horizontal === 'end') style.right = offsetX;

  if (transform.length > 0) style.transform = transform;

  return style;
}

export function Float({
  children,
  placement,
  offsetX = 0,
  offsetY = 0,
  zIndex,
  style,
}: FloatProps) {
  const { theme } = useDesignSystemTheme();
  const [size, setSize] = useState<FloatSize>({ width: 0, height: 0 });
  const [hasMeasured, setHasMeasured] = useState(false);
  const resolvedX = resolveLength(theme, offsetX);
  const resolvedY = resolveLength(theme, offsetY);
  const numericX = typeof resolvedX === 'number' ? resolvedX : 0;
  const numericY = typeof resolvedY === 'number' ? resolvedY : 0;

  function handleLayout(event: LayoutChangeEvent) {
    const { height, width } = event.nativeEvent.layout;
    setHasMeasured(true);
    setSize({ width, height });
  }

  return (
    <Box
      onLayout={handleLayout}
      style={[
        placementStyle(placement, numericX, numericY, size),
        { opacity: hasMeasured ? 1 : 0, zIndex },
        style,
      ]}
    >
      {children}
    </Box>
  );
}
