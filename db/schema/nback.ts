import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

// 1. 게임 세션 (전체적인 흐름 관리)
export const sessions = sqliteTable("sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(strftime('%s','now'))`)
    .$defaultFn(() => new Date())
    .notNull(),
  totalDuration: integer("total_duration"), // 총 플레이 시간(초)
  type: text("type", { enum: ["practice", "real"] }).notNull(), // 연습, 실전
});

// 2. 스테이지 요약 (각 스테이지별 성과)
export const stages = sqliteTable("stages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionId: integer("session_id")
    .references(() => sessions.id, { onDelete: "cascade" })
    .notNull(),
  stageIndex: integer("stage_index").notNull(), // 0, 1, 2...
  accuracy: real("accuracy").notNull(), // 0.8 (80%)
  avgRtMs: integer("avg_rt_ms"), // 전체 평균 반응 속도
  correctCount: integer("correct_count").notNull(),
  totalQuestions: integer("total_questions").notNull(),
});

// 3. 오프셋별 상세 통계 (대시보드 핵심 테이블! ⭐)
// 'perOffset' 데이터를 풀어서 저장합니다. 0-back, 2-back 등 각각의 성적을 기록.
export const stageOffsets = sqliteTable("stage_offsets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  stageId: integer("stage_id")
    .references(() => stages.id, { onDelete: "cascade" })
    .notNull(),
  offsetN: integer("offset_n").notNull(), // 0, 1, 2, 3 (N-back의 N)
  avgRtMs: integer("avg_rt_ms"),
  correctCount: integer("correct_count").notNull(),
  totalCount: integer("total_count").notNull(),
  accuracy: real("accuracy").notNull(), // (correct / total) 미리 계산해서 저장
});

// 4. 개별 트라이얼 (오답 노트 및 미세 분석용)
export const trials = sqliteTable("trials", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  stageId: integer("stage_id")
    .references(() => stages.id, { onDelete: "cascade" })
    .notNull(),
  trialIndex: integer("trial_index").notNull(),
  offsetN: integer("offset_n").notNull(), // 해당 문제가 어떤 오프셋 문제였는지
  isCorrect: integer("is_correct", { mode: "boolean" }).notNull(),
  rtMs: integer("rt_ms"),
  shownShapeId: text("shown_shape_id").notNull(),
});
