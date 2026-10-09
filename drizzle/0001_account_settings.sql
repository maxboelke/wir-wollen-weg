CREATE TABLE "auth_attempt" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"key" text NOT NULL,
	"kind" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "locale" text DEFAULT 'en' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "locale_chosen_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "country" text DEFAULT 'GB' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "subdivision" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "week_start" text DEFAULT 'auto' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "reduce_motion" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX "auth_attempt_key_kind_created_idx" ON "auth_attempt" USING btree ("key","kind","created_at");