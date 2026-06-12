import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSQLiteContext } from 'expo-sqlite';

import { useAuth } from '../../providers/AuthProvider';
import { pushUnsyncedInterviewSessions } from '../sync/interviewSessionsSync';
import {
  getInterviewSessionRecords,
  insertInterviewSession,
  type InterviewSessionInput,
} from './interviewSessions';

export const interviewSessionKeys = {
  all: ['interview-sessions'] as const,
  records: (userId: string | null) => ['interview-sessions', userId, 'records'] as const,
};

export function useInterviewSessions() {
  const db = useSQLiteContext();
  const { userId } = useAuth();

  return useQuery({
    queryKey: interviewSessionKeys.records(userId),
    queryFn: () => {
      if (!userId) {
        throw new Error('Cannot load interview sessions without an authenticated user.');
      }
      return getInterviewSessionRecords(db, userId);
    },
    enabled: userId != null,
  });
}

export function useInterviewSession(id: string | null) {
  const db = useSQLiteContext();
  const { userId } = useAuth();

  return useQuery({
    queryKey: interviewSessionKeys.records(userId),
    queryFn: () => {
      if (!userId) {
        throw new Error('Cannot load interview sessions without an authenticated user.');
      }
      return getInterviewSessionRecords(db, userId);
    },
    enabled: userId != null && id != null,
    select: (records) => records.find((record) => record.id === id) ?? null,
  });
}

export function useInterviewSessionForMockExam(mockExamId: string | null) {
  const db = useSQLiteContext();
  const { userId } = useAuth();

  return useQuery({
    queryKey: interviewSessionKeys.records(userId),
    queryFn: () => {
      if (!userId) {
        throw new Error('Cannot load interview sessions without an authenticated user.');
      }
      return getInterviewSessionRecords(db, userId);
    },
    enabled: userId != null && mockExamId != null,
    select: (records) => records.find((record) => record.mockExamId === mockExamId) ?? null,
  });
}

export function useSaveInterviewSession() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();
  const { userId } = useAuth();

  return useMutation({
    mutationFn: (input: InterviewSessionInput) => {
      if (!userId) {
        throw new Error('Cannot save an interview session without an authenticated user.');
      }
      return insertInterviewSession(db, userId, input);
    },
    retry: 2,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: interviewSessionKeys.all });
      if (userId) {
        void pushUnsyncedInterviewSessions(db, userId);
      }
    },
    onError: (error) => {
      if (__DEV__) {
        console.warn('[useSaveInterviewSession] save failed:', error);
      }
    },
  });
}
