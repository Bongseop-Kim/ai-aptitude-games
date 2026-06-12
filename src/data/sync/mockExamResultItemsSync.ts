import type { SQLiteDatabase } from 'expo-sqlite';

import { supabase } from '../../lib/supabase';

type UnsyncedMockExamResultItemRow = {
  mock_exam_id: string;
  item_key: string;
  user_id: string;
  game_result_id: string | null;
  interview_session_id: string | null;
  score: number;
  duration_ms: number;
  completed_at: string;
};

let pushInFlight = false;
let pushQueuedUserId: string | null = null;

function toIsoUtc(sqliteDatetime: string) {
  return `${sqliteDatetime.replace(' ', 'T')}Z`;
}

async function markItemsSynced(db: SQLiteDatabase, rows: UnsyncedMockExamResultItemRow[]) {
  if (rows.length === 0) {
    return;
  }

  const conditions = rows.map(() => '(mock_exam_id = ? AND item_key = ?)').join(' OR ');
  const values = rows.flatMap((row) => [row.mock_exam_id, row.item_key]);

  await db.runAsync(
    `UPDATE mock_exam_result_items SET synced = 1 WHERE ${conditions}`,
    ...values,
  );
}

export async function pushUnsyncedMockExamResultItems(db: SQLiteDatabase, userId: string) {
  if (pushInFlight) {
    pushQueuedUserId = userId;
    return;
  }
  pushInFlight = true;

  try {
    const rows = await db.getAllAsync<UnsyncedMockExamResultItemRow>(
      `SELECT mock_exam_id, item_key, user_id, game_result_id, interview_session_id, score, duration_ms, completed_at
       FROM mock_exam_result_items
       WHERE synced = 0 AND user_id = ?`,
      userId,
    );
    if (rows.length === 0) {
      return;
    }

    const payload = rows.map((row) => ({
      mock_exam_id: row.mock_exam_id,
      item_key: row.item_key,
      user_id: row.user_id,
      game_result_id: row.game_result_id,
      interview_session_id: row.interview_session_id,
      score: row.score,
      duration_ms: row.duration_ms,
      completed_at: toIsoUtc(row.completed_at),
    }));

    const { error } = await supabase
      .from('mock_exam_result_items')
      .upsert(payload, { onConflict: 'mock_exam_id,item_key', ignoreDuplicates: true });
    if (error) {
      if (__DEV__) {
        console.warn('[mockExamResultItemsSync] push failed:', error.message);
      }
      const syncedRows: UnsyncedMockExamResultItemRow[] = [];
      for (const [index, row] of payload.entries()) {
        const { error: rowError } = await supabase
          .from('mock_exam_result_items')
          .upsert(row, { onConflict: 'mock_exam_id,item_key', ignoreDuplicates: true });
        if (rowError) {
          if (__DEV__) {
            console.warn(
              '[mockExamResultItemsSync] row push failed:',
              row.mock_exam_id,
              row.item_key,
              rowError.message,
            );
          }
          continue;
        }
        syncedRows.push(rows[index]);
      }
      await markItemsSynced(db, syncedRows);
      return;
    }

    await markItemsSynced(db, rows);
  } catch (error) {
    if (__DEV__) {
      console.warn('[mockExamResultItemsSync] push failed:', error);
    }
  } finally {
    pushInFlight = false;
    if (pushQueuedUserId) {
      const queuedUserId = pushQueuedUserId;
      pushQueuedUserId = null;
      void pushUnsyncedMockExamResultItems(db, queuedUserId);
    }
  }
}
