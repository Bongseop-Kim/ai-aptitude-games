import * as Crypto from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';

import type { GameResultInput } from '../../domain/games/results';
import type { GameId } from '../../domain/types';

type BestScoreRow = {
  game_id: GameId;
  score: number;
};

export type GameResultRecord = {
  id: string;
  gameId: GameId;
  score: number;
  accuracy: number;
  avgResponseMs: number;
  createdAt: string;
};

type GameResultRow = {
  id: string;
  game_id: GameId;
  score: number;
  accuracy: number;
  avg_response_ms: number;
  created_at: string;
};

type GameResultOptions = {
  id?: string;
  createdAt?: string;
  mockExamId?: string;
};

function toGameResultRecord(row: GameResultRow): GameResultRecord {
  return {
    id: row.id,
    gameId: row.game_id,
    score: row.score,
    accuracy: row.accuracy,
    avgResponseMs: row.avg_response_ms,
    createdAt: row.created_at,
  };
}

export async function insertGameResult(
  db: SQLiteDatabase,
  userId: string,
  input: GameResultInput,
  options: GameResultOptions = {},
) {
  const id = options.id ?? Crypto.randomUUID();
  const columns = ['id', 'user_id', 'game_id', 'score', 'accuracy', 'avg_response_ms'];
  const values = [id, userId, input.gameId, input.score, input.accuracy, input.avgResponseMs];

  if (options.mockExamId != null) {
    columns.push('mock_exam_id');
    values.push(options.mockExamId);
  }

  if (options.createdAt != null) {
    columns.push('created_at');
    values.push(options.createdAt);
  }

  await db.runAsync(
    `INSERT INTO game_results (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`,
    ...values,
  );

  for (const round of input.rounds) {
    await db.runAsync(
      `INSERT INTO game_result_rounds (
        id,
        result_id,
        user_id,
        round_index,
        correct,
        response_ms,
        level_params
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      Crypto.randomUUID(),
      id,
      userId,
      round.roundIndex,
      round.correct ? 1 : 0,
      round.responseMs,
      round.levelParams == null ? null : JSON.stringify(round.levelParams),
    );
  }

  return id;
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

export async function getGameResultsForMockExam(
  db: SQLiteDatabase,
  userId: string,
  mockExamId: string,
) {
  const rows = await db.getAllAsync<GameResultRow>(
    `SELECT id, game_id, score, accuracy, avg_response_ms, created_at
     FROM game_results
     WHERE user_id = ? AND mock_exam_id = ?`,
    userId,
    mockExamId,
  );

  const resultMap: Partial<Record<GameId, GameResultRecord>> = {};
  for (const row of rows) {
    resultMap[row.game_id] = toGameResultRecord(row);
  }

  return resultMap;
}
