import { useEffect } from 'react';
import { AppState } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';

import { useAuth } from '../../providers/AuthProvider';
import { pushUnsyncedGameResults } from './gameResultsSync';

/**
 * Mounts the silent background sync triggers: pushes the outbox when the
 * user logs in (or app starts with a session) and when the app returns
 * to the foreground. Per-save pushes happen in useSaveGameResult.
 */
export function GameResultsSyncBridge() {
  const db = useSQLiteContext();
  const { userId } = useAuth();

  useEffect(() => {
    if (!userId) {
      return;
    }

    void pushUnsyncedGameResults(db, userId);

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void pushUnsyncedGameResults(db, userId);
      }
    });
    return () => subscription.remove();
  }, [db, userId]);

  return null;
}
