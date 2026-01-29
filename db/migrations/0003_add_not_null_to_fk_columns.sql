PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_stage_offsets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`stage_id` integer NOT NULL,
	`offset_n` integer NOT NULL,
	`avg_rt_ms` integer,
	`correct_count` integer NOT NULL,
	`total_count` integer NOT NULL,
	`accuracy` real NOT NULL,
	FOREIGN KEY (`stage_id`) REFERENCES `stages`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_stage_offsets`("id", "stage_id", "offset_n", "avg_rt_ms", "correct_count", "total_count", "accuracy") SELECT "id", "stage_id", "offset_n", "avg_rt_ms", "correct_count", "total_count", "accuracy" FROM `stage_offsets`;--> statement-breakpoint
DROP TABLE `stage_offsets`;--> statement-breakpoint
ALTER TABLE `__new_stage_offsets` RENAME TO `stage_offsets`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_stages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`session_id` integer NOT NULL,
	`stage_index` integer NOT NULL,
	`accuracy` real NOT NULL,
	`avg_rt_ms` integer,
	`correct_count` integer NOT NULL,
	`total_questions` integer NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_stages`("id", "session_id", "stage_index", "accuracy", "avg_rt_ms", "correct_count", "total_questions") SELECT "id", "session_id", "stage_index", "accuracy", "avg_rt_ms", "correct_count", "total_questions" FROM `stages`;--> statement-breakpoint
DROP TABLE `stages`;--> statement-breakpoint
ALTER TABLE `__new_stages` RENAME TO `stages`;--> statement-breakpoint
CREATE TABLE `__new_trials` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`stage_id` integer NOT NULL,
	`trial_index` integer NOT NULL,
	`offset_n` integer NOT NULL,
	`is_correct` integer NOT NULL,
	`rt_ms` integer,
	`shown_shape_id` text NOT NULL,
	FOREIGN KEY (`stage_id`) REFERENCES `stages`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_trials`("id", "stage_id", "trial_index", "offset_n", "is_correct", "rt_ms", "shown_shape_id") SELECT "id", "stage_id", "trial_index", "offset_n", "is_correct", "rt_ms", "shown_shape_id" FROM `trials`;--> statement-breakpoint
DROP TABLE `trials`;--> statement-breakpoint
ALTER TABLE `__new_trials` RENAME TO `trials`;