import { createQueuedOutboxPush, markRowsSyncedById, sqliteDatetimeToIsoUtc } from './outboxPush';

type UnsyncedMockExamResultItemRow = {
  id: string;
  mock_exam_id: string;
  item_key: string;
  user_id: string;
  game_result_id: string | null;
  interview_session_id: string | null;
  score: number;
  duration_ms: number;
  completed_at: string;
};

export const pushUnsyncedMockExamResultItems = createQueuedOutboxPush({
  debugTag: 'mockExamResultItemsSync',
  markSynced: markRowsSyncedById<UnsyncedMockExamResultItemRow>('mock_exam_result_items'),
  onConflict: 'id',
  rowDebugLabel: (row) => [row.id],
  selectSql: `SELECT id, mock_exam_id, item_key, user_id, game_result_id, interview_session_id, score, duration_ms, completed_at
       FROM mock_exam_result_items
       WHERE synced = 0 AND user_id = ?`,
  table: 'mock_exam_result_items',
  toPayload: (row) => ({
    id: row.id,
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
