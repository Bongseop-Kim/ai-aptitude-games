import type { SQLiteDatabase } from 'expo-sqlite';

export const LOCAL_DB_NAME = 'ai-aptitude-games.db';
export const LOCAL_DB_SCHEMA_VERSION = 1;

type SchemaVersionRow = {
  version: number;
};

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

  if ((latest?.version ?? 0) >= LOCAL_DB_SCHEMA_VERSION) {
    return;
  }

  await db.runAsync(
    'INSERT OR IGNORE INTO schema_migrations (version) VALUES (?)',
    LOCAL_DB_SCHEMA_VERSION,
  );
}

export async function getLocalDbVersion(db: SQLiteDatabase) {
  const latest = await db.getFirstAsync<SchemaVersionRow>(
    'SELECT MAX(version) AS version FROM schema_migrations',
  );

  return latest?.version ?? 0;
}
