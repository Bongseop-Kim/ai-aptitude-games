import * as Crypto from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';

export type InterviewAnswerInput = {
  questionId: string;
  questionText: string;
  category: string;
  questionSource: 'generic' | 'job_posting' | 'resume';
  prepMs: number;
  answerMs: number;
  retakeCount: number;
  mediaLocalUri: string | null;
};

export type InterviewAnswerMediaStatus = 'none' | 'uploading' | 'uploaded' | 'failed';

export type InterviewAnswerRow = {
  id: string;
  sessionId: string;
  questionId: string;
  questionText: string;
  category: string;
  questionSource: InterviewAnswerInput['questionSource'];
  prepMs: number;
  answerMs: number;
  retakeCount: number;
  mediaLocalUri: string | null;
  mediaPath: string | null;
  mediaStatus: InterviewAnswerMediaStatus;
};

type InterviewAnswerDbRow = {
  id: string;
  session_id: string;
  question_id: string;
  question_text: string;
  category: string;
  question_source: InterviewAnswerInput['questionSource'];
  prep_ms: number;
  answer_ms: number;
  retake_count: number;
  media_local_uri: string | null;
  media_path: string | null;
  media_status: InterviewAnswerMediaStatus;
};

function toInterviewAnswerRow(row: InterviewAnswerDbRow): InterviewAnswerRow {
  return {
    id: row.id,
    sessionId: row.session_id,
    questionId: row.question_id,
    questionText: row.question_text,
    category: row.category,
    questionSource: row.question_source,
    prepMs: row.prep_ms,
    answerMs: row.answer_ms,
    retakeCount: row.retake_count,
    mediaLocalUri: row.media_local_uri,
    mediaPath: row.media_path,
    mediaStatus: row.media_status,
  };
}

const SELECT_COLUMNS =
  'id, session_id, question_id, question_text, category, question_source, prep_ms, answer_ms, retake_count, media_local_uri, media_path, media_status';

// Does not open a transaction; callers wrap the combined session + answers save
// in a single db.withTransactionAsync (see completeMockExamInterviewItem).
export async function insertInterviewAnswers(
  db: SQLiteDatabase,
  userId: string,
  sessionId: string,
  inputs: readonly InterviewAnswerInput[],
) {
  const ids: string[] = [];

  for (const input of inputs) {
    const id = Crypto.randomUUID();
    const mediaStatus: InterviewAnswerMediaStatus = input.mediaLocalUri ? 'uploading' : 'none';

    await db.runAsync(
      `INSERT INTO interview_answers (
        id,
        session_id,
        user_id,
        question_id,
        question_text,
        category,
        question_source,
        prep_ms,
        answer_ms,
        retake_count,
        media_local_uri,
        media_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id,
      sessionId,
      userId,
      input.questionId,
      input.questionText,
      input.category,
      input.questionSource,
      input.prepMs,
      input.answerMs,
      input.retakeCount,
      input.mediaLocalUri,
      mediaStatus,
    );

    ids.push(id);
  }

  return ids;
}

export async function getInterviewAnswersBySession(db: SQLiteDatabase, sessionId: string) {
  const rows = await db.getAllAsync<InterviewAnswerDbRow>(
    `SELECT ${SELECT_COLUMNS} FROM interview_answers WHERE session_id = ? ORDER BY created_at ASC`,
    sessionId,
  );

  return rows.map(toInterviewAnswerRow);
}

export async function getInterviewAnswerById(db: SQLiteDatabase, id: string) {
  const row = await db.getFirstAsync<InterviewAnswerDbRow>(
    `SELECT ${SELECT_COLUMNS} FROM interview_answers WHERE id = ?`,
    id,
  );

  return row == null ? null : toInterviewAnswerRow(row);
}

export async function getPendingMediaAnswers(db: SQLiteDatabase, userId: string) {
  const rows = await db.getAllAsync<InterviewAnswerDbRow>(
    `SELECT ${SELECT_COLUMNS} FROM interview_answers WHERE user_id = ? AND media_status IN ('uploading', 'failed')`,
    userId,
  );

  return rows.map(toInterviewAnswerRow);
}

export async function markInterviewAnswerMediaUploading(db: SQLiteDatabase, id: string) {
  await db.runAsync(
    "UPDATE interview_answers SET media_status = 'uploading' WHERE id = ?",
    id,
  );
}

// synced stays as-is: the upload manager writes media_path/media_status to the
// server directly, so this only updates the local row.
export async function markInterviewAnswerMediaUploaded(
  db: SQLiteDatabase,
  id: string,
  mediaPath: string,
) {
  await db.runAsync(
    "UPDATE interview_answers SET media_path = ?, media_status = 'uploaded', media_local_uri = NULL WHERE id = ?",
    mediaPath,
    id,
  );
}

export async function markInterviewAnswerMediaFailed(
  db: SQLiteDatabase,
  id: string,
  options: { fileLost?: boolean } = {},
) {
  if (options.fileLost) {
    await db.runAsync(
      "UPDATE interview_answers SET media_status = 'failed', media_local_uri = NULL WHERE id = ?",
      id,
    );
    return;
  }

  await db.runAsync(
    "UPDATE interview_answers SET media_status = 'failed' WHERE id = ?",
    id,
  );
}
