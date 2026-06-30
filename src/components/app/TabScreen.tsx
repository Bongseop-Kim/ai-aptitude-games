import type { ReactNode } from 'react';

import { Body } from './Body';
import { Screen } from './Screen';

export type TabScreenProps = {
  header?: ReactNode;
  floatingAction?: ReactNode;
  pinnedContent?: ReactNode;
  children: ReactNode;
};

export function TabScreen({ header, floatingAction, pinnedContent, children }: TabScreenProps) {
  return (
    <Screen safeEdges={['top', 'left', 'right']} floatingAction={floatingAction}>
      {header}
      {pinnedContent}
      <Body bottomPad={floatingAction ? 'x23' : 'spacingY.screenBottom'}>{children}</Body>
    </Screen>
  );
}
