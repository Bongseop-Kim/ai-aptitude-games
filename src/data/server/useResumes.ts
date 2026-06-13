import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as FileSystem from 'expo-file-system';

import { useAuth } from '../../providers/AuthProvider';
import { supabase } from '../../lib/supabase';
import type { QuestionMaterial } from '../../domain/report';

export const resumeKeys = {
  all: ['resumes'] as const,
  list: (userId: string | null) => ['resumes', userId, 'list'] as const,
};

export type ResumeRow = {
  id: string;
  userId: string;
  title: string;
  status: 'pending' | 'processing' | 'done' | 'failed';
  analysis: {
    skills?: string[];
    experiences?: string[];
    question_materials?: QuestionMaterial[];
  } | null;
  filePath: string | null;
  mimeType: string | null;
  createdAt: string;
  error: string | null;
};

type UploadResumeInput =
  | { fileUri: string; fileName: string; mimeType: string; title: string; pastedText?: never }
  | { pastedText: string; title: string; fileUri?: never; fileName?: never; mimeType?: never };

function hasRecentlyPending(rows: ResumeRow[]): boolean {
  const tenMinAgo = Date.now() - 10 * 60 * 1_000;
  return rows.some(
    (r) =>
      (r.status === 'pending' || r.status === 'processing') &&
      new Date(r.createdAt).getTime() > tenMinAgo,
  );
}

export function useResumes() {
  const { userId } = useAuth();

  return useQuery({
    queryKey: resumeKeys.list(userId),
    queryFn: async (): Promise<ResumeRow[]> => {
      if (!userId) {
        throw new Error('Cannot load resumes without an authenticated user.');
      }
      const { data, error } = await supabase
        .from('resumes')
        .select('id, user_id, title, status, analysis, file_path, mime_type, created_at, error')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map((row) => ({
        id: row.id as string,
        userId: row.user_id as string,
        title: row.title as string,
        status: row.status as ResumeRow['status'],
        analysis: (row.analysis as ResumeRow['analysis']) ?? null,
        filePath: (row.file_path as string | null) ?? null,
        mimeType: (row.mime_type as string | null) ?? null,
        createdAt: row.created_at as string,
        error: (row.error as string | null) ?? null,
      }));
    },
    enabled: userId != null,
    refetchInterval: (query) => {
      const rows = query.state.data;
      if (!rows) return false;
      return hasRecentlyPending(rows) ? 15_000 : false;
    },
  });
}

export function useUploadResume() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UploadResumeInput): Promise<ResumeRow> => {
      if (!userId) {
        throw new Error('Cannot upload a resume without an authenticated user.');
      }

      const id = crypto.randomUUID();

      let filePath: string;
      let mimeType: string;
      let sizeBytes: number;
      let fileBytes: Uint8Array;

      if (input.fileUri != null) {
        // File upload path
        const fileName = input.fileName;
        filePath = `resumes/${userId}/${id}/${fileName}`;
        mimeType = input.mimeType;

        const file = new FileSystem.File(input.fileUri);
        const buffer = await file.bytes();
        fileBytes = buffer;
        sizeBytes = buffer.byteLength;
      } else {
        // Pasted text path
        filePath = `resumes/${userId}/${id}/resume.txt`;
        mimeType = 'text/plain';
        const encoder = new TextEncoder();
        fileBytes = encoder.encode(input.pastedText);
        sizeBytes = fileBytes.byteLength;
      }

      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, fileBytes, { contentType: mimeType });
      if (uploadError) throw uploadError;

      const { data: inserted, error: insertError } = await supabase
        .from('resumes')
        .insert({
          id,
          user_id: userId,
          title: input.title,
          file_path: filePath,
          mime_type: mimeType,
          size_bytes: sizeBytes,
          status: 'pending',
        })
        .select('id, user_id, title, status, analysis, file_path, mime_type, created_at, error')
        .single();

      if (insertError) {
        // Best-effort cleanup — do not rethrow storage error
        await supabase.storage.from('resumes').remove([filePath]).catch(() => undefined);
        throw insertError;
      }

      return {
        id: inserted.id as string,
        userId: inserted.user_id as string,
        title: inserted.title as string,
        status: inserted.status as ResumeRow['status'],
        analysis: (inserted.analysis as ResumeRow['analysis']) ?? null,
        filePath: (inserted.file_path as string | null) ?? null,
        mimeType: (inserted.mime_type as string | null) ?? null,
        createdAt: inserted.created_at as string,
        error: (inserted.error as string | null) ?? null,
      };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: resumeKeys.all });
    },
  });
}

export function useDeleteResume() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (resumeId: string): Promise<void> => {
      if (!userId) {
        throw new Error('Cannot delete a resume without an authenticated user.');
      }

      // Fetch file_path before deletion for storage cleanup
      const { data: row } = await supabase
        .from('resumes')
        .select('file_path')
        .eq('id', resumeId)
        .eq('user_id', userId)
        .maybeSingle();

      const { error } = await supabase
        .from('resumes')
        .delete()
        .eq('id', resumeId)
        .eq('user_id', userId);
      if (error) throw error;

      // Best-effort storage removal
      if (row?.file_path) {
        await supabase.storage
          .from('resumes')
          .remove([row.file_path as string])
          .catch(() => undefined);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: resumeKeys.all });
    },
  });
}
