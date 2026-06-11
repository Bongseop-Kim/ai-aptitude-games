import { useState, type ReactNode } from 'react';
import { Pressable, type ListRenderItemInfo } from 'react-native';
import { useRouter } from 'expo-router';

import { Header } from '../components/app/Header';
import { TabListScreen } from '../components/app/TabListScreen';
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
import { Box } from '../design-system/components/Box';
import { HStack, VStack } from '../design-system/components/Stack';
import { Text } from '../design-system/components/Text';
import type { MockExamRecord } from '../domain/types';

type RecordFilter = 'all' | 'pro';
type RecordListItem =
  | { kind: 'record'; record: MockExamRecord }
  | { kind: 'skeleton'; id: string };
type RecordEmptyState = {
  description: string;
  title: string;
};

const recordFilters: { value: RecordFilter; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'pro', label: 'Pro' },
];

const mockExamRecordSkeletonKeys = ['first', 'second', 'third'] as const;

export function ReportsScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<RecordFilter>('all');
  const { data, isLoading } = useMockExamRecords();
  const mockExamRecords = data ?? [];
  const latestRound = mockExamRecords[0]?.round;
  const records = filter === 'pro' ? mockExamRecords.filter((record) => record.pro) : mockExamRecords;
  const hasRecords = mockExamRecords.length > 0;
  const hasNoRecords = !isLoading && mockExamRecords.length === 0;
  const hasNoFilteredRecords = !isLoading && hasRecords && records.length === 0;
  let emptyState: RecordEmptyState | null = null;

  if (hasNoRecords) {
    emptyState = {
      title: '모의고사 기록이 아직 없어요',
      description: '모의고사를 완료하면 회차별 기록을 여기에서 확인할 수 있어요.',
    };
  } else if (hasNoFilteredRecords) {
    emptyState = {
      title: 'Pro 기록이 아직 없어요',
      description: 'Pro 리포트를 완료하면 이 필터에서 모아볼 수 있어요.',
    };
  }
  const listData: RecordListItem[] = isLoading
    ? mockExamRecordSkeletonKeys.map((id) => ({ kind: 'skeleton', id }))
    : records.map((record) => ({ kind: 'record', record }));
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
  const startMockExam = () => router.push({ pathname: '/games/[id]', params: { id: 'rps', mock: 'true', idx: '0' } });
  const renderRecordItem = ({ item }: ListRenderItemInfo<RecordListItem>) => {
    if (item.kind === 'skeleton') {
      return <MockExamRecordRowSkeleton />;
    }

    return (
      <RecordListRecordRow
        record={item.record}
        isLatest={item.record.round === latestRound}
      />
    );
  };

  return (
    <TabListScreen<RecordListItem>
      header={<Header title="기록" subtitle="모의고사 회차별 리포트" />}
      pinnedContent={(
        <RecordListHeader
          hasRecords={hasRecords}
          isLoading={isLoading}
          onStartMockExam={startMockExam}
          records={mockExamRecords}
          recordFilterRow={recordFilterRow}
        />
      )}
      data={listData}
      ItemSeparatorComponent={RecordListSeparator}
      keyExtractor={(item) => (item.kind === 'record' ? item.record.id : item.id)}
      ListEmptyComponent={emptyState ? <EmptyMockExamRecords {...emptyState} /> : null}
      renderItem={renderRecordItem}
    />
  );
}

type RecordListRecordRowProps = {
  record: MockExamRecord;
  isLatest: boolean;
};

function RecordListRecordRow({ record, isLatest }: RecordListRecordRowProps) {
  const router = useRouter();

  return (
    <MockExamRecordRow
      record={record}
      isLatest={isLatest}
      onPress={() => router.push({ pathname: '/reports/[id]', params: { id: record.id } } as never)}
    />
  );
}

type RecordListHeaderProps = {
  hasRecords: boolean;
  isLoading: boolean;
  onStartMockExam: () => void;
  records: MockExamRecord[];
  recordFilterRow: ReactNode;
};

function RecordListHeader({
  hasRecords,
  isLoading,
  onStartMockExam,
  records,
  recordFilterRow,
}: RecordListHeaderProps) {
  if (isLoading) {
    return (
      <VStack gap="spacingY.componentDefault">
        <MockExamSummaryCardSkeleton />
        {recordFilterRow}
        <Button label="새 모의고사 시작" iconLeft="Plus" fullWidth onPress={onStartMockExam} />
      </VStack>
    );
  }

  if (!hasRecords) {
    return (
      <Button label="새 모의고사 시작" iconLeft="Plus" fullWidth onPress={onStartMockExam} />
    );
  }

  return (
    <VStack gap="spacingY.componentDefault">
      <MockExamSummaryCard records={records} />
      {recordFilterRow}
      <Button label="새 모의고사 시작" iconLeft="Plus" fullWidth onPress={onStartMockExam} />
    </VStack>
  );
}

function RecordListSeparator() {
  return <Box height="x2" />;
}

function EmptyMockExamRecords({ description, title }: RecordEmptyState) {
  return (
    <Card>
      <VStack align="center" gap="x1">
        <Text align="center" textStyle="t4Bold">
          {title}
        </Text>
        <Text align="center" color="fg.neutralSubtle" textStyle="t2Regular">
          {description}
        </Text>
      </VStack>
    </Card>
  );
}
