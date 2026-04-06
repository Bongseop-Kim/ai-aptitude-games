import { sqliteTable, text, integer, index, uniqueIndex } from "drizzle-orm/sqlite-core";

export const assessmentTelemetryEvents = sqliteTable(
  "assessment_telemetry_events",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    eventId: text("event_id").notNull(),
    event: text("event").notNull(),
    sessionId: text("session_id").notNull(),
    userId: text("user_id").notNull(),
    timestamp: text("timestamp").notNull(),
    createdAt: integer("created_at").notNull(),
    gameKey: text("game_key").notNull(),
    difficultyTier: text("difficulty_tier").notNull(),
    blockIndex: integer("block_index").notNull(),
    trialIndex: integer("trial_index"),
    latencyMs: integer("latency_ms"),
    isCorrect: integer("is_correct", { mode: "boolean" }),
    device: text("device").notNull(),
    appVersion: text("app_version").notNull(),
    payload: text("payload"),
  },
  (table) => ({
    eventIdIdx: uniqueIndex("assessment_telemetry_events_event_id_idx").on(
      table.eventId
    ),
    sessionCreatedAtIdx: index(
      "assessment_telemetry_events_session_created_at_idx"
    ).on(table.sessionId, table.createdAt),
  })
);
