import { useState } from 'react';
import { Pressable } from 'react-native';

import { Header } from '../components/app/Header';
import { TabScreen } from '../components/app/TabScreen';
import { MockExamRecordRow } from '../components/reports/MockExamRecordRow';
import { MockExamSummaryCard } from '../components/reports/MockExamSummaryCard';
import { Button } from '../components/ui/Button';
import { Tag } from '../components/ui/Tag';
import { mockExamRecords } from '../data/mockExams';
import { HStack, VStack } from '../design-system/components/Stack';

type RecordFilter = 'all' | 'pro';

const recordFilters: { value: RecordFilter; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'pro', label: '프리미엄' },
];

export function ReportsScreen() {
  const [filter, setFilter] = useState<RecordFilter>('all');
  const latestRound = mockExamRecords[0]?.round;
  const records = filter === 'pro' ? mockExamRecords.filter((record) => record.pro) : mockExamRecords;

  return (
    <TabScreen header={<Header title="기록" subtitle="모의고사 회차별 리포트" />}>
      <MockExamSummaryCard records={mockExamRecords} />
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
      <VStack gap="x2">
        {records.map((record) => (
          <MockExamRecordRow
            key={record.round}
            record={record}
            isLatest={record.round === latestRound}
          />
        ))}
      </VStack>
      <Button label="새 모의고사 시작" variant="outline" iconLeft="add" fullWidth />
    </TabScreen>
  );
}
