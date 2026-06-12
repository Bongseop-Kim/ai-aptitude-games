import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSQLiteContext } from 'expo-sqlite';

import { useAuth } from '../../providers/AuthProvider';
import { pushUnsyncedMockExamResults } from '../sync/mockExamResultsSync';
import {
  getMockExamRecords,
  insertMockExamResult,
  type MockExamResultInput,
} from './mockExamResults';

export const mockExamKeys = {
  all: ['mock-exam-results'] as const,
  records: (userId: string | null) => ['mock-exam-results', userId, 'records'] as const,
};

export function useMockExamRecords() {
  const db = useSQLiteContext();
  const { userId } = useAuth();

  return useQuery({
    queryKey: mockExamKeys.records(userId),
    queryFn: () => {
      if (!userId) {
        throw new Error('Cannot load mock exam results without an authenticated user.');
      }
      return getMockExamRecords(db, userId);
    },
    enabled: userId != null,
  });
}

export function useMockExamRecord(id: string | null) {
  const db = useSQLiteContext();
  const { userId } = useAuth();

  return useQuery({
    queryKey: mockExamKeys.records(userId),
    queryFn: () => {
      if (!userId) {
        throw new Error('Cannot load mock exam results without an authenticated user.');
      }

      return getMockExamRecords(db, userId);
    },
    enabled: userId != null && id != null,
    select: (records) => records.find((record) => record.id === id) ?? null,
  });
}

export function useSaveMockExamResult() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();
  const { userId } = useAuth();

  return useMutation({
    mutationFn: (input: MockExamResultInput) => {
      if (!userId) {
        throw new Error('Cannot save a mock exam result without an authenticated user.');
      }
      return insertMockExamResult(db, userId, input);
    },
    retry: 2,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: mockExamKeys.all });
      if (userId) {
        void pushUnsyncedMockExamResults(db, userId);
      }
    },
    onError: (error) => {
      if (__DEV__) {
        console.warn('[useSaveMockExamResult] save failed:', error);
      }
    },
  });
}
