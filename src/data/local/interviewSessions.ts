import * as Crypto from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';

import type { InterviewSessionRecord } from '../../domain/types';

export type InterviewSessionInput = {
  company: string;
  role: string;
  score: number;
  questionCount: number;
  durationMs: number;
};

type InterviewSessionOptions = {
  id?: string;
  createdAt?: string;
};

type InterviewSessionRow = {
  id: string;
  company: string;
  role: string;
  score: number;
  question_count: number;
  duration_ms: number;
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

export async function insertInterviewSession(
  db: SQLiteDatabase,
  userId: string,
  input: InterviewSessionInput,
  options: InterviewSessionOptions = {},
) {
  const id = options.id ?? Crypto.randomUUID();
  const columns = ['id', 'user_id', 'company', 'role', 'score', 'question_count', 'duration_ms'];
  const values = [
    id,
    userId,
    input.company,
    input.role,
    input.score,
    input.questionCount,
    input.durationMs,
  ];

  if (options.createdAt != null) {
    columns.push('created_at');
    values.push(options.createdAt);
  }

  await db.runAsync(
    `INSERT INTO interview_sessions (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`,
    ...values,
  );

  return id;
}

export async function getInterviewSessionRecords(db: SQLiteDatabase, userId: string) {
  const rows = await db.getAllAsync<InterviewSessionRow>(
    'SELECT id, company, role, score, question_count, duration_ms, created_at FROM interview_sessions WHERE user_id = ? ORDER BY created_at ASC',
    userId,
  );

  const records: InterviewSessionRecord[] = rows.map((row, index) => {
    const previousScore = rows[index - 1]?.score;
    return {
      id: row.id,
      round: index + 1,
      createdAt: row.created_at,
      dateLabel: toLocalDateLabel(row.created_at),
      company: row.company,
      role: row.role,
      score: row.score,
      delta: previousScore == null ? null : row.score - previousScore,
      questionCount: row.question_count,
      duration: formatDuration(row.duration_ms),
      durationMs: row.duration_ms,
    };
  });

  return records.reverse();
}

export async function getInterviewSessionCount(db: SQLiteDatabase, userId: string) {
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) AS count FROM interview_sessions WHERE user_id = ?',
    userId,
  );

  return row?.count ?? 0;
}
