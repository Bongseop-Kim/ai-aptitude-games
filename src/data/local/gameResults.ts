import * as Crypto from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';

import type { GameResultInput } from '../../domain/games/results';
import type { GameId } from '../../domain/types';

type BestScoreRow = {
  game_id: GameId;
  score: number;
};

export async function insertGameResult(
  db: SQLiteDatabase,
  userId: string,
  input: GameResultInput,
) {
  await db.runAsync(
    'INSERT INTO game_results (id, user_id, game_id, score, accuracy, avg_response_ms) VALUES (?, ?, ?, ?, ?, ?)',
    Crypto.randomUUID(),
    userId,
    input.gameId,
    input.score,
    input.accuracy,
    input.avgResponseMs,
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
