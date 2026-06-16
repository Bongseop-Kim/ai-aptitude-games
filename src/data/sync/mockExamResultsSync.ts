import type { SQLiteDatabase } from 'expo-sqlite';

import { supabase } from '../../lib/supabase';

type UnsyncedMockExamResultRow = {
  id: string;
  user_id: string;
  score: number;
  duration_ms: number;
  created_at: string;
};

let pushInFlight = false;
let pushQueuedUserId: string | null = null;

// SQLite datetime('now') stores UTC as 'YYYY-MM-DD HH:MM:SS'.
function toIsoUtc(sqliteDatetime: string) {
  return `${sqliteDatetime.replace(' ', 'T')}Z`;
}

/**
 * Silent outbox push (AGENTS.md > Data): upload local rows with synced = 0,
 * then mark them synced. Failures are swallowed — the next trigger
 * (save / login / foreground) retries.
 */
export async function pushUnsyncedMockExamResults(db: SQLiteDatabase, userId: string) {
  if (pushInFlight) {
    pushQueuedUserId = userId;
    return;
  }
  pushInFlight = true;

  try {
    const rows = await db.getAllAsync<UnsyncedMockExamResultRow>(
      'SELECT id, user_id, score, duration_ms, created_at FROM mock_exam_results WHERE synced = 0 AND user_id = ?',
      userId,
    );
    if (rows.length === 0) {
      return;
    }

    const payload = rows.map((row) => ({
      id: row.id,
      user_id: row.user_id,
      score: row.score,
      duration_ms: row.duration_ms,
      created_at: toIsoUtc(row.created_at),
    }));

    const { error } = await supabase
      .from('mock_exam_results')
      .upsert(payload, { onConflict: 'id', ignoreDuplicates: true });
    if (error) {
      if (__DEV__) {
        console.warn('[mockExamResultsSync] push failed:', error.message);
      }
      const syncedIds: string[] = [];
      for (const row of payload) {
        const { error: rowError } = await supabase
          .from('mock_exam_results')
          .upsert(row, { onConflict: 'id', ignoreDuplicates: true });
        if (rowError) {
          if (__DEV__) {
            console.warn('[mockExamResultsSync] row push failed:', row.id, rowError.message);
          }
          continue;
        }
        syncedIds.push(row.id);
      }
      if (syncedIds.length > 0) {
        const placeholders = syncedIds.map(() => '?').join(', ');
        await db.runAsync(
          `UPDATE mock_exam_results SET synced = 1 WHERE id IN (${placeholders})`,
          ...syncedIds,
        );
      }
      return;
    }

    const placeholders = rows.map(() => '?').join(', ');
    await db.runAsync(
      `UPDATE mock_exam_results SET synced = 1 WHERE id IN (${placeholders})`,
      ...rows.map((row) => row.id),
    );
  } catch (error) {
    if (__DEV__) {
      console.warn('[mockExamResultsSync] push failed:', error);
    }
  } finally {
    pushInFlight = false;
    if (pushQueuedUserId) {
      const queuedUserId = pushQueuedUserId;
      pushQueuedUserId = null;
      void pushUnsyncedMockExamResults(db, queuedUserId);
    }
  }
}
