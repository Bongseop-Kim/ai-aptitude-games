import * as Crypto from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';

import type { GameResultInput } from '../../domain/games/results';
import type { GameId } from '../../domain/types';

type BestScoreRow = {
  game_id: GameId;
  score: number;
};

type GameResultOptions = {
  id?: string;
  createdAt?: string;
};

export async function insertGameResult(
  db: SQLiteDatabase,
  userId: string,
  input: GameResultInput,
  options: GameResultOptions = {},
) {
  const id = options.id ?? Crypto.randomUUID();
  const columns = ['id', 'user_id', 'game_id', 'score', 'accuracy', 'avg_response_ms'];
  const values = [id, userId, input.gameId, input.score, input.accuracy, input.avgResponseMs];

  if (options.createdAt != null) {
    columns.push('created_at');
    values.push(options.createdAt);
  }

  await db.runAsync(
    `INSERT INTO game_results (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`,
    ...values,
  );
}

export async function getBestScores(db: SQLiteDatabase, userId: string) {
  const rows = await db.getAllAsync<BestScoreRow>(
    'SELECT game_id, MAX(score) AS score FROM game_results WHERE user_id = ? GROUP BY game_id',
    userId,
  );

  const bestScores: Partial<Record<GameId, number>> = {};
  for (const row of rows) {
    bestScores[row.game_id] = row.score;
  }
  return bestScores;
}

export async function getBestScoreForGame(db: SQLiteDatabase, userId: string, gameId: GameId) {
  const row = await db.getFirstAsync<{ score: number | null }>(
    'SELECT MAX(score) AS score FROM game_results WHERE user_id = ? AND game_id = ?',
    userId,
    gameId,
  );

  return row?.score ?? null;
}
