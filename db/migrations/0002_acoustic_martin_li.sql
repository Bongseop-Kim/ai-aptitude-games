PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_sessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer NOT NULL,
	`total_duration` integer,
	`type` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_sessions`("id", "created_at", "total_duration", "type") SELECT "id", "created_at", "total_duration", "type" FROM `sessions`;--> statement-breakpoint
DROP TABLE `sessions`;--> statement-breakpoint
ALTER TABLE `__new_sessions` RENAME TO `sessions`;--> statement-breakpoint
PRAGMA foreign_keys=ON;