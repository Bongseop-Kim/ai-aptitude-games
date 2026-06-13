import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '../../providers/AuthProvider';
import { supabase } from '../../lib/supabase';
import type { JobFamily, QuestionMaterial } from '../../domain/report';
import { normalizeJobPostingUrl } from './jobPostingUrl';

export const jobPostingKeys = {
  all: ['job-postings'] as const,
  catalog: (userId: string | null, search: string) =>
    ['job-postings', userId, 'catalog', search] as const,
  mine: (userId: string | null) => ['job-postings', userId, 'mine'] as const,
  detail: (userId: string | null, id: string | null) =>
    ['job-postings', userId, 'detail', id] as const,
};

export type JobPostingRow = {
  id: string;
  url: string | null;
  source: 'url' | 'manual';
  company: string | null;
  role: string | null;
  jobFamily: JobFamily | null;
  status: 'pending' | 'processing' | 'done' | 'failed';
  analysis: {
    company?: string;
    role?: string;
    job_family?: string;
    requirements?: string[];
    keywords?: string[];
    question_materials?: QuestionMaterial[];
  } | null;
  createdBy: string;
  createdAt: string;
  error: string | null;
};

function mapRow(row: Record<string, unknown>): JobPostingRow {
  return {
    id: row.id as string,
    url: (row.url as string | null) ?? null,
    source: row.source as 'url' | 'manual',
    company: (row.company as string | null) ?? null,
    role: (row.role as string | null) ?? null,
    jobFamily: (row.job_family as JobFamily | null) ?? null,
    status: row.status as JobPostingRow['status'],
    analysis: (row.analysis as JobPostingRow['analysis']) ?? null,
    createdBy: row.created_by as string,
    createdAt: row.created_at as string,
    error: (row.error as string | null) ?? null,
  };
}

function hasRecentlyPending(rows: JobPostingRow[]): boolean {
  const tenMinAgo = Date.now() - 10 * 60 * 1_000;
  return rows.some(
    (r) =>
      (r.status === 'pending' || r.status === 'processing') &&
      new Date(r.createdAt).getTime() > tenMinAgo,
  );
}

const CATALOG_SELECT =
  'id, url, source, company, role, job_family, status, created_by, created_at, error';

const FULL_SELECT =
  'id, url, source, company, role, job_family, status, analysis, created_by, created_at, error';

export function useJobPostingCatalog(search: string) {
  const { userId } = useAuth();

  return useQuery({
    queryKey: jobPostingKeys.catalog(userId, search),
    queryFn: async (): Promise<JobPostingRow[]> => {
      if (!userId) {
        throw new Error('Cannot load job postings without an authenticated user.');
      }

      let query = supabase
        .from('job_postings')
        .select(CATALOG_SELECT)
        .or(`status.eq.done,created_by.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (search.trim().length > 0) {
        const term = `%${search.trim()}%`;
        query = query.or(`company.ilike.${term},role.ilike.${term}`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []).map((row) => mapRow(row as Record<string, unknown>));
    },
    enabled: userId != null,
  });
}

export function useMyJobPostings() {
  const { userId } = useAuth();

  return useQuery({
    queryKey: jobPostingKeys.mine(userId),
    queryFn: async (): Promise<JobPostingRow[]> => {
      if (!userId) {
        throw new Error('Cannot load job postings without an authenticated user.');
      }
      const { data, error } = await supabase
        .from('job_postings')
        .select(CATALOG_SELECT)
        .eq('created_by', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map((row) => mapRow(row as Record<string, unknown>));
    },
    enabled: userId != null,
    refetchInterval: (query) => {
      const rows = query.state.data;
      if (!rows) return false;
      return hasRecentlyPending(rows) ? 15_000 : false;
    },
  });
}

export function useJobPosting(id: string | null) {
  const { userId } = useAuth();

  return useQuery({
    queryKey: jobPostingKeys.detail(userId, id),
    queryFn: async (): Promise<JobPostingRow | null> => {
      if (!userId || !id) {
        throw new Error('Cannot load job posting without an authenticated user and id.');
      }
      const { data, error } = await supabase
        .from('job_postings')
        .select(FULL_SELECT)
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return mapRow(data as Record<string, unknown>);
    },
    enabled: userId != null && id != null,
    refetchInterval: (query) => {
      const row = query.state.data;
      if (!row) return false;
      if (row.status === 'done' || row.status === 'failed') return false;
      const tenMinAgo = Date.now() - 10 * 60 * 1_000;
      return new Date(row.createdAt).getTime() > tenMinAgo ? 15_000 : false;
    },
  });
}

type RegisterByUrl = { url: string; pastedText?: never; company?: never; role?: never };
type RegisterByPaste = { pastedText: string; company?: string; role?: string; url?: never };
type RegisterJobPostingInput = RegisterByUrl | RegisterByPaste;

export function useRegisterJobPosting() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: RegisterJobPostingInput): Promise<JobPostingRow> => {
      if (!userId) {
        throw new Error('Cannot register a job posting without an authenticated user.');
      }

      if (input.url != null) {
        // URL path: normalize → dedupe → insert
        const urlNormalized = normalizeJobPostingUrl(input.url);
        if (!urlNormalized) {
          throw new Error('Invalid URL — must be a valid http(s) address.');
        }

        // Check for existing row by normalized URL
        const { data: existing } = await supabase
          .from('job_postings')
          .select(FULL_SELECT)
          .eq('url_normalized', urlNormalized)
          .maybeSingle();

        if (existing) {
          return mapRow(existing as Record<string, unknown>);
        }

        const id = crypto.randomUUID();
        const { data: inserted, error: insertError } = await supabase
          .from('job_postings')
          .insert({
            id,
            url: input.url.trim(),
            url_normalized: urlNormalized,
            source: 'url',
            status: 'pending',
            created_by: userId,
          })
          .select(FULL_SELECT)
          .single();

        if (insertError) {
          // 23505 = unique_violation — race condition, re-select the winner
          if ((insertError as { code?: string }).code === '23505') {
            const { data: winner, error: refetchError } = await supabase
              .from('job_postings')
              .select(FULL_SELECT)
              .eq('url_normalized', urlNormalized)
              .maybeSingle();
            if (refetchError) throw refetchError;
            if (!winner) throw new Error('Job posting not found after unique conflict.');
            return mapRow(winner as Record<string, unknown>);
          }
          throw insertError;
        }

        return mapRow(inserted as Record<string, unknown>);
      } else {
        // Manual paste path: no dedupe
        const id = crypto.randomUUID();
        const { data: inserted, error: insertError } = await supabase
          .from('job_postings')
          .insert({
            id,
            source: 'manual',
            raw_text: input.pastedText,
            company: input.company ?? null,
            role: input.role ?? null,
            status: 'pending',
            created_by: userId,
          })
          .select(FULL_SELECT)
          .single();

        if (insertError) throw insertError;
        return mapRow(inserted as Record<string, unknown>);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: jobPostingKeys.all });
    },
  });
}
