-- Increment 6 (F-013, F-043, Q21): one-off notice after a cancelled vote, retention of old
-- trips (notice 14 days before) and of inactive accounts (24 months, notice 30 days before).
-- Existing accounts start with last_active_at = now() – nobody is deleted earlier than the
-- rules promise.
ALTER TABLE "trip" ADD COLUMN "poll_canceled_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "trip" ADD COLUMN "poll_canceled_by" uuid;--> statement-breakpoint
ALTER TABLE "trip" ADD COLUMN "deletion_notice_sent_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "trip_member" ADD COLUMN "poll_cancel_seen_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "last_active_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "inactivity_notice_sent_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "trip" ADD CONSTRAINT "trip_poll_canceled_by_user_id_fk" FOREIGN KEY ("poll_canceled_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;