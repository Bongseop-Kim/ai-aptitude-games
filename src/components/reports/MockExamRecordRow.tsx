import { Pressable, type PressableProps } from 'react-native';

import { Box } from '../../design-system/components/Box';
import { Float } from '../../design-system/components/Float';
import { HStack, VStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';
import type { MockExamRecord } from '../../domain/types';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { Icon } from '../ui/Icon';
import { Skeleton } from '../ui/Skeleton';

export type MockExamRecordRowProps = Omit<PressableProps, 'children'> & {
  record: MockExamRecord;
  isLatest?: boolean;
};

export function MockExamRecordRow({ record, isLatest = false, ...props }: MockExamRecordRowProps) {
  const deltaPositive = record.delta != null && record.delta > 0;

  return (
    <Pressable {...props} accessibilityRole="button">
      <Box position="relative">
        <Card p="x3">
          <HStack align="center" gap="x3">
            <VStack align="center" width="x11">
              <Text color="fg.neutralSubtle" textStyle="t1Regular" maxLines={1}>
                #{record.round}회
              </Text>
              <Text
                color={record.score >= 75 ? 'fg.positive' : 'fg.neutral'}
                textStyle="t6Bold"
                maxLines={1}
              >
                {record.score}
              </Text>
            </VStack>
            <VStack flex={1} gap="x0_5">
              <HStack align="center" gap="x1_5">
                <Text textStyle="t3Bold" maxLines={1}>
                  {record.dateLabel}
                </Text>
                {record.pro ? <Badge label="Pro" tone="brand" size="small" /> : null}
              </HStack>
              <HStack align="center" gap="x2">
                <HStack align="center" gap="x1">
                  <Icon name="Clock" color="fg.neutralSubtle" size="small" />
                  <Text color="fg.neutralSubtle" textStyle="t2Regular" maxLines={1}>
                    {record.duration}
                  </Text>
                </HStack>
                {record.delta != null ? (
                  <Text
                    color={deltaPositive ? 'fg.positive' : 'fg.critical'}
                    textStyle="t2Bold"
                    maxLines={1}
                  >
                    {deltaPositive ? '▲' : '▼'} {Math.abs(record.delta)}
                  </Text>
                ) : null}
              </HStack>
            </VStack>
            <Icon name="ChevronRight" color="fg.neutralSubtle" size="small" />
          </HStack>
        </Card>
        {isLatest ? (
          <Float placement="top-start" offsetX="x3" offsetY={-8} zIndex={1}>
            <Badge label="NEW" tone="critical" size="small" />
          </Float>
        ) : null}
      </Box>
    </Pressable>
  );
}

export function MockExamRecordRowSkeleton() {
  return (
    <Card p="x3">
      <HStack align="center" gap="x3">
        <VStack align="center" width="x11">
          <Skeleton height="x3" width="x8" />
          <Skeleton height="x6" width="x8" />
        </VStack>
        <VStack flex={1} gap="x0_5">
          <HStack align="center" gap="x1_5">
            <Skeleton height="x4" width="x16" />
            <Skeleton borderRadius="full" height="x4" width="x8" />
          </HStack>
          <HStack align="center" gap="x2">
            <Skeleton borderRadius="full" height="x4" width="x12" />
            <Skeleton height="x3" width="x6" />
          </HStack>
        </VStack>
        <Skeleton borderRadius="full" height="x5" width="x5" />
      </HStack>
    </Card>
  );
}
