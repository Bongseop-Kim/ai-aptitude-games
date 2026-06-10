import type { SQLiteDatabase } from 'expo-sqlite';

import { supabase } from '../../lib/supabase';

type UnsyncedGameResultRow = {
  id: string;
  user_id: string;
  game_id: string;
  score: number;
  accuracy: number;
  avg_response_ms: number;
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
export async function pushUnsyncedGameResults(db: SQLiteDatabase, userId: string) {
  if (pushInFlight) {
    pushQueuedUserId = userId;
    return;
  }
  pushInFlight = true;

  try {
    const rows = await db.getAllAsync<UnsyncedGameResultRow>(
      'SELECT id, user_id, game_id, score, accuracy, avg_response_ms, created_at FROM game_results WHERE synced = 0 AND user_id = ?',
      userId,
    );
    if (rows.length === 0) {
      return;
    }

    const payload = rows.map((row) => ({
      id: row.id,
      user_id: row.user_id,
      game_id: row.game_id,
      score: row.score,
      accuracy: row.accuracy,
      avg_response_ms: row.avg_response_ms,
      created_at: toIsoUtc(row.created_at),
    }));

    const { error } = await supabase
      .from('game_results')
      .upsert(payload, { onConflict: 'id', ignoreDuplicates: true });
    if (error) {
      if (__DEV__) {
        console.warn('[gameResultsSync] push failed:', error.message);
      }
      const syncedIds: string[] = [];
      for (const row of payload) {
        const { error: rowError } = await supabase
          .from('game_results')
          .upsert(row, { onConflict: 'id', ignoreDuplicates: true });
        if (rowError) {
          if (__DEV__) {
            console.warn('[gameResultsSync] row push failed:', row.id, rowError.message);
          }
          continue;
        }
        syncedIds.push(row.id);
      }
      if (syncedIds.length > 0) {
        const placeholders = syncedIds.map(() => '?').join(', ');
        await db.runAsync(
          `UPDATE game_results SET synced = 1 WHERE id IN (${placeholders})`,
          ...syncedIds,
        );
      }
      return;
    }

    const placeholders = rows.map(() => '?').join(', ');
    await db.runAsync(
      `UPDATE game_results SET synced = 1 WHERE id IN (${placeholders})`,
      ...rows.map((row) => row.id),
    );
  } catch (error) {
    if (__DEV__) {
      console.warn('[gameResultsSync] push failed:', error);
    }
  } finally {
    pushInFlight = false;
    if (pushQueuedUserId) {
      const queuedUserId = pushQueuedUserId;
      pushQueuedUserId = null;
      void pushUnsyncedGameResults(db, queuedUserId);
    }
  }
}
