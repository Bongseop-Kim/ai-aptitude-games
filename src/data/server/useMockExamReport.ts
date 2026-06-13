import { useQuery } from '@tanstack/react-query';

import { useAuth } from '../../providers/AuthProvider';
import { supabase } from '../../lib/supabase';
import type { MockExamReport, MockExamReportRow } from '../../domain/report';

// Re-implemented locally — SQLite stores datetimes as 'YYYY-MM-DD HH:MM:SS' UTC.
function toIsoUtc(sqliteDatetime: string): string {
  return `${sqliteDatetime.replace(' ', 'T')}Z`;
}

export const mockExamReportKeys = {
  all: ['mock-exam-reports'] as const,
  detail: (userId: string | null, mockExamId: string | null) =>
    ['mock-exam-reports', userId, mockExamId] as const,
};

export type ReportSectionState = 'pending' | 'ready' | 'failed';

export type ReportSectionStates = {
  overall: ReportSectionState;
  competencies: ReportSectionState;
  highlights: ReportSectionState;
  coach: ReportSectionState;
  interview: ReportSectionState;
};

export function getReportSectionStates(row: MockExamReportRow | null): ReportSectionStates {
  if (row === null || row.status === 'processing') {
    return {
      overall: 'pending',
      competencies: 'pending',
      highlights: 'pending',
      coach: 'pending',
      interview: 'pending',
    };
  }
  if (row.status === 'failed') {
    return {
      overall: 'failed',
      competencies: 'failed',
      highlights: 'failed',
      coach: 'failed',
      interview: 'failed',
    };
  }
  // status === 'done'
  const r = row.report;
  let interviewState: ReportSectionState;
  if (r?.interview == null) {
    interviewState = 'pending';
  } else if (r.interview.status === 'failed') {
    interviewState = 'failed';
  } else if (r.interview.status === 'done') {
    interviewState = 'ready';
  } else {
    interviewState = 'pending';
  }
  return {
    overall: r?.overall != null ? 'ready' : 'pending',
    competencies: r?.competencies != null ? 'ready' : 'pending',
    highlights: r?.highlights != null ? 'ready' : 'pending',
    coach: r?.coach != null ? 'ready' : 'pending',
    interview: interviewState,
  };
}

function computeRefetchInterval(
  row: MockExamReportRow | null | undefined,
  examCreatedAt: string | null,
): number | false {
  if (row?.status === 'failed') return false;
  if (row?.status === 'done' && row.report?.interview?.status !== 'pending') {
    return false;
  }
  if (!examCreatedAt) return 30_000;
  const createdMs = new Date(toIsoUtc(examCreatedAt)).getTime();
  const ageMs = Date.now() - createdMs;
  if (ageMs < 2 * 60 * 1_000) return 5_000;
  if (ageMs < 15 * 60 * 1_000) return 30_000;
  return false;
}

export function useMockExamReport(
  mockExamId: string | null,
  examCreatedAt: string | null,
) {
  const { userId } = useAuth();

  return useQuery({
    queryKey: mockExamReportKeys.detail(userId, mockExamId),
    queryFn: async (): Promise<MockExamReportRow | null> => {
      if (!userId || !mockExamId) {
        throw new Error('Cannot load report without an authenticated user and mock exam id.');
      }
      const { data, error } = await supabase
        .from('mock_exam_reports')
        .select('*')
        .eq('mock_exam_id', mockExamId)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return {
        mockExamId: data.mock_exam_id as string,
        userId: data.user_id as string,
        status: data.status as 'processing' | 'done' | 'failed',
        reportVersion: data.report_version as number,
        report: (data.report as MockExamReport) ?? null,
        error: (data.error as string | null) ?? null,
        analyzedAt: (data.analyzed_at as string | null) ?? null,
        createdAt: data.created_at as string,
      };
    },
    enabled: userId != null && mockExamId != null,
    refetchInterval: (query) => computeRefetchInterval(query.state.data, examCreatedAt),
  });
}
