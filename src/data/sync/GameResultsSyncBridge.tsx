import { useEffect } from 'react';
import { AppState } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';

import { useAuth } from '../../providers/AuthProvider';
import { pushUnsyncedGameResultRounds } from './gameResultRoundsSync';
import { pushUnsyncedGameResults } from './gameResultsSync';
import { pushUnsyncedInterviewSessions } from './interviewSessionsSync';
import { pushUnsyncedMockExamResultItems } from './mockExamResultItemsSync';
import { pushUnsyncedMockExamResults } from './mockExamResultsSync';

async function pushAllUnsynced(db: ReturnType<typeof useSQLiteContext>, userId: string) {
  await pushUnsyncedGameResults(db, userId);
  await pushUnsyncedGameResultRounds(db, userId);
  await pushUnsyncedMockExamResults(db, userId);
  await pushUnsyncedMockExamResultItems(db, userId);
  await pushUnsyncedInterviewSessions(db, userId);
}

/**
 * Mounts the silent background sync triggers: pushes the outbox when the
 * user logs in (or app starts with a session) and when the app returns
 * to the foreground. Per-save pushes happen in useSaveGameResult
 * and useSaveMockExamResult.
 */
export function GameResultsSyncBridge() {
  const db = useSQLiteContext();
  const { userId } = useAuth();

  useEffect(() => {
    if (!userId) {
      return;
    }

    void pushAllUnsynced(db, userId);

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void pushAllUnsynced(db, userId);
      }
    });
    return () => subscription.remove();
  }, [db, userId]);

  return null;
}
