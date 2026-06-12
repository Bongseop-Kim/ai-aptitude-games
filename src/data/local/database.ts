import type { SQLiteDatabase } from 'expo-sqlite';

export const LOCAL_DB_NAME = 'ai-aptitude-games.db';
export const LOCAL_DB_SCHEMA_VERSION = 6;

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
];

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
