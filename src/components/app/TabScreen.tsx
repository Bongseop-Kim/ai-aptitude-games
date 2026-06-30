import type { ReactNode } from 'react';

import type { TokenLength } from '../../design-system/components/style-props';
import { Body } from './Body';
import { Screen } from './Screen';

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
  return (
    <Screen safeEdges={['top', 'left', 'right']} floatingAction={floatingAction}>
      {header}
      {pinnedContent}
      <Body bottomPad={bottomPad}>{children}</Body>
    </Screen>
  );
}
