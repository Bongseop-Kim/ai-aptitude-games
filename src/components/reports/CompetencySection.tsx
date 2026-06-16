import { Fragment } from 'react';

import { HStack, VStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';
import type { ReportCompetencyScore } from '../../domain/report';
import { Card } from '../ui/Card';
import { List } from '../ui/List';
import { BulletBar } from './ReportCharts';

const COMPETENCY_LABELS: Record<ReportCompetencyScore['key'], string> = {
  trust: '신뢰',
  strategy: '전략',
  relationship: '관계',
  value: '가치',
  fit: '조직적합',
};

const COMPETENCY_ORDER: ReportCompetencyScore['key'][] = [
  'trust',
  'strategy',
  'relationship',
  'value',
  'fit',
];

export type CompetencySectionProps = {
  competencies: ReportCompetencyScore[];
};

export function CompetencySection({ competencies }: CompetencySectionProps) {
  const byKey = new Map(competencies.map((item) => [item.key, item]));
  const ordered = COMPETENCY_ORDER.map((key) => byKey.get(key)).filter(
    (item): item is ReportCompetencyScore => item != null,
  );

  return (
    <Card>
      <List.Root>
        {ordered.map((competency, index) => (
          <Fragment key={competency.key}>
            {index > 0 ? <List.Divider /> : null}
            <CompetencyBulletRow competency={competency} />
          </Fragment>
        ))}
      </List.Root>
    </Card>
  );
}

function CompetencyBulletRow({ competency }: { competency: ReportCompetencyScore }) {
  return (
    <HStack align="center" gap="x3" py="x3">
      <VStack flex={0.55} gap="x0_5" minWidth="x16">
        <Text textStyle="t4Bold">{COMPETENCY_LABELS[competency.key]}</Text>
        <Text color="fg.neutralSubtle" textStyle="t2Regular" lineHeight="t3" maxLines={2}>
          {competency.note}
        </Text>
      </VStack>
      <BulletBar value={competency.score} peerMedian={competency.peer_median} />
      <Text textStyle="t5Bold">{competency.score}</Text>
      {competency.percentile != null ? (
        <Text color="fg.neutralMuted" textStyle="t2Regular">
          상위 {competency.percentile}%
        </Text>
      ) : null}
    </HStack>
  );
}
