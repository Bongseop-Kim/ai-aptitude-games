import type { JobFamily } from './report';

export type JobFamilyOption = {
  value: JobFamily;
  label: string;
};

export const JOB_FAMILY_OPTIONS: readonly JobFamilyOption[] = [
  { value: 'it', label: '개발·IT' },
  { value: 'biz', label: '경영·사무' },
  { value: 'mkt', label: '마케팅·미디어' },
  { value: 'design', label: '디자인' },
  { value: 'fin', label: '금융·재무' },
  { value: 'etc', label: '기타' },
] as const;

const JOB_FAMILY_LABELS: Record<JobFamily, string> = {
  it: '개발·IT',
  biz: '경영·사무',
  mkt: '마케팅·미디어',
  design: '디자인',
  fin: '금융·재무',
  etc: '기타',
};

export function jobFamilyLabel(field: JobFamily | null | undefined): string | null {
  if (field == null) return null;
  return JOB_FAMILY_LABELS[field] ?? null;
}
