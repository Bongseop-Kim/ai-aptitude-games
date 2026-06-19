import { type ReactNode } from 'react';
import { type ListRenderItemInfo } from 'react-native';
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
import { ActionButton } from '../components/ui/ActionButton';
import { Card } from '../components/ui/Card';
import { List } from '../components/ui/List';
import { useMockExamRecords } from '../data/local/useMockExamResults';
import { useActiveMockExamSession } from '../data/local/useMockExamSession';
import { Box } from '../design-system/components/Box';
import { VStack } from '../design-system/components/Stack';
import { Text } from '../design-system/components/Text';
import type { MockExamRecord } from '../domain/types';

type RecordListItem =
  | { kind: 'record'; record: MockExamRecord }
  | { kind: 'skeleton'; id: string };
type RecordEmptyState = {
  description: string;
  title: string;
};

const mockExamRecordSkeletonKeys = ['first', 'second', 'third'] as const;

function RecordListSeparator() {
  return (
    <Box
      bg="bg.layerDefault"
      borderColor="stroke.neutralSubtle"
      borderLeftWidth="thin"
      borderRightWidth="thin"
      px="spacingX.globalGutter"
    >
      <List.Divider />
    </Box>
  );
}

function RecordListItemFrame({
  children,
  isFirst,
  isLast,
}: {
  children: ReactNode;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <Box
      bg="bg.layerDefault"
      borderColor="stroke.neutralSubtle"
      borderLeftWidth="thin"
      borderRightWidth="thin"
      {...(isLast
        ? {
            borderBottomLeftRadius: 'r4' as const,
            borderBottomRightRadius: 'r4' as const,
            borderBottomWidth: 'thin' as const,
          }
        : {})}
      {...(isFirst
        ? {
            borderTopLeftRadius: 'r4' as const,
            borderTopRightRadius: 'r4' as const,
            borderTopWidth: 'thin' as const,
          }
        : {})}
      overflow="hidden"
      px="spacingX.globalGutter"
      py="x1"
    >
      {children}
    </Box>
  );
}

export function ReportsScreen() {
  const router = useRouter();
  const { data, isLoading } = useMockExamRecords();
  const { data: activeSession } = useActiveMockExamSession();
  const records = data ?? [];
  const latestRound = records[0]?.round;
  const hasRecords = records.length > 0;
  const hasNoRecords = !isLoading && records.length === 0;
  let emptyState: RecordEmptyState | null = null;

  if (hasNoRecords) {
    emptyState = {
      title: '모의고사 기록이 아직 없어요',
      description: '모의고사를 완료하면 회차별 기록을 여기에서 확인할 수 있어요.',
    };
  }
  const listData: RecordListItem[] = isLoading
    ? mockExamRecordSkeletonKeys.map((id) => ({ kind: 'skeleton', id }))
    : records.map((record) => ({ kind: 'record', record }));
  const startMockExam = () => router.push({ pathname: '/mock-exam' } as never);
  const mockExamActionLabel = activeSession ? '모의고사 이어하기' : '새 모의고사 시작';
  const renderRecordItem = ({ index, item }: ListRenderItemInfo<RecordListItem>) => {
    const isFirst = index === 0;
    const isLast = index === listData.length - 1;
    const row = item.kind === 'skeleton' ? (
      <MockExamRecordRowSkeleton />
    ) : (
      <RecordListRecordRow
        record={item.record}
        isLatest={item.record.round === latestRound}
      />
    );

    return (
      <RecordListItemFrame isFirst={isFirst} isLast={isLast}>
        {row}
      </RecordListItemFrame>
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
          records={records}
          startMockExamLabel={mockExamActionLabel}
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
  startMockExamLabel: string;
};

function RecordListHeader({
  hasRecords,
  isLoading,
  onStartMockExam,
  records,
  startMockExamLabel,
}: RecordListHeaderProps) {
  if (isLoading) {
    return (
      <VStack gap="spacingY.componentDefault">
        <MockExamSummaryCardSkeleton />
        <ActionButton label={startMockExamLabel} iconLeft="Plus" onPress={onStartMockExam} />
      </VStack>
    );
  }

  if (!hasRecords) {
    return (
      <ActionButton label={startMockExamLabel} iconLeft="Plus" onPress={onStartMockExam} />
    );
  }

  return (
    <VStack gap="spacingY.componentDefault">
      <MockExamSummaryCard records={records} />
      <ActionButton label={startMockExamLabel} iconLeft="Plus" onPress={onStartMockExam} />
    </VStack>
  );
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
