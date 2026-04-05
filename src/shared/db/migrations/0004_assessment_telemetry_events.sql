CREATE TABLE `assessment_telemetry_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`event_id` text NOT NULL,
	`event` text NOT NULL,
	`session_id` text NOT NULL,
	`user_id` text NOT NULL,
	`timestamp` text NOT NULL,
	`created_at` integer NOT NULL,
	`game_key` text NOT NULL,
	`difficulty_tier` text NOT NULL,
	`block_index` integer NOT NULL,
	`trial_index` integer,
	`latency_ms` integer,
	`is_correct` integer,
	`device` text NOT NULL,
	`app_version` text NOT NULL,
	`payload` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `assessment_telemetry_events_event_id_idx` ON `assessment_telemetry_events` (`event_id`);
--> statement-breakpoint
CREATE INDEX `assessment_telemetry_events_session_created_at_idx` ON `assessment_telemetry_events` (`session_id`, `created_at`);
