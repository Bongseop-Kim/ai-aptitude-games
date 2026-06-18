import { Fragment } from 'react';

import { VStack } from '../../design-system/components/Stack';
import type { ReportCompetencyScore } from '../../domain/report';
import { Card } from '../ui/Card';
import { List } from '../ui/List';
import { ReportScoreMarkerLegend, ReportScoreRow } from './ReportScoreRow';

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
      <VStack gap="x2">
        <ReportScoreMarkerLegend label="또래 중앙값" />
        <List.Root>
          {ordered.map((competency, index) => (
            <Fragment key={competency.key}>
              {index > 0 ? <List.Divider /> : null}
              <CompetencyBulletRow competency={competency} />
            </Fragment>
          ))}
        </List.Root>
      </VStack>
    </Card>
  );
}

function CompetencyBulletRow({ competency }: { competency: ReportCompetencyScore }) {
  return (
    <ReportScoreRow
      title={COMPETENCY_LABELS[competency.key]}
      description={competency.note}
      value={competency.score}
      markerValue={competency.peer_median}
      supportingLabel={competency.percentile != null ? `상위 ${competency.percentile}%` : null}
    />
  );
}
