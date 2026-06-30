import { createQueuedOutboxPush, markRowsSyncedById, sqliteDatetimeToIsoUtc } from './outboxPush';

type UnsyncedInterviewAnswerRow = {
  id: string;
  session_id: string;
  user_id: string;
  question_id: string;
  question_text: string;
  answer_text: string | null;
  category: string;
  question_source: string;
  prep_ms: number;
  answer_ms: number;
  retake_count: number;
  media_path: string | null;
  media_status: string;
  created_at: string;
};

export const pushUnsyncedInterviewAnswers = createQueuedOutboxPush({
  debugTag: 'interviewAnswersSync',
  markSynced: markRowsSyncedById<UnsyncedInterviewAnswerRow>('interview_answers'),
  onConflict: 'id',
  rowDebugLabel: (row) => [row.id],
  selectSql:
    'SELECT id, session_id, user_id, question_id, question_text, answer_text, category, question_source, prep_ms, answer_ms, retake_count, media_path, media_status, created_at FROM interview_answers WHERE synced = 0 AND user_id = ?',
  table: 'interview_answers',
  toPayload: (row) => ({
    id: row.id,
    session_id: row.session_id,
    user_id: row.user_id,
    question_id: row.question_id,
    question_text: row.question_text,
    answer_text: row.answer_text,
    category: row.category,
    question_source: row.question_source,
    prep_ms: row.prep_ms,
    answer_ms: row.answer_ms,
    retake_count: row.retake_count,
    media_path: row.media_path,
    media_status: row.media_status,
    created_at: sqliteDatetimeToIsoUtc(row.created_at),
  }),
});
