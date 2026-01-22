import { drizzle } from "drizzle-orm/expo-sqlite";
import * as SQLite from "expo-sqlite";

export const dbName = "db.db";

export const expo = SQLite.openDatabaseSync(dbName, { enableChangeListener: true });

export const db = drizzle(expo);