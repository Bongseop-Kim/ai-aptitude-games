import { Box } from '../../design-system/components/Box';
import { HStack, VStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';
import { TagGroup, type TagGroupItem } from '../ui/TagGroup';
import { BulletBar } from './ReportCharts';

const TITLE_COLUMN_WIDTH = 'x23';
const SCORE_COLUMN_WIDTH = 'x10';
const EMPTY_TAG_ITEMS: TagGroupItem[] = [];

export type ReportScoreRowProps = {
  title: string;
  value: number | null;
  valueLabel?: string;
  markerValue?: number | null;
  tagItems?: TagGroupItem[];
  unavailableLabel?: string;
};

export function ReportScoreRow({
  title,
  value,
  valueLabel,
  markerValue = null,
  tagItems = EMPTY_TAG_ITEMS,
  unavailableLabel = '분석 준비 중',
}: ReportScoreRowProps) {
  const hasValue = value != null;
  const score = value ?? 0;
  const scoreLabel = hasValue ? valueLabel ?? `${value}` : '-';
  const resolvedTagItems = hasValue ? tagItems : [...tagItems, { label: unavailableLabel }];

  return (
    <VStack gap="x2" minHeight="x24" py="x3" width="full">
      <HStack align="center" gap="x3">
        <Box width={TITLE_COLUMN_WIDTH}>
          <Text textStyle="t4Bold" maxLines={2}>
            {title}
          </Text>
        </Box>
        <BulletBar value={score} peerMedian={markerValue} />
        <Box width={SCORE_COLUMN_WIDTH}>
          <Text align="right" textStyle="t5Bold">
            {scoreLabel}
          </Text>
        </Box>
      </HStack>
      <TagGroup items={resolvedTagItems} />
    </VStack>
  );
}
