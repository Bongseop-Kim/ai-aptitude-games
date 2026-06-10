import type { ReactNode } from 'react';

import { Body } from './Body';
import { Screen } from './Screen';

export type TabScreenProps = {
  header?: ReactNode;
  children: ReactNode;
};

export function TabScreen({ header, children }: TabScreenProps) {
  return (
    <Screen safeEdges={['top', 'left', 'right']}>
      {header}
      <Body bottomPad="spacingY.screenBottom">{children}</Body>
    </Screen>
  );
}
