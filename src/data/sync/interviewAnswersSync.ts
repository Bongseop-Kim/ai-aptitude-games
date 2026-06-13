import type { SQLiteDatabase } from 'expo-sqlite';

import { supabase } from '../../lib/supabase';

type UnsyncedInterviewAnswerRow = {
  id: string;
  session_id: string;
  user_id: string;
  question_id: string;
  question_text: string;
  category: string;
  question_source: string;
  prep_ms: number;
  answer_ms: number;
  retake_count: number;
  media_path: string | null;
  media_status: string;
  created_at: string;
};

let pushInFlight = false;
let pushQueuedUserId: string | null = null;

// Converts SQLite UTC datetimes ("YYYY-MM-DD HH:MM:SS") to ISO 8601 by
// replacing the space with "T" and appending "Z"; assumes input is already UTC.
function toIsoUtc(sqliteDatetime: string) {
  return `${sqliteDatetime.replace(' ', 'T')}Z`;
}

export async function pushUnsyncedInterviewAnswers(db: SQLiteDatabase, userId: string) {
  if (pushInFlight) {
    pushQueuedUserId = userId;
    return;
  }
  pushInFlight = true;

  try {
    const rows = await db.getAllAsync<UnsyncedInterviewAnswerRow>(
      'SELECT id, session_id, user_id, question_id, question_text, category, question_source, prep_ms, answer_ms, retake_count, media_path, media_status, created_at FROM interview_answers WHERE synced = 0 AND user_id = ?',
      userId,
    );
    if (rows.length === 0) {
      return;
    }

    const payload = rows.map((row) => ({
      id: row.id,
      session_id: row.session_id,
      user_id: row.user_id,
      question_id: row.question_id,
      question_text: row.question_text,
      category: row.category,
      question_source: row.question_source,
      prep_ms: row.prep_ms,
      answer_ms: row.answer_ms,
      retake_count: row.retake_count,
      media_path: row.media_path,
      media_status: row.media_status,
      created_at: toIsoUtc(row.created_at),
    }));

    const { error } = await supabase
      .from('interview_answers')
      .upsert(payload, { onConflict: 'id', ignoreDuplicates: true });
    if (error) {
      if (__DEV__) {
        console.warn('[interviewAnswersSync] push failed:', error.message);
      }
      const syncedIds: string[] = [];
      for (const row of payload) {
        const { error: rowError } = await supabase
          .from('interview_answers')
          .upsert(row, { onConflict: 'id', ignoreDuplicates: true });
        if (rowError) {
          if (__DEV__) {
            console.warn('[interviewAnswersSync] row push failed:', row.id, rowError.message);
          }
          continue;
        }
        syncedIds.push(row.id);
      }
      if (syncedIds.length > 0) {
        const placeholders = syncedIds.map(() => '?').join(', ');
        await db.runAsync(
          `UPDATE interview_answers SET synced = 1 WHERE id IN (${placeholders})`,
          ...syncedIds,
        );
      }
      return;
    }

    const placeholders = rows.map(() => '?').join(', ');
    await db.runAsync(
      `UPDATE interview_answers SET synced = 1 WHERE id IN (${placeholders})`,
      ...rows.map((row) => row.id),
    );
  } catch (error) {
    if (__DEV__) {
      console.warn('[interviewAnswersSync] push failed:', error);
    }
  } finally {
    pushInFlight = false;
    if (pushQueuedUserId) {
      const queuedUserId = pushQueuedUserId;
      pushQueuedUserId = null;
      void pushUnsyncedInterviewAnswers(db, queuedUserId);
    }
  }
}
