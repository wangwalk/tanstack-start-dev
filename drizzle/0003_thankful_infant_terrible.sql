CREATE TABLE `user_tool_saves` (
	`user_id` text NOT NULL,
	`tool_id` text NOT NULL,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `tool_id`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tool_id`) REFERENCES `tool`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `user_tool_saves_user_idx` ON `user_tool_saves` (`user_id`);--> statement-breakpoint
CREATE INDEX `user_tool_saves_tool_idx` ON `user_tool_saves` (`tool_id`);