import type { SQLiteDatabase } from 'expo-sqlite';

import { supabase } from '../../lib/supabase';

type UnsyncedInterviewSessionRow = {
  id: string;
  user_id: string;
  company: string;
  role: string;
  score: number;
  question_count: number;
  duration_ms: number;
  created_at: string;
  mock_exam_id: string | null;
};

let pushInFlight = false;
let pushQueuedUserId: string | null = null;

function toIsoUtc(sqliteDatetime: string) {
  return `${sqliteDatetime.replace(' ', 'T')}Z`;
}

export async function pushUnsyncedInterviewSessions(db: SQLiteDatabase, userId: string) {
  if (pushInFlight) {
    pushQueuedUserId = userId;
    return;
  }
  pushInFlight = true;

  try {
    const rows = await db.getAllAsync<UnsyncedInterviewSessionRow>(
      'SELECT id, user_id, company, role, score, question_count, duration_ms, created_at, mock_exam_id FROM interview_sessions WHERE synced = 0 AND user_id = ?',
      userId,
    );
    if (rows.length === 0) {
      return;
    }

    const payload = rows.map((row) => ({
      id: row.id,
      user_id: row.user_id,
      company: row.company,
      role: row.role,
      score: row.score,
      question_count: row.question_count,
      duration_ms: row.duration_ms,
      created_at: toIsoUtc(row.created_at),
      mock_exam_id: row.mock_exam_id,
    }));

    const { error } = await supabase
      .from('interview_sessions')
      .upsert(payload, { onConflict: 'id', ignoreDuplicates: true });
    if (error) {
      if (__DEV__) {
        console.warn('[interviewSessionsSync] push failed:', error.message);
      }
      const syncedIds: string[] = [];
      for (const row of payload) {
        const { error: rowError } = await supabase
          .from('interview_sessions')
          .upsert(row, { onConflict: 'id', ignoreDuplicates: true });
        if (rowError) {
          if (__DEV__) {
            console.warn('[interviewSessionsSync] row push failed:', row.id, rowError.message);
          }
          continue;
        }
        syncedIds.push(row.id);
      }
      if (syncedIds.length > 0) {
        const placeholders = syncedIds.map(() => '?').join(', ');
        await db.runAsync(
          `UPDATE interview_sessions SET synced = 1 WHERE id IN (${placeholders})`,
          ...syncedIds,
        );
      }
      return;
    }

    const placeholders = rows.map(() => '?').join(', ');
    await db.runAsync(
      `UPDATE interview_sessions SET synced = 1 WHERE id IN (${placeholders})`,
      ...rows.map((row) => row.id),
    );
  } catch (error) {
    if (__DEV__) {
      console.warn('[interviewSessionsSync] push failed:', error);
    }
  } finally {
    pushInFlight = false;
    if (pushQueuedUserId) {
      const queuedUserId = pushQueuedUserId;
      pushQueuedUserId = null;
      void pushUnsyncedInterviewSessions(db, queuedUserId);
    }
  }
}
