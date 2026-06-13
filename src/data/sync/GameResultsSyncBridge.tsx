import { useEffect } from 'react';
import { AppState } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';

import { useAuth } from '../../providers/AuthProvider';
import { resumePendingInterviewMediaUploads } from '../media/interviewMediaUpload';
import { pushUnsyncedGameResultRounds } from './gameResultRoundsSync';
import { pushUnsyncedGameResults } from './gameResultsSync';
import { pushUnsyncedInterviewAnswers } from './interviewAnswersSync';
import { pushUnsyncedInterviewSessions } from './interviewSessionsSync';
import { pushUnsyncedMockExamResultItems } from './mockExamResultItemsSync';
import { pushUnsyncedMockExamResults } from './mockExamResultsSync';

async function pushAllUnsynced(db: ReturnType<typeof useSQLiteContext>, userId: string) {
  await pushUnsyncedMockExamResults(db, userId);
  await pushUnsyncedGameResults(db, userId);
  await pushUnsyncedInterviewSessions(db, userId);
  await pushUnsyncedInterviewAnswers(db, userId);
  await pushUnsyncedGameResultRounds(db, userId);
  await pushUnsyncedMockExamResultItems(db, userId);
  await resumePendingInterviewMediaUploads(db, userId);
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
