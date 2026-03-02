CREATE TABLE "credit_allocation" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"amount" integer NOT NULL,
	"remaining" integer NOT NULL,
	"source" text NOT NULL,
	"period_key" text,
	"expires_at" timestamp,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "credit_transaction" ADD COLUMN "source" text;--> statement-breakpoint
ALTER TABLE "credit_transaction" ADD COLUMN "expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "credit_allocation" ADD CONSTRAINT "credit_allocation_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "credit_allocation_user_expires_idx" ON "credit_allocation" USING btree ("user_id","expires_at");--> statement-breakpoint
CREATE INDEX "credit_allocation_user_period_idx" ON "credit_allocation" USING btree ("user_id","source","period_key");