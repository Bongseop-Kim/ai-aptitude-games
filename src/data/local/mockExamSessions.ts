import * as Crypto from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';

import type { GameResultInput } from '../../domain/games/results';
import type { GameId } from '../../domain/types';
import { insertGameResult } from './gameResults';
import { insertInterviewAnswers, type InterviewAnswerInput } from './interviewAnswers';
import { insertInterviewSession, type InterviewSessionInput } from './interviewSessions';
import { insertMockExamResult } from './mockExamResults';

export type MockExamItemKey = GameId | 'interview';
export const MOCK_EXAM_ITEM_COUNT = 10;

export type MockExamSessionItem = {
  itemKey: MockExamItemKey;
  resultId: string;
  score: number;
  durationMs: number;
};

export type MockExamSessionState = {
  id: string;
  createdAt: string;
  items: MockExamSessionItem[];
};

type MockExamSessionRow = {
  id: string;
  created_at: string;
};

type MockExamSessionItemRow = {
  item_key: string;
  result_id: string;
  score: number;
  duration_ms: number;
  created_at: string;
};

function toSessionItem(row: MockExamSessionItemRow): MockExamSessionItem {
  return {
    itemKey: row.item_key as MockExamItemKey,
    resultId: row.result_id,
    score: row.score,
    durationMs: row.duration_ms,
  };
}

export async function getActiveMockExamSession(db: SQLiteDatabase, userId: string) {
  const session = await db.getFirstAsync<MockExamSessionRow>(
    'SELECT id, created_at FROM mock_exam_sessions WHERE user_id = ?',
    userId,
  );

  if (!session) {
    return null;
  }

  const rows = await db.getAllAsync<MockExamSessionItemRow>(
    'SELECT item_key, result_id, score, duration_ms, created_at FROM mock_exam_session_items WHERE session_id = ? ORDER BY created_at ASC',
    session.id,
  );

  return {
    id: session.id,
    createdAt: session.created_at,
    items: rows.map(toSessionItem),
  } satisfies MockExamSessionState;
}

export async function startMockExamSession(db: SQLiteDatabase, userId: string) {
  const id = Crypto.randomUUID();

  await db.runAsync(
    'INSERT INTO mock_exam_sessions (id, user_id) VALUES (?, ?)',
    id,
    userId,
  );

  return getActiveMockExamSession(db, userId);
}

export async function abandonMockExamSession(db: SQLiteDatabase, sessionId: string) {
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM mock_exam_session_items WHERE session_id = ?', sessionId);
    await db.runAsync('DELETE FROM mock_exam_sessions WHERE id = ?', sessionId);
  });
}

export async function completeMockExamGameItem(
  db: SQLiteDatabase,
  userId: string,
  sessionId: string,
  input: GameResultInput,
  durationMs: number,
) {
  let resultId = '';

  await db.withTransactionAsync(async () => {
    resultId = await insertGameResult(db, userId, input, { mockExamId: sessionId });
    await db.runAsync(
      'INSERT INTO mock_exam_session_items (session_id, item_key, result_id, score, duration_ms) VALUES (?, ?, ?, ?, ?)',
      sessionId,
      input.gameId,
      resultId,
      input.score,
      durationMs,
    );
  });

  return resultId;
}

export async function completeMockExamInterviewItem(
  db: SQLiteDatabase,
  userId: string,
  sessionId: string,
  input: InterviewSessionInput,
  answers: readonly InterviewAnswerInput[] = [],
  options: { resumeId?: string; jobPostingId?: string; interviewSessionId?: string } = {},
) {
  let resultId = '';

  await db.withTransactionAsync(async () => {
    resultId = await insertInterviewSession(db, userId, input, {
      id: options.interviewSessionId,
      mockExamId: sessionId,
      resumeId: options.resumeId,
      jobPostingId: options.jobPostingId,
    });
    await insertInterviewAnswers(db, userId, resultId, answers);
    await db.runAsync(
      'INSERT INTO mock_exam_session_items (session_id, item_key, result_id, score, duration_ms) VALUES (?, ?, ?, ?, ?)',
      sessionId,
      'interview',
      resultId,
      input.score,
      input.durationMs,
    );
  });

  return resultId;
}

export async function finalizeMockExamSessionIfComplete(
  db: SQLiteDatabase,
  userId: string,
  sessionId: string,
) {
  let finalizedId: string | null = null;

  await db.withTransactionAsync(async () => {
    const session = await db.getFirstAsync<{ id: string }>(
      'SELECT id FROM mock_exam_sessions WHERE id = ? AND user_id = ?',
      sessionId,
      userId,
    );

    if (!session) {
      return;
    }

    const rows = await db.getAllAsync<MockExamSessionItemRow>(
      'SELECT item_key, result_id, score, duration_ms, created_at FROM mock_exam_session_items WHERE session_id = ?',
      sessionId,
    );

    if (rows.length !== MOCK_EXAM_ITEM_COUNT) {
      return;
    }

    const totalScore = rows.reduce((sum, item) => sum + item.score, 0);
    const totalDurationMs = rows.reduce((sum, item) => sum + item.duration_ms, 0);

    await insertMockExamResult(db, userId, {
      score: Math.round(totalScore / MOCK_EXAM_ITEM_COUNT),
      durationMs: totalDurationMs,
    }, { id: sessionId });
    for (const row of rows) {
      await db.runAsync(
        `INSERT INTO mock_exam_result_items (
          id,
          mock_exam_id,
          item_key,
          user_id,
          game_result_id,
          interview_session_id,
          score,
          duration_ms,
          completed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        Crypto.randomUUID(),
        sessionId,
        row.item_key,
        userId,
        row.item_key === 'interview' ? null : row.result_id,
        row.item_key === 'interview' ? row.result_id : null,
        row.score,
        row.duration_ms,
        row.created_at,
      );
    }
    await db.runAsync('DELETE FROM mock_exam_session_items WHERE session_id = ?', sessionId);
    await db.runAsync('DELETE FROM mock_exam_sessions WHERE id = ?', sessionId);
    finalizedId = sessionId;
  });

  return finalizedId;
}
