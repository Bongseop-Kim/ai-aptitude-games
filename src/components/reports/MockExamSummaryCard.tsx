import { Box } from '../../design-system/components/Box';
import { HStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';
import type { MockExamRecord } from '../../domain/types';
import { Card } from '../ui/Card';
import { Skeleton } from '../ui/Skeleton';
import { MockExamTrendLine } from './MockExamTrendLine';

export type MockExamSummaryCardProps = {
  records: MockExamRecord[];
};

export function MockExamSummaryCard({ records }: MockExamSummaryCardProps) {
  const latest = records[0];
  const first = records[records.length - 1];
  const delta = latest && first ? latest.score - first.score : 0;
  const scores = records.map((record) => record.score).reverse();

  return (
    <Card bg="bg.brandWeak" borderColor="stroke.brandWeak" gap="x1_5">
      <HStack align="center" gap="x1_5">
        <Text color="fg.brand" textStyle="t8Bold" maxLines={1}>
          {records.length}회차
        </Text>
        <Box flex={1}>
          <Text color="fg.neutralMuted" textStyle="t2Regular" maxLines={1}>
            완주 · 첫 회차 대비
          </Text>
        </Box>
        <Text color="fg.positive" textStyle="t5Bold" maxLines={1}>
          {delta >= 0 ? `+${delta}` : delta}
        </Text>
      </HStack>
      {records.length >= 2 ? <MockExamTrendLine scores={scores} /> : null}
    </Card>
  );
}

export function MockExamSummaryCardSkeleton() {
  return (
    <Card bg="bg.brandWeak" borderColor="stroke.brandWeak" gap="x1_5">
      <HStack align="center" gap="x1_5">
        <Skeleton height="x9" width="x16" />
        <Box flex={1}>
          <Skeleton height="x3" width="x14" />
        </Box>
        <Skeleton height="x5" width="x8" />
      </HStack>
      <Skeleton height="x11" width="full" />
    </Card>
  );
}
