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
  mockExamId?: string;
};

type InterviewSessionRow = {
  id: string;
  company: string;
  role: string;
  score: number;
  question_count: number;
  duration_ms: number;
  created_at: string;
  mock_exam_id: string | null;
};

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

function toLocalDateLabel(sqliteUtcDatetime: string) {
  const utcTime = new Date(`${sqliteUtcDatetime.replace(' ', 'T')}Z`).getTime();
  const kstDate = new Date(utcTime + KST_OFFSET_MS);
  return `${kstDate.getUTCMonth() + 1}월 ${kstDate.getUTCDate()}일`;
}

function formatDuration(durationMs: number) {
  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function validateInterviewSessionInput(input: InterviewSessionInput) {
  if (!Number.isFinite(input.score) || input.score < 0 || input.score > 100) {
    throw new Error('Interview session score must be a number between 0 and 100.');
  }
  if (!Number.isInteger(input.questionCount) || input.questionCount <= 0) {
    throw new Error('Interview session questionCount must be a positive integer.');
  }
  if (!Number.isFinite(input.durationMs) || input.durationMs < 0) {
    throw new Error('Interview session durationMs must be a non-negative number.');
  }
}

export async function insertInterviewSession(
  db: SQLiteDatabase,
  userId: string,
  input: InterviewSessionInput,
  options: InterviewSessionOptions = {},
) {
  validateInterviewSessionInput(input);

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

  if (options.mockExamId != null) {
    columns.push('mock_exam_id');
    values.push(options.mockExamId);
  }

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
    'SELECT id, company, role, score, question_count, duration_ms, created_at, mock_exam_id FROM interview_sessions WHERE user_id = ? ORDER BY created_at ASC',
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
      mockExamId: row.mock_exam_id,
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
