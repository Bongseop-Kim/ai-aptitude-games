import { Children, useState, type ReactNode } from 'react';
import { type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';

import { useDesignSystemTheme } from '../provider';
import { Box, type BoxProps } from './Box';
import { resolveLength } from './style-props';

export type GridProps = Omit<BoxProps, 'children'> & {
  children?: ReactNode;
  columns?: number;
  autoFlow?: 'row' | 'column';
  wrap?: BoxProps['flexWrap'];
  style?: StyleProp<ViewStyle>;
};

function normalizeColumns(columns: number | undefined) {
  if (columns === undefined) return 1;
  if (!Number.isFinite(columns)) return 1;
  return Math.max(1, Math.floor(columns));
}

export function Grid({
  children,
  columns = 1,
  autoFlow = 'row',
  flexDirection,
  wrap,
  ...props
}: GridProps) {
  const { theme } = useDesignSystemTheme();
  const [containerWidth, setContainerWidth] = useState(0);
  const isRowFlow = autoFlow === 'row';
  const normalizedColumns = normalizeColumns(columns);
  const columnGap = props.columnGap ?? props.gap ?? 0;
  const resolvedColumnGap = resolveLength(theme, columnGap);
  const numericColumnGap = typeof resolvedColumnGap === 'number' ? resolvedColumnGap : 0;
  const canMeasureItems = isRowFlow && normalizedColumns > 1 && containerWidth > 0;
  const itemWidth = canMeasureItems
    ? Math.max(
        0,
        (containerWidth - numericColumnGap * (normalizedColumns - 1)) / normalizedColumns,
      )
    : undefined;

  function handleLayout(event: LayoutChangeEvent) {
    props.onLayout?.(event);
    setContainerWidth(event.nativeEvent.layout.width);
  }

  return (
    <Box
      flexDirection={flexDirection ?? (isRowFlow ? 'row' : 'column')}
      flexWrap={wrap ?? (isRowFlow ? 'wrap' : undefined)}
      {...props}
      onLayout={handleLayout}
    >
      {Children.map(children, (child) => {
        if (!itemWidth) return child;
        return <Box width={itemWidth}>{child}</Box>;
      })}
    </Box>
  );
}
