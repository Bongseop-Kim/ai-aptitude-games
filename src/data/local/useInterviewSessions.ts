import { useQuery } from '@tanstack/react-query';
import { useSQLiteContext } from 'expo-sqlite';

import { useAuth } from '../../providers/AuthProvider';
import { getInterviewSessionRecords } from './interviewSessions';

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

