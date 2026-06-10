import { Box } from '../../design-system/components/Box';
import { HStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';
import type { MockExamRecord } from '../../domain/types';
import { Card } from '../ui/Card';

export type MockExamSummaryCardProps = {
  records: MockExamRecord[];
};

export function MockExamSummaryCard({ records }: MockExamSummaryCardProps) {
  const latest = records[0];
  const first = records[records.length - 1];
  const delta = latest && first ? latest.score - first.score : 0;

  return (
    <Card bg="bg.brandWeak" borderColor="stroke.brandWeak">
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
    </Card>
  );
}
