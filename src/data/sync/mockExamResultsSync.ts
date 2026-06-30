import { createQueuedOutboxPush, markRowsSyncedById, sqliteDatetimeToIsoUtc } from './outboxPush';

type UnsyncedMockExamResultRow = {
  id: string;
  user_id: string;
  score: number;
  duration_ms: number;
  created_at: string;
};

/**
 * Silent outbox push (AGENTS.md > Data): upload local rows with synced = 0,
 * then mark them synced. Failures are swallowed — the next trigger
 * (save / login / foreground) retries.
 */
export const pushUnsyncedMockExamResults = createQueuedOutboxPush({
  debugTag: 'mockExamResultsSync',
  markSynced: markRowsSyncedById<UnsyncedMockExamResultRow>('mock_exam_results'),
  onConflict: 'id',
  rowDebugLabel: (row) => [row.id],
  selectSql:
    'SELECT id, user_id, score, duration_ms, created_at FROM mock_exam_results WHERE synced = 0 AND user_id = ?',
  table: 'mock_exam_results',
  toPayload: (row) => ({
    id: row.id,
    user_id: row.user_id,
    score: row.score,
    duration_ms: row.duration_ms,
    created_at: sqliteDatetimeToIsoUtc(row.created_at),
  }),
});
