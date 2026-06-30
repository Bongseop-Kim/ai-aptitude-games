import { createQueuedOutboxPush, markRowsSyncedById, sqliteDatetimeToIsoUtc } from './outboxPush';

type UnsyncedGameResultRow = {
  id: string;
  user_id: string;
  game_id: string;
  score: number;
  accuracy: number;
  avg_response_ms: number;
  created_at: string;
  mock_exam_id: string | null;
};

/**
 * Silent outbox push (AGENTS.md > Data): upload local rows with synced = 0,
 * then mark them synced. Failures are swallowed — the next trigger
 * (save / login / foreground) retries.
 */
export const pushUnsyncedGameResults = createQueuedOutboxPush({
  debugTag: 'gameResultsSync',
  markSynced: markRowsSyncedById<UnsyncedGameResultRow>('game_results'),
  onConflict: 'id',
  rowDebugLabel: (row) => [row.id],
  selectSql:
    'SELECT id, user_id, game_id, score, accuracy, avg_response_ms, created_at, mock_exam_id FROM game_results WHERE synced = 0 AND user_id = ?',
  table: 'game_results',
  toPayload: (row) => ({
    id: row.id,
    user_id: row.user_id,
    game_id: row.game_id,
    score: row.score,
    accuracy: row.accuracy,
    avg_response_ms: row.avg_response_ms,
    created_at: sqliteDatetimeToIsoUtc(row.created_at),
    mock_exam_id: row.mock_exam_id,
  }),
});
