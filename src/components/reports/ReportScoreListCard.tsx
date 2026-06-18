import type { ReactNode } from 'react';

import { VStack } from '../../design-system/components/Stack';
import { Card } from '../ui/Card';
import { List } from '../ui/List';
import { ReportScoreMarkerLegend } from './ReportScoreMarkerLegend';

export function ReportScoreListCard({
  children,
  markerLegendLabel = null,
}: {
  children: ReactNode;
  markerLegendLabel?: string | null;
}) {
  return (
    <Card px="spacingX.globalGutter" py="x2">
      <VStack gap="x2">
        {markerLegendLabel ? <ReportScoreMarkerLegend label={markerLegendLabel} /> : null}
        <List.Root>{children}</List.Root>
      </VStack>
    </Card>
  );
}
