import { Text } from '../../design-system/components/Text';
import { List } from '../ui/List';
import { TagGroup, type TagGroupItem } from '../ui/TagGroup';
import { BulletBar } from './ReportCharts';

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
    <List.Item>
      <List.Content>
        <Text textStyle="t3Medium" maxLines={1}>
          {title}
        </Text>
        <BulletBar value={score} peerMedian={markerValue} />
        <TagGroup items={resolvedTagItems} />
      </List.Content>
      <List.Suffix>
        <Text align="right" textStyle="t3Bold">
          {scoreLabel}
        </Text>
      </List.Suffix>
    </List.Item>
  );
}
