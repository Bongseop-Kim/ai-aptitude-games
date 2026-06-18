import type { SQLiteDatabase } from 'expo-sqlite';

import { supabase } from '../../lib/supabase';

type UnsyncedGameResultRoundRow = {
  id: string;
  result_id: string;
  user_id: string;
  round_index: number;
  correct: number;
  response_ms: number;
  difficulty: number;
  level_params: string | null;
  created_at: string;
};

let pushInFlight = false;
let pushQueuedUserId: string | null = null;

function toIsoUtc(sqliteDatetime: string) {
  return `${sqliteDatetime.replace(' ', 'T')}Z`;
}

function parseLevelParams(value: string | null) {
  return value == null ? null : JSON.parse(value);
}

export async function pushUnsyncedGameResultRounds(db: SQLiteDatabase, userId: string) {
  if (pushInFlight) {
    pushQueuedUserId = userId;
    return;
  }
  pushInFlight = true;

  try {
    const rows = await db.getAllAsync<UnsyncedGameResultRoundRow>(
      `SELECT id, result_id, user_id, round_index, correct, response_ms, difficulty, level_params, created_at
       FROM game_result_rounds
       WHERE synced = 0 AND user_id = ?`,
      userId,
    );
    if (rows.length === 0) {
      return;
    }

    const payload = rows.map((row) => ({
      id: row.id,
      result_id: row.result_id,
      user_id: row.user_id,
      round_index: row.round_index,
      correct: row.correct === 1,
      response_ms: row.response_ms,
      difficulty: row.difficulty,
      level_params: parseLevelParams(row.level_params),
      created_at: toIsoUtc(row.created_at),
    }));

    const { error } = await supabase
      .from('game_result_rounds')
      .upsert(payload, { onConflict: 'id', ignoreDuplicates: true });
    if (error) {
      if (__DEV__) {
        console.warn('[gameResultRoundsSync] push failed:', error.message);
      }
      const syncedIds: string[] = [];
      for (const row of payload) {
        const { error: rowError } = await supabase
          .from('game_result_rounds')
          .upsert(row, { onConflict: 'id', ignoreDuplicates: true });
        if (rowError) {
          if (__DEV__) {
            console.warn('[gameResultRoundsSync] row push failed:', row.id, rowError.message);
          }
          continue;
        }
        syncedIds.push(row.id);
      }
      if (syncedIds.length > 0) {
        const placeholders = syncedIds.map(() => '?').join(', ');
        await db.runAsync(
          `UPDATE game_result_rounds SET synced = 1 WHERE id IN (${placeholders})`,
          ...syncedIds,
        );
      }
      return;
    }

    const placeholders = rows.map(() => '?').join(', ');
    await db.runAsync(
      `UPDATE game_result_rounds SET synced = 1 WHERE id IN (${placeholders})`,
      ...rows.map((row) => row.id),
    );
  } catch (error) {
    if (__DEV__) {
      console.warn('[gameResultRoundsSync] push failed:', error);
    }
  } finally {
    pushInFlight = false;
    if (pushQueuedUserId) {
      const queuedUserId = pushQueuedUserId;
      pushQueuedUserId = null;
      void pushUnsyncedGameResultRounds(db, queuedUserId);
    }
  }
}
