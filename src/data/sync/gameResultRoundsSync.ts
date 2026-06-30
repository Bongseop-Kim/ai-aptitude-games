import { createQueuedOutboxPush, markRowsSyncedById, sqliteDatetimeToIsoUtc } from './outboxPush';

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

function parseLevelParams(value: string | null) {
  return value == null ? null : JSON.parse(value);
}

export const pushUnsyncedGameResultRounds = createQueuedOutboxPush({
  debugTag: 'gameResultRoundsSync',
  markSynced: markRowsSyncedById<UnsyncedGameResultRoundRow>('game_result_rounds'),
  onConflict: 'id',
  rowDebugLabel: (row) => [row.id],
  selectSql: `SELECT id, result_id, user_id, round_index, correct, response_ms, difficulty, level_params, created_at
       FROM game_result_rounds
       WHERE synced = 0 AND user_id = ?`,
  table: 'game_result_rounds',
  toPayload: (row) => ({
    id: row.id,
    result_id: row.result_id,
    user_id: row.user_id,
    round_index: row.round_index,
    correct: row.correct === 1,
    response_ms: row.response_ms,
    difficulty: row.difficulty,
    level_params: parseLevelParams(row.level_params),
    created_at: sqliteDatetimeToIsoUtc(row.created_at),
  }),
});
