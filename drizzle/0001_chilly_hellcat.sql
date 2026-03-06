CREATE TABLE `category` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`icon` text,
	`parent_id` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `category_slug_unique` ON `category` (`slug`);--> statement-breakpoint
CREATE TABLE `tag` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tag_slug_unique` ON `tag` (`slug`);--> statement-breakpoint
CREATE TABLE `tool` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`url` text NOT NULL,
	`description` text,
	`content` text,
	`logo_url` text,
	`screenshot_url` text,
	`pricing_type` text DEFAULT 'free' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`is_featured` integer DEFAULT false NOT NULL,
	`submitted_by` text,
	`approved_by` text,
	`approved_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tool_slug_unique` ON `tool` (`slug`);--> statement-breakpoint
CREATE TABLE `tool_category` (
	`tool_id` text NOT NULL,
	`category_id` text NOT NULL,
	PRIMARY KEY(`tool_id`, `category_id`)
);
--> statement-breakpoint
CREATE TABLE `tool_tag` (
	`tool_id` text NOT NULL,
	`tag_id` text NOT NULL,
	PRIMARY KEY(`tool_id`, `tag_id`)
);
