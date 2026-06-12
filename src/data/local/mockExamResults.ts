import * as Crypto from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';

import type { MockExamRecord } from '../../domain/types';

export type MockExamResultInput = {
  score: number;
  durationMs: number;
  pro: boolean;
};

type MockExamResultOptions = {
  id?: string;
  createdAt?: string;
};

type MockExamResultRow = {
  id: string;
  score: number;
  duration_ms: number;
  pro: number;
  created_at: string;
};

function toLocalDateLabel(sqliteUtcDatetime: string) {
  const date = new Date(`${sqliteUtcDatetime.replace(' ', 'T')}Z`);
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

function formatDuration(durationMs: number) {
  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export async function insertMockExamResult(
  db: SQLiteDatabase,
  userId: string,
  input: MockExamResultInput,
  options: MockExamResultOptions = {},
) {
  const id = options.id ?? Crypto.randomUUID();
  const columns = ['id', 'user_id', 'score', 'duration_ms', 'pro'];
  const values = [id, userId, input.score, input.durationMs, input.pro ? 1 : 0];

  if (options.createdAt != null) {
    columns.push('created_at');
    values.push(options.createdAt);
  }

  await db.runAsync(
    `INSERT INTO mock_exam_results (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`,
    ...values,
  );
}

export async function getMockExamRecords(db: SQLiteDatabase, userId: string) {
  const rows = await db.getAllAsync<MockExamResultRow>(
    'SELECT id, score, duration_ms, pro, created_at FROM mock_exam_results WHERE user_id = ? ORDER BY created_at ASC',
    userId,
  );

  const records: MockExamRecord[] = rows.map((row, index) => {
    const previousScore = rows[index - 1]?.score;
    return {
      id: row.id,
      round: index + 1,
      createdAt: row.created_at,
      dateLabel: toLocalDateLabel(row.created_at),
      score: row.score,
      delta: previousScore == null ? null : row.score - previousScore,
      duration: formatDuration(row.duration_ms),
      durationMs: row.duration_ms,
      pro: row.pro === 1,
    };
  });

  return records.reverse();
}

export async function getMockExamResultCount(db: SQLiteDatabase, userId: string) {
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) AS count FROM mock_exam_results WHERE user_id = ?',
    userId,
  );

  return row?.count ?? 0;
}
