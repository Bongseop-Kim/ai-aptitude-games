import type { ReactNode } from 'react';

import type { TokenLength } from '../../design-system/components/style-props';
import { Body } from './Body';
import { Screen } from './Screen';
import { useTabFloatingActionLayout } from './tabsFloatingActionLayout';

export type TabScreenProps = {
  bottomPad?: TokenLength;
  header?: ReactNode;
  floatingAction?: ReactNode;
  pinnedContent?: ReactNode;
  children: ReactNode;
};

export function TabScreen({
  bottomPad = 'spacingY.screenBottom',
  header,
  floatingAction,
  pinnedContent,
  children,
}: TabScreenProps) {
  const { bottomOffset, contentBottomReserve } = useTabFloatingActionLayout(Boolean(floatingAction));

  return (
    <Screen
      safeEdges={['top', 'left', 'right']}
      floatingAction={floatingAction}
      floatingActionOffsetY={floatingAction ? bottomOffset : undefined}
    >
      {header}
      {pinnedContent}
      <Body bottomPad={bottomPad} bottomReserve={contentBottomReserve}>{children}</Body>
    </Screen>
  );
}
