import { readinessLabel, readinessTone } from '../../domain/readiness';
import { Badge } from '../ui/Badge';

export type ReadinessChipProps = {
  score: number;
};

export function ReadinessChip({ score }: ReadinessChipProps) {
  return <Badge label={readinessLabel(score)} tone={readinessTone(score)} />;
}
