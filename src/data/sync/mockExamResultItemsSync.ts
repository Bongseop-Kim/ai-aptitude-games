import type { SQLiteDatabase } from 'expo-sqlite';

import { createQueuedOutboxPush, sqliteDatetimeToIsoUtc } from './outboxPush';

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

async function markItemsSynced(db: SQLiteDatabase, rows: readonly UnsyncedMockExamResultItemRow[]) {
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

export const pushUnsyncedMockExamResultItems = createQueuedOutboxPush({
  debugTag: 'mockExamResultItemsSync',
  markSynced: markItemsSynced,
  onConflict: 'mock_exam_id,item_key',
  rowDebugLabel: (row) => [row.mock_exam_id, row.item_key],
  selectSql: `SELECT mock_exam_id, item_key, user_id, game_result_id, interview_session_id, score, duration_ms, completed_at
       FROM mock_exam_result_items
       WHERE synced = 0 AND user_id = ?`,
  table: 'mock_exam_result_items',
  toPayload: (row) => ({
    mock_exam_id: row.mock_exam_id,
    item_key: row.item_key,
    user_id: row.user_id,
    game_result_id: row.game_result_id,
    interview_session_id: row.interview_session_id,
    score: row.score,
    duration_ms: row.duration_ms,
    completed_at: sqliteDatetimeToIsoUtc(row.completed_at),
  }),
});
