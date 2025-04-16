CREATE TABLE `notebooks` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);

CREATE TABLE `sources` (
	`id` text PRIMARY KEY NOT NULL,
	`content` text NOT NULL,
	`filename` text,
	`tag` text,
	`notebook_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`notebook_id`) REFERENCES `notebooks`(`id`) ON DELETE cascade
);

CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`content` text NOT NULL,
	`role` text NOT NULL,
	`notebook_id` text NOT NULL,
	`timestamp` integer NOT NULL,
	FOREIGN KEY (`notebook_id`) REFERENCES `notebooks`(`id`) ON DELETE cascade
);

CREATE TABLE `models` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`is_downloaded` integer NOT NULL DEFAULT 0,
	`parameters` text NOT NULL,
	`size` text NOT NULL,
	`use_case` text NOT NULL
);
