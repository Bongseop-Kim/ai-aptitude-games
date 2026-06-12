import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSQLiteContext } from 'expo-sqlite';

import { gameResultKeys } from '../local/useGameResults';
import { interviewSessionKeys } from '../local/useInterviewSessions';
import { mockExamKeys } from '../local/useMockExamResults';
import { pushUnsyncedGameResultRounds } from '../sync/gameResultRoundsSync';
import { pushUnsyncedGameResults } from '../sync/gameResultsSync';
import { pushUnsyncedInterviewSessions } from '../sync/interviewSessionsSync';
import { pushUnsyncedMockExamResultItems } from '../sync/mockExamResultItemsSync';
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
      void queryClient.invalidateQueries({ queryKey: interviewSessionKeys.all });
      void queryClient.invalidateQueries({ queryKey: mockExamKeys.all });
      if (userId) {
        void (async () => {
          await pushUnsyncedMockExamResults(db, userId);
          await pushUnsyncedGameResults(db, userId);
          await pushUnsyncedInterviewSessions(db, userId);
          await pushUnsyncedGameResultRounds(db, userId);
          await pushUnsyncedMockExamResultItems(db, userId);
        })();
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
      void queryClient.invalidateQueries({ queryKey: interviewSessionKeys.all });
      void queryClient.invalidateQueries({ queryKey: mockExamKeys.all });
    },
    onError: (error) => {
      if (__DEV__) {
        console.warn('[useClearDevData] clear failed:', error);
      }
    },
  });
}
