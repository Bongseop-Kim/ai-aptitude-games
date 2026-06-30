import type { SQLiteDatabase } from 'expo-sqlite';

export const LOCAL_DB_NAME = 'ai-aptitude-games.db';

type SchemaVersionRow = {
  version: number;
};

const CURRENT_LOCAL_SCHEMA_REVISION = 14;

const localDataTables = [
  'dev_mock_exam_reports',
  'interview_answers',
  'mock_exam_result_items',
  'mock_exam_result_items_legacy',
  'game_result_rounds',
  'mock_exam_session_items',
  'mock_exam_sessions',
  'interview_sessions',
  'mock_exam_results',
  'game_results',
] as const;

const currentSchemaSql = `
  CREATE TABLE game_results (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL,
    game_id TEXT NOT NULL,
    score INTEGER NOT NULL,
    accuracy REAL NOT NULL,
    avg_response_ms INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    synced INTEGER NOT NULL DEFAULT 0,
    mock_exam_id TEXT
  );
  CREATE INDEX idx_game_results_game_id ON game_results (game_id);
  CREATE INDEX idx_game_results_unsynced ON game_results (user_id) WHERE synced = 0;

  CREATE TABLE mock_exam_results (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL,
    score INTEGER NOT NULL,
    duration_ms INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    synced INTEGER NOT NULL DEFAULT 0
  );
  CREATE INDEX idx_mock_exam_results_unsynced ON mock_exam_results (user_id) WHERE synced = 0;

  CREATE TABLE interview_sessions (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL,
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    score INTEGER NOT NULL,
    question_count INTEGER NOT NULL,
    duration_ms INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    synced INTEGER NOT NULL DEFAULT 0,
    mock_exam_id TEXT,
    resume_id TEXT,
    job_posting_id TEXT
  );
  CREATE INDEX idx_interview_sessions_unsynced ON interview_sessions (user_id) WHERE synced = 0;

  CREATE TABLE mock_exam_sessions (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE UNIQUE INDEX idx_mock_exam_sessions_user ON mock_exam_sessions (user_id);

  CREATE TABLE mock_exam_session_items (
    session_id TEXT NOT NULL,
    item_key TEXT NOT NULL,
    result_id TEXT NOT NULL,
    score INTEGER NOT NULL,
    duration_ms INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (session_id, item_key)
  );

  CREATE TABLE game_result_rounds (
    id TEXT PRIMARY KEY NOT NULL,
    result_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    round_index INTEGER NOT NULL,
    correct INTEGER NOT NULL,
    response_ms INTEGER NOT NULL,
    level_params TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    synced INTEGER NOT NULL DEFAULT 0,
    difficulty INTEGER NOT NULL DEFAULT 50 CHECK (difficulty BETWEEN 0 AND 100)
  );
  CREATE INDEX idx_game_result_rounds_result_id ON game_result_rounds (result_id);
  CREATE UNIQUE INDEX idx_game_result_rounds_result_round ON game_result_rounds (result_id, round_index);
  CREATE INDEX idx_game_result_rounds_unsynced ON game_result_rounds (user_id) WHERE synced = 0;

  CREATE TABLE mock_exam_result_items (
    mock_exam_id TEXT NOT NULL,
    item_key TEXT NOT NULL,
    user_id TEXT NOT NULL,
    game_result_id TEXT,
    interview_session_id TEXT,
    score INTEGER NOT NULL,
    duration_ms INTEGER NOT NULL,
    completed_at TEXT NOT NULL,
    synced INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (mock_exam_id, item_key),
    CHECK ((game_result_id IS NOT NULL) != (interview_session_id IS NOT NULL))
  );
  CREATE INDEX idx_mock_exam_result_items_unsynced ON mock_exam_result_items (user_id) WHERE synced = 0;

  CREATE TABLE interview_answers (
    id TEXT PRIMARY KEY NOT NULL,
    session_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    question_id TEXT NOT NULL,
    question_text TEXT NOT NULL,
    answer_text TEXT,
    category TEXT NOT NULL,
    question_source TEXT NOT NULL DEFAULT 'generic',
    prep_ms INTEGER NOT NULL,
    answer_ms INTEGER NOT NULL,
    retake_count INTEGER NOT NULL DEFAULT 0,
    media_local_uri TEXT,
    media_path TEXT,
    media_status TEXT NOT NULL DEFAULT 'none',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    synced INTEGER NOT NULL DEFAULT 0
  );
  CREATE INDEX idx_interview_answers_session_id ON interview_answers (session_id);
  CREATE UNIQUE INDEX idx_interview_answers_session_question ON interview_answers (session_id, question_id);
  CREATE INDEX idx_interview_answers_unsynced ON interview_answers (user_id) WHERE synced = 0;
  CREATE INDEX idx_interview_answers_media_pending ON interview_answers (user_id) WHERE media_status IN ('uploading', 'failed');

  CREATE TABLE dev_mock_exam_reports (
    mock_exam_id TEXT PRIMARY KEY NOT NULL,
    report TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`;

async function readCurrentSchemaRevision(db: SQLiteDatabase) {
  const latest = await db.getFirstAsync<SchemaVersionRow>(
    'SELECT MAX(version) AS version FROM schema_migrations',
  );

  return latest?.version ?? 0;
}

async function resetLocalSchema(db: SQLiteDatabase) {
  for (const table of localDataTables) {
    await db.execAsync(`DROP TABLE IF EXISTS ${table};`);
  }

  await db.execAsync(currentSchemaSql);
  await db.execAsync('DELETE FROM schema_migrations;');
  await db.runAsync(
    'INSERT INTO schema_migrations (version) VALUES (?)',
    CURRENT_LOCAL_SCHEMA_REVISION,
  );
}

export async function migrateLocalDb(db: SQLiteDatabase) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY NOT NULL,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const currentRevision = await readCurrentSchemaRevision(db);
  if (currentRevision === CURRENT_LOCAL_SCHEMA_REVISION) {
    return;
  }

  await db.withTransactionAsync(async () => {
    await resetLocalSchema(db);
  });
}
