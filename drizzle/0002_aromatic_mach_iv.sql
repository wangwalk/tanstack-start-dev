CREATE TABLE `listing_order` (
	`id` text PRIMARY KEY NOT NULL,
	`tool_id` text NOT NULL,
	`user_id` text NOT NULL,
	`tier` text NOT NULL,
	`amount` integer NOT NULL,
	`currency` text DEFAULT 'usd' NOT NULL,
	`stripe_session_id` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer NOT NULL,
	`paid_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `listing_order_stripe_session_id_unique` ON `listing_order` (`stripe_session_id`);--> statement-breakpoint
CREATE INDEX `listing_order_tool_idx` ON `listing_order` (`tool_id`);--> statement-breakpoint
CREATE INDEX `listing_order_user_idx` ON `listing_order` (`user_id`);--> statement-breakpoint
ALTER TABLE `tool` ADD `listing_tier` text DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE `tool` ADD `cta_label` text;--> statement-breakpoint
ALTER TABLE `tool` ADD `cta_url` text;