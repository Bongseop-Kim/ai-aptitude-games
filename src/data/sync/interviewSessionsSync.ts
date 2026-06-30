import { createQueuedOutboxPush, markRowsSyncedById, sqliteDatetimeToIsoUtc } from './outboxPush';

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
  resume_id: string | null;
  job_posting_id: string | null;
};

export const pushUnsyncedInterviewSessions = createQueuedOutboxPush({
  debugTag: 'interviewSessionsSync',
  markSynced: markRowsSyncedById<UnsyncedInterviewSessionRow>('interview_sessions'),
  onConflict: 'id',
  rowDebugLabel: (row) => [row.id],
  selectSql:
    'SELECT id, user_id, company, role, score, question_count, duration_ms, created_at, mock_exam_id, resume_id, job_posting_id FROM interview_sessions WHERE synced = 0 AND user_id = ?',
  table: 'interview_sessions',
  toPayload: (row) => ({
    id: row.id,
    user_id: row.user_id,
    company: row.company,
    role: row.role,
    score: row.score,
    question_count: row.question_count,
    duration_ms: row.duration_ms,
    created_at: sqliteDatetimeToIsoUtc(row.created_at),
    mock_exam_id: row.mock_exam_id,
    resume_id: row.resume_id,
    job_posting_id: row.job_posting_id,
  }),
});
