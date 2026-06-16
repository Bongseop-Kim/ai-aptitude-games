import type { ReactNode } from 'react';

import { Box, type BoxProps } from '../../design-system/components/Box';

export type ReservedSlotProps = BoxProps & {
  children: ReactNode;
  visible: boolean;
};

export function ReservedSlot({ children, visible, style, ...props }: ReservedSlotProps) {
  return (
    <Box
      accessibilityElementsHidden={!visible}
      importantForAccessibility={visible ? 'auto' : 'no-hide-descendants'}
      pointerEvents={visible ? 'auto' : 'none'}
      style={[style, { opacity: visible ? 1 : 0 }]}
      {...props}
    >
      {children}
    </Box>
  );
}
