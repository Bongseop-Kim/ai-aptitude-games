import type { ReactNode } from 'react';

import { Box } from '../../design-system/components/Box';
import { HStack, VStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';
import type { TokenColor } from '../../design-system/components/style-props';
import { BulletBar } from './ReportCharts';

export type ReportScoreRowProps = {
  children?: ReactNode;
  title: string;
  description?: string | null;
  value: number | null;
  valueLabel?: string;
  markerValue?: number | null;
  supportingLabel?: string | null;
  supportingColor?: TokenColor;
  reserveSupportingLabel?: boolean;
  unavailableLabel?: string;
};

export function ReportScoreRow({
  children,
  title,
  description,
  value,
  valueLabel,
  markerValue = null,
  supportingLabel = null,
  supportingColor = 'fg.neutralMuted',
  reserveSupportingLabel = false,
  unavailableLabel = '분석 준비 중',
}: ReportScoreRowProps) {
  const hasValue = value != null;
  const shouldRenderSupportingLabel = supportingLabel != null || reserveSupportingLabel;

  return (
    <VStack gap="x1_5" minHeight="x16" py="x3" width="full">
      <HStack align="center" gap="x3">
        <VStack flex={0.55} gap="x0_5" minWidth="x16">
          <Text textStyle="t4Bold" maxLines={2}>
            {title}
          </Text>
          {description ? (
            <Text color="fg.neutralSubtle" textStyle="t2Regular" lineHeight="t3" maxLines={2}>
              {description}
            </Text>
          ) : null}
        </VStack>
        {hasValue ? (
          <>
            <BulletBar value={value} peerMedian={markerValue} />
            <Box width="x8">
              <Text align="right" textStyle="t5Bold">
                {valueLabel ?? value}
              </Text>
            </Box>
            {shouldRenderSupportingLabel ? (
              <Box minWidth="x10" style={{ opacity: supportingLabel == null ? 0 : 1 }}>
                <Text color={supportingColor} textStyle="t2Bold" maxLines={1}>
                  {supportingLabel ?? '-'}
                </Text>
              </Box>
            ) : null}
          </>
        ) : (
          <Box flex={1}>
            <Text color="fg.neutralSubtle" textStyle="t2Regular">
              {unavailableLabel}
            </Text>
          </Box>
        )}
      </HStack>
      {children ? <Box pl="x16">{children}</Box> : null}
    </VStack>
  );
}

export function ReportScoreMarkerLegend({ label }: { label: string }) {
  return (
    <HStack align="center" gap="x1_5" justify="flexEnd" width="full">
      <Box bg="fg.neutral" height="x3" width="x1" />
      <Text color="fg.neutralMuted" textStyle="t1Regular">
        기준선: {label}
      </Text>
    </HStack>
  );
}
