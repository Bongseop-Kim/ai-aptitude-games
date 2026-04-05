import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const authTelemetryEvents = sqliteTable(
  "auth_telemetry_events",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    eventId: text("event_id").notNull(),
    event: text("event").notNull(),
    userId: text("user_id").notNull(),
    timestamp: text("timestamp").notNull(),
    createdAt: integer("created_at").notNull(),
    device: text("device").notNull(),
    appVersion: text("app_version").notNull(),
    payload: text("payload"),
  },
  (table) => ({
    eventIdIdx: uniqueIndex("auth_telemetry_events_event_id_idx").on(table.eventId),
    userCreatedAtIdx: index("auth_telemetry_events_user_created_at_idx").on(
      table.userId,
      table.createdAt
    ),
  })
);
