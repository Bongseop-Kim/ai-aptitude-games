import { useQuery } from '@tanstack/react-query';
import { useSQLiteContext } from 'expo-sqlite';

import { useAuth } from '../../providers/AuthProvider';
import { getMockExamRecords } from './mockExamResults';

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
