import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSQLiteContext } from 'expo-sqlite';

import { gameResultKeys } from '../local/useGameResults';
import { mockExamKeys } from '../local/useMockExamResults';
import { pushUnsyncedGameResults } from '../sync/gameResultsSync';
import { pushUnsyncedMockExamResults } from '../sync/mockExamResultsSync';
import { useAuth } from '../../providers/AuthProvider';
import { clearAllLocalData, seedDevData } from './devSeed';

export function useSeedDevData() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();
  const { userId } = useAuth();

  return useMutation({
    mutationFn: () => {
      if (!userId) {
        throw new Error('Cannot seed dev data without an authenticated user.');
      }
      return seedDevData(db, userId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: gameResultKeys.all });
      void queryClient.invalidateQueries({ queryKey: mockExamKeys.all });
      if (userId) {
        void pushUnsyncedGameResults(db, userId);
        void pushUnsyncedMockExamResults(db, userId);
      }
    },
    onError: (error) => {
      if (__DEV__) {
        console.warn('[useSeedDevData] seed failed:', error);
      }
    },
  });
}

export function useClearDevData() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => clearAllLocalData(db),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: gameResultKeys.all });
      void queryClient.invalidateQueries({ queryKey: mockExamKeys.all });
    },
    onError: (error) => {
      if (__DEV__) {
        console.warn('[useClearDevData] clear failed:', error);
      }
    },
  });
}
