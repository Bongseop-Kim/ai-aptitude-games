import type { PressableProps } from 'react-native';

import { HStack, VStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';
import type { MockExamRecord } from '../../domain/types';
import { Badge } from '../ui/Badge';
import { Icon } from '../ui/Icon';
import { List } from '../ui/List';
import { Skeleton } from '../ui/Skeleton';

export type MockExamRecordRowProps = Omit<PressableProps, 'children'> & {
  record: MockExamRecord;
  isLatest?: boolean;
};

export function MockExamRecordRow({ record, isLatest = false, ...props }: MockExamRecordRowProps) {
  const deltaPositive = record.delta != null && record.delta > 0;

  return (
    <List.Item {...props}>
      <List.Prefix>
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
      </List.Prefix>
      <List.Content>
        <HStack align="center" gap="x1_5">
          <List.Title>{record.dateLabel}</List.Title>
          {record.pro ? <Badge label="Pro" tone="brand" size="small" /> : null}
          {isLatest ? <Badge label="최신" tone="critical" size="small" /> : null}
        </HStack>
        <HStack align="center" gap="x2">
          <HStack align="center" gap="x1">
            <Icon name="Clock" color="fg.neutralMuted" size="small" />
            <List.Detail>{record.duration}</List.Detail>
          </HStack>
          {record.delta != null ? (
            <Text
              color={deltaPositive ? 'fg.positive' : 'fg.critical'}
              textStyle="t3Regular"
              maxLines={1}
            >
              {deltaPositive ? '▲' : '▼'} {Math.abs(record.delta)}
            </Text>
          ) : null}
        </HStack>
      </List.Content>
      <List.Suffix>
        <Icon name="ChevronRight" size="small" />
      </List.Suffix>
    </List.Item>
  );
}

export function MockExamRecordRowSkeleton() {
  return (
    <HStack align="center" gap="x3" py="x3">
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
  );
}
