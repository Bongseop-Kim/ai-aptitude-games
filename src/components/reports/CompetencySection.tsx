import type { ReportCompetencyScore } from '../../domain/report';
import type { HelpBubbleInfo } from '../ui/HelpBubble';
import { RadarChart } from './ReportCharts';

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
  help?: HelpBubbleInfo;
};

export function CompetencySection({ competencies, help }: CompetencySectionProps) {
  const byKey = new Map(competencies.map((item) => [item.key, item]));
  const ordered = COMPETENCY_ORDER.map((key) => byKey.get(key)).filter(
    (item): item is ReportCompetencyScore => item != null,
  );

  return (
    <RadarChart
      comparisonLabel="또래 중앙값"
      help={help}
      points={ordered.map((competency) => ({
        label: COMPETENCY_LABELS[competency.key],
        value: competency.score,
        comparisonValue: competency.peer_median,
      }))}
    />
  );
}
