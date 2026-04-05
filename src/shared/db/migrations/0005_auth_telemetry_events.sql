CREATE TABLE `auth_telemetry_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`event_id` text NOT NULL,
	`event` text NOT NULL,
	`user_id` text NOT NULL,
	`timestamp` text NOT NULL,
	`created_at` integer NOT NULL,
	`device` text NOT NULL,
	`app_version` text NOT NULL,
	`payload` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `auth_telemetry_events_event_id_idx` ON `auth_telemetry_events` (`event_id`);
--> statement-breakpoint
CREATE INDEX `auth_telemetry_events_user_created_at_idx` ON `auth_telemetry_events` (`user_id`,`created_at`);
