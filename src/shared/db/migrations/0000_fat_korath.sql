CREATE TABLE `sessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer,
	`total_duration` integer
);
--> statement-breakpoint
CREATE TABLE `stage_offsets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`stage_id` integer,
	`offset_n` integer NOT NULL,
	`avg_rt_ms` integer NOT NULL,
	`correct_count` integer NOT NULL,
	`total_count` integer NOT NULL,
	`accuracy` real NOT NULL,
	FOREIGN KEY (`stage_id`) REFERENCES `stages`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `stages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`session_id` integer,
	`stage_index` integer NOT NULL,
	`accuracy` real NOT NULL,
	`avg_rt_ms` integer NOT NULL,
	`correct_count` integer NOT NULL,
	`total_questions` integer NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `trials` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`stage_id` integer,
	`trial_index` integer NOT NULL,
	`offset_n` integer NOT NULL,
	`is_correct` integer NOT NULL,
	`rt_ms` integer,
	`shown_shape_id` text NOT NULL,
	FOREIGN KEY (`stage_id`) REFERENCES `stages`(`id`) ON UPDATE no action ON DELETE cascade
);
