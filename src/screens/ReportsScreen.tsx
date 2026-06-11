import { useState } from 'react';
import { Pressable } from 'react-native';

import { Header } from '../components/app/Header';
import { TabScreen } from '../components/app/TabScreen';
import {
  MockExamRecordRow,
  MockExamRecordRowSkeleton,
} from '../components/reports/MockExamRecordRow';
import {
  MockExamSummaryCard,
  MockExamSummaryCardSkeleton,
} from '../components/reports/MockExamSummaryCard';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Tag } from '../components/ui/Tag';
import { useMockExamRecords } from '../data/local/useMockExamResults';
import { HStack, VStack } from '../design-system/components/Stack';
import { Text } from '../design-system/components/Text';

type RecordFilter = 'all' | 'pro';

const recordFilters: { value: RecordFilter; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'pro', label: '프리미엄' },
];

const mockExamRecordSkeletonKeys = ['first', 'second', 'third'] as const;

export function ReportsScreen() {
  const [filter, setFilter] = useState<RecordFilter>('all');
  const { data, isLoading } = useMockExamRecords();
  const mockExamRecords = data ?? [];
  const latestRound = mockExamRecords[0]?.round;
  const records = filter === 'pro' ? mockExamRecords.filter((record) => record.pro) : mockExamRecords;
  const hasRecords = mockExamRecords.length > 0;
  const hasNoRecords = !isLoading && mockExamRecords.length === 0;
  const recordFilterRow = (
    <HStack align="center" gap="x2">
      {recordFilters.map(({ value, label }) => (
        <Pressable
          key={value}
          accessibilityRole="button"
          accessibilityState={{ selected: filter === value }}
          onPress={() => setFilter(value)}
        >
          <Tag label={label} selected={filter === value} />
        </Pressable>
      ))}
    </HStack>
  );

  return (
    <TabScreen header={<Header title="기록" subtitle="모의고사 회차별 리포트" />}>
      {isLoading ? (
        <>
          <MockExamSummaryCardSkeleton />
          {recordFilterRow}
          <VStack gap="x2">
            {mockExamRecordSkeletonKeys.map((key) => (
              <MockExamRecordRowSkeleton key={key} />
            ))}
          </VStack>
        </>
      ) : null}
      {hasRecords ? (
        <>
          <MockExamSummaryCard records={mockExamRecords} />
          {recordFilterRow}
          <VStack gap="x2">
            {records.map((record) => (
              <MockExamRecordRow
                key={record.round}
                record={record}
                isLatest={record.round === latestRound}
              />
            ))}
          </VStack>
        </>
      ) : null}
      {hasNoRecords ? (
        <EmptyMockExamRecords />
      ) : null}
      <Button label="새 모의고사 시작" variant="outline" iconLeft="Plus" fullWidth />
    </TabScreen>
  );
}

function EmptyMockExamRecords() {
  return (
    <Card>
      <VStack align="center" gap="x1">
        <Text align="center" textStyle="t4Bold">
          모의고사 기록이 아직 없어요
        </Text>
        <Text align="center" color="fg.neutralSubtle" textStyle="t2Regular">
          모의고사를 완료하면 회차별 기록을 여기에서 확인할 수 있어요.
        </Text>
      </VStack>
    </Card>
  );
}
