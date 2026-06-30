import type { SQLiteDatabase } from 'expo-sqlite';

import { supabase } from '../../lib/supabase';

type PayloadRow = Record<string, unknown>;

type PushOutboxConfig<Row> = {
  debugTag: string;
  markSynced: (db: SQLiteDatabase, rows: readonly Row[]) => Promise<void>;
  onConflict: string;
  rowDebugLabel?: (row: Row, payload: PayloadRow) => readonly unknown[];
  selectSql: string;
  table: string;
  toPayload: (row: Row) => PayloadRow;
};

export function sqliteDatetimeToIsoUtc(sqliteDatetime: string) {
  return `${sqliteDatetime.replace(' ', 'T')}Z`;
}

export function markRowsSyncedById<Row extends { id: string }>(table: string) {
  return async (db: SQLiteDatabase, rows: readonly Row[]) => {
    if (rows.length === 0) {
      return;
    }

    const placeholders = rows.map(() => '?').join(', ');
    await db.runAsync(
      `UPDATE ${table} SET synced = 1 WHERE id IN (${placeholders})`,
      ...rows.map((row) => row.id),
    );
  };
}

export function createQueuedOutboxPush<Row>({
  debugTag,
  markSynced,
  onConflict,
  rowDebugLabel,
  selectSql,
  table,
  toPayload,
}: PushOutboxConfig<Row>) {
  let pushInFlight = false;
  let pushQueuedUserId: string | null = null;
  let pushCompletion: Promise<void> = Promise.resolve();

  return function pushQueuedOutbox(db: SQLiteDatabase, userId: string) {
    if (pushInFlight) {
      pushQueuedUserId = userId;
      return pushCompletion;
    }

    pushCompletion = runPush(db, userId);
    return pushCompletion;
  };

  async function runPush(db: SQLiteDatabase, userId: string) {
    pushInFlight = true;

    try {
      const rows = await db.getAllAsync<Row>(selectSql, userId);
      if (rows.length === 0) {
        return;
      }

      const payload = rows.map(toPayload);
      const { error } = await supabase
        .from(table)
        .upsert(payload, { onConflict });
      if (error) {
        if (__DEV__) {
          console.warn(`[${debugTag}] push failed:`, error.message);
        }

        const syncedRows: Row[] = [];
        for (const [index, rowPayload] of payload.entries()) {
          const sourceRow = rows[index];
          const { error: rowError } = await supabase
            .from(table)
            .upsert(rowPayload, { onConflict });
          if (rowError) {
            if (__DEV__) {
              console.warn(
                `[${debugTag}] row push failed:`,
                ...(rowDebugLabel?.(sourceRow, rowPayload) ?? []),
                rowError.message,
              );
            }
            continue;
          }
          syncedRows.push(sourceRow);
        }
        await markSynced(db, syncedRows);
        return;
      }

      await markSynced(db, rows);
    } catch (error) {
      if (__DEV__) {
        console.warn(`[${debugTag}] push failed:`, error);
      }
    } finally {
      pushInFlight = false;
      if (pushQueuedUserId) {
        const queuedUserId = pushQueuedUserId;
        pushQueuedUserId = null;
        await runPush(db, queuedUserId);
      }
    }
  }
}
