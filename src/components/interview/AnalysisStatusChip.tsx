import { Badge, type BadgeVariantTone } from '../ui/Badge';

export type AnalysisStatus = 'pending' | 'processing' | 'done' | 'failed';

const STATUS_LABEL: Record<AnalysisStatus, string> = {
  pending: '분석 중',
  processing: '분석 중',
  done: '분석 완료',
  failed: '분석 실패',
};

const STATUS_TONE: Record<AnalysisStatus, BadgeVariantTone> = {
  pending: 'warning',
  processing: 'warning',
  done: 'positive',
  failed: 'critical',
};

export function AnalysisStatusChip({ status }: { status: AnalysisStatus }) {
  return <Badge label={STATUS_LABEL[status]} tone={STATUS_TONE[status]} size="small" />;
}
