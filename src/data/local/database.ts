import type { SQLiteDatabase } from 'expo-sqlite';

export const LOCAL_DB_NAME = 'ai-aptitude-games.db';
export const LOCAL_DB_SCHEMA_VERSION = 9;

type SchemaVersionRow = {
  version: number;
};

const migrations: readonly { version: number; sql: string }[] = [
  { version: 1, sql: '' },
  {
    version: 2,
    sql: `
      CREATE TABLE IF NOT EXISTS game_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        game_id TEXT NOT NULL,
        score INTEGER NOT NULL,
        accuracy REAL NOT NULL,
        avg_response_ms INTEGER NOT NULL,
        played_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE INDEX IF NOT EXISTS idx_game_results_game_id ON game_results (game_id);
    `,
  },
  {
    version: 3,
    sql: `
      DROP TABLE IF EXISTS game_results;
      CREATE TABLE game_results (
        id TEXT PRIMARY KEY NOT NULL,
        game_id TEXT NOT NULL,
        score INTEGER NOT NULL,
        accuracy REAL NOT NULL,
        avg_response_ms INTEGER NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        synced INTEGER NOT NULL DEFAULT 0
      );
      CREATE INDEX IF NOT EXISTS idx_game_results_game_id ON game_results (game_id);
    `,
  },
  {
    version: 4,
    sql: `
      DROP TABLE IF EXISTS game_results;
      CREATE TABLE game_results (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL,
        game_id TEXT NOT NULL,
        score INTEGER NOT NULL,
        accuracy REAL NOT NULL,
        avg_response_ms INTEGER NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        synced INTEGER NOT NULL DEFAULT 0
      );
      CREATE INDEX IF NOT EXISTS idx_game_results_game_id ON game_results (game_id);
      CREATE INDEX IF NOT EXISTS idx_game_results_unsynced ON game_results (user_id) WHERE synced = 0;
    `,
  },
  {
    version: 5,
    sql: `
      CREATE TABLE mock_exam_results (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL,
        score INTEGER NOT NULL,
        duration_ms INTEGER NOT NULL,
        pro INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        synced INTEGER NOT NULL DEFAULT 0
      );
      CREATE INDEX IF NOT EXISTS idx_mock_exam_results_unsynced ON mock_exam_results (user_id) WHERE synced = 0;
    `,
  },
  {
    version: 6,
    sql: `
      CREATE TABLE interview_sessions (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL,
        company TEXT NOT NULL,
        role TEXT NOT NULL,
        score INTEGER NOT NULL,
        question_count INTEGER NOT NULL,
        duration_ms INTEGER NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        synced INTEGER NOT NULL DEFAULT 0
      );
      CREATE INDEX IF NOT EXISTS idx_interview_sessions_unsynced ON interview_sessions (user_id) WHERE synced = 0;
    `,
  },
  {
    version: 7,
    sql: `
      -- Local-only in-progress sessions; final records sync through mock_exam_results.
      CREATE TABLE mock_exam_sessions (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE UNIQUE INDEX idx_mock_exam_sessions_user ON mock_exam_sessions (user_id);

      -- Local-only completion tracker; synced is intentionally omitted.
      CREATE TABLE mock_exam_session_items (
        session_id TEXT NOT NULL,
        item_key TEXT NOT NULL,
        result_id TEXT NOT NULL,
        score INTEGER NOT NULL,
        duration_ms INTEGER NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        PRIMARY KEY (session_id, item_key)
      );

      ALTER TABLE game_results ADD COLUMN mock_exam_id TEXT;
      ALTER TABLE interview_sessions ADD COLUMN mock_exam_id TEXT;
    `,
  },
  {
    version: 8,
    sql: `
      CREATE TABLE IF NOT EXISTS game_result_rounds (
        id TEXT PRIMARY KEY NOT NULL,
        result_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        round_index INTEGER NOT NULL,
        correct INTEGER NOT NULL,
        response_ms INTEGER NOT NULL,
        level_params TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        synced INTEGER NOT NULL DEFAULT 0
      );
      CREATE INDEX IF NOT EXISTS idx_game_result_rounds_result_id ON game_result_rounds (result_id);
      CREATE UNIQUE INDEX IF NOT EXISTS idx_game_result_rounds_result_round ON game_result_rounds (result_id, round_index);
      CREATE INDEX IF NOT EXISTS idx_game_result_rounds_unsynced ON game_result_rounds (user_id) WHERE synced = 0;

      CREATE TABLE IF NOT EXISTS mock_exam_result_items (
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
      CREATE INDEX IF NOT EXISTS idx_mock_exam_result_items_unsynced ON mock_exam_result_items (user_id) WHERE synced = 0;
    `,
  },
  {
    version: 9,
    sql: `
      CREATE UNIQUE INDEX IF NOT EXISTS idx_game_result_rounds_result_round ON game_result_rounds (result_id, round_index);
      CREATE INDEX IF NOT EXISTS idx_mock_exam_result_items_unsynced ON mock_exam_result_items (user_id) WHERE synced = 0;
    `,
  },
];

async function migrateMockExamResultItems(db: SQLiteDatabase) {
  const columns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(mock_exam_result_items)');
  const hasLegacyResultId = columns.some((column) => column.name === 'result_id');
  if (!hasLegacyResultId) {
    return;
  }

  const legacyColumns = await db.getAllAsync<{ name: string }>(
    'PRAGMA table_info(mock_exam_result_items_legacy)',
  );
  if (legacyColumns.length === 0) {
    await db.execAsync('ALTER TABLE mock_exam_result_items RENAME TO mock_exam_result_items_legacy;');
  }

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS mock_exam_result_items (
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
  `);

  await db.runAsync(`
    INSERT OR IGNORE INTO mock_exam_result_items (
      mock_exam_id,
      item_key,
      user_id,
      game_result_id,
      interview_session_id,
      score,
      duration_ms,
      completed_at,
      synced
    )
    SELECT
      mock_exam_id,
      item_key,
      user_id,
      CASE WHEN item_key = 'interview' THEN NULL ELSE result_id END,
      CASE WHEN item_key = 'interview' THEN result_id ELSE NULL END,
      score,
      duration_ms,
      completed_at,
      synced
    FROM mock_exam_result_items_legacy
  `);
}

export async function migrateLocalDb(db: SQLiteDatabase) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY NOT NULL,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const latest = await db.getFirstAsync<SchemaVersionRow>(
    'SELECT MAX(version) AS version FROM schema_migrations',
  );
  const currentVersion = latest?.version ?? 0;

  if (currentVersion >= LOCAL_DB_SCHEMA_VERSION) {
    return;
  }

  for (const migration of migrations) {
    if (migration.version <= currentVersion) {
      continue;
    }

    await db.withTransactionAsync(async () => {
      if (migration.version === 9) {
        await migrateMockExamResultItems(db);
      }
      if (migration.sql.trim()) {
        await db.execAsync(migration.sql);
      }
      await db.runAsync(
        'INSERT OR IGNORE INTO schema_migrations (version) VALUES (?)',
        migration.version,
      );
    });
  }
}

export async function getLocalDbVersion(db: SQLiteDatabase) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY NOT NULL,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const latest = await db.getFirstAsync<SchemaVersionRow>(
    'SELECT MAX(version) AS version FROM schema_migrations',
  );

  return latest?.version ?? 0;
}
