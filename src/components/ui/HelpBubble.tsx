import { useState } from 'react';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Box, type BoxProps } from '../../design-system/components/Box';
import { Float } from '../../design-system/components/Float';
import { VStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';
import { resolveColor, type TokenColor } from '../../design-system/components/style-props';
import { useDesignSystemTheme } from '../../design-system/provider';
import { Icon } from './Icon';
import { IconButton } from './IconButton';

export type HelpBubblePlacement =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'
  | 'left-top'
  | 'left-center'
  | 'left-bottom'
  | 'right-top'
  | 'right-center'
  | 'right-bottom';

export type HelpBubbleProps = Omit<BoxProps, 'children'> & {
  title: string;
  description?: string;
  placement?: HelpBubblePlacement;
  showArrow?: boolean;
  showCloseButton?: boolean;
  onClose?: () => void;
  closeLabel?: string;
  visible?: boolean;
};

export type HelpBubbleInfo = {
  title: string;
  description: string;
};

export type HelpBubbleInfoTriggerProps = HelpBubbleInfo & {
  label?: string;
};

type ArrowSide = 'top' | 'right' | 'bottom' | 'left';
type ArrowAlignment = 'start' | 'center' | 'end';

const HELP_BUBBLE_CONTENT_GAP = 'x1';
const HELP_BUBBLE_CLOSE_HIT_SLOP = 10;

function arrowSideFromPlacement(placement: HelpBubblePlacement): ArrowSide {
  const [side] = placement.split('-') as [ArrowSide, string];

  if (side === 'top') return 'bottom';
  if (side === 'bottom') return 'top';
  if (side === 'left') return 'right';

  return 'left';
}

function arrowAlignmentFromPlacement(placement: HelpBubblePlacement): ArrowAlignment {
  const [, alignment] = placement.split('-') as [string, string];

  if (alignment === 'center') return 'center';
  if (alignment === 'left' || alignment === 'top') return 'start';

  return 'end';
}

function arrowPath(side: ArrowSide, width: number, height: number, tipRadius: number) {
  const centerX = width / 2;
  const centerY = height / 2;

  if (side === 'top') {
    return `M0 ${height} H${width} L${centerX + tipRadius} ${tipRadius} Q${centerX} 0 ${centerX - tipRadius} ${tipRadius} Z`;
  }

  if (side === 'bottom') {
    return `M0 0 H${width} L${centerX + tipRadius} ${height - tipRadius} Q${centerX} ${height} ${centerX - tipRadius} ${height - tipRadius} Z`;
  }

  if (side === 'left') {
    return `M${width} 0 V${height} L${tipRadius} ${centerY + tipRadius} Q0 ${centerY} ${tipRadius} ${centerY - tipRadius} Z`;
  }

  return `M0 0 V${height} L${width - tipRadius} ${centerY + tipRadius} Q${width} ${centerY} ${width - tipRadius} ${centerY - tipRadius} Z`;
}

function arrowStyle(
  side: ArrowSide,
  alignment: ArrowAlignment,
  width: number,
  height: number,
  padding: number,
): StyleProp<ViewStyle> {
  const style: ViewStyle = { position: 'absolute' };

  if (side === 'top') style.top = -height;
  if (side === 'bottom') style.bottom = -height;
  if (side === 'left') style.left = -width;
  if (side === 'right') style.right = -width;

  if (side === 'top' || side === 'bottom') {
    if (alignment === 'start') style.left = padding;
    if (alignment === 'center') {
      style.left = '50%';
      style.transform = [{ translateX: -(width / 2) }];
    }
    if (alignment === 'end') style.right = padding;

    return style;
  }

  if (alignment === 'start') style.top = padding;
  if (alignment === 'center') {
    style.top = '50%';
    style.transform = [{ translateY: -(height / 2) }];
  }
  if (alignment === 'end') style.bottom = padding;

  return style;
}

type HelpBubbleArrowProps = {
  placement: HelpBubblePlacement;
  color: TokenColor;
};

function HelpBubbleArrow({ placement, color }: HelpBubbleArrowProps) {
  const { theme } = useDesignSystemTheme();
  const side = arrowSideFromPlacement(placement);
  const alignment = arrowAlignmentFromPlacement(placement);
  const isVertical = side === 'top' || side === 'bottom';
  const width = isVertical ? theme.dimension.x.x3 : theme.dimension.x.x2;
  const height = isVertical ? theme.dimension.x.x2 : theme.dimension.x.x3;
  const padding = theme.dimension.x.x3_5;
  const tipRadius = theme.radius.r0_5;

  return (
    <Box style={arrowStyle(side, alignment, width, height, padding)}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Path d={arrowPath(side, width, height, tipRadius)} fill={resolveColor(theme, color) ?? color} />
      </Svg>
    </Box>
  );
}

type HelpBubbleCloseButtonProps = {
  label: string;
  onClose: () => void;
};

function HelpBubbleCloseButton({ label, onClose }: HelpBubbleCloseButtonProps) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      hitSlop={HELP_BUBBLE_CLOSE_HIT_SLOP}
      onPress={onClose}
    >
      <Box alignItems="center" height="x5" justifyContent="center" width="x5">
        <Icon name="X" color="fg.neutralInverted" size="small" />
      </Box>
    </Pressable>
  );
}

export function HelpBubbleInfoTrigger({
  title,
  description,
  label = '측정 방식 보기',
}: HelpBubbleInfoTriggerProps) {
  const [visible, setVisible] = useState(false);
  const buttonLabel = visible ? '측정 방식 닫기' : label;

  function handlePress() {
    setVisible((currentVisible) => !currentVisible);
  }

  function handleClose() {
    setVisible(false);
  }

  return (
    <>
      <Float placement="top-end" offsetX="x2" offsetY="x2" zIndex={3}>
        <IconButton
          name="Info"
          label={buttonLabel}
          color={visible ? 'fg.brand' : 'fg.neutralMuted'}
          onPress={handlePress}
        />
      </Float>
      <Float placement="top-end" offsetX="x2" offsetY="x12" pointerEvents={visible ? 'auto' : 'none'} zIndex={4}>
        <HelpBubble
          title={title}
          description={description}
          placement="bottom-right"
          showCloseButton
          visible={visible}
          width="x60"
          onClose={handleClose}
        />
      </Float>
    </>
  );
}

export function HelpBubble({
  title,
  description,
  placement = 'top-center',
  showArrow = true,
  showCloseButton,
  onClose,
  closeLabel = '도움말 닫기',
  visible = true,
  bg,
  background,
  boxShadow = 'floating',
  overflow,
  position,
  style,
  ...props
}: HelpBubbleProps) {
  const surfaceColor = bg ?? background ?? 'bg.neutralSolid';
  const shouldShowCloseButton = showCloseButton ?? Boolean(onClose);

  return (
    <Box
      accessibilityElementsHidden={!visible}
      bg={surfaceColor}
      borderRadius="r3"
      boxShadow={boxShadow}
      flexDirection="row"
      gap={HELP_BUBBLE_CONTENT_GAP}
      importantForAccessibility={visible ? 'auto' : 'no-hide-descendants'}
      overflow={overflow ?? 'visible'}
      pointerEvents={visible ? 'auto' : 'none'}
      position={position ?? 'relative'}
      px="x3"
      py="x2_5"
      style={[visible ? styles.visible : styles.hidden, style]}
      {...props}
    >
      <VStack flex={1} gap="x0_5">
        <Text color="fg.neutralInverted" textStyle="t3Bold">
          {title}
        </Text>
        {description ? (
          <Text color="fg.neutralInverted" textStyle="t3Regular">
            {description}
          </Text>
        ) : null}
      </VStack>

      {shouldShowCloseButton && onClose ? <HelpBubbleCloseButton label={closeLabel} onClose={onClose} /> : null}
      {showArrow ? <HelpBubbleArrow placement={placement} color={surfaceColor} /> : null}
    </Box>
  );
}

const styles = StyleSheet.create({
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
  },
});
