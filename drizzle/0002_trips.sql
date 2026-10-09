-- Increment 2: real trip model (F-001 ff.). The placeholder trips of the auth spike (P1-0a)
-- have no search range, duration or organiser and cannot be migrated – they are removed
-- (memberships cascade). Demo data comes back with `pnpm db:seed:demo`.
DELETE FROM "trip";--> statement-breakpoint
CREATE TABLE "rate_limit_event" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"key" text NOT NULL,
	"kind" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "trip" ADD COLUMN "public_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "trip" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "trip" ADD COLUMN "range_start" date NOT NULL;--> statement-breakpoint
ALTER TABLE "trip" ADD COLUMN "range_end" date NOT NULL;--> statement-breakpoint
ALTER TABLE "trip" ADD COLUMN "min_nights" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "trip" ADD COLUMN "preferred_nights" integer;--> statement-breakpoint
ALTER TABLE "trip" ADD COLUMN "deadline" date;--> statement-breakpoint
ALTER TABLE "trip" ADD COLUMN "holiday_country" text NOT NULL;--> statement-breakpoint
ALTER TABLE "trip" ADD COLUMN "holiday_subdivision" text;--> statement-breakpoint
ALTER TABLE "trip" ADD COLUMN "locale" text DEFAULT 'en' NOT NULL;--> statement-breakpoint
ALTER TABLE "trip" ADD COLUMN "join_open" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "trip" ADD COLUMN "phase" text DEFAULT 'collecting' NOT NULL;--> statement-breakpoint
ALTER TABLE "trip" ADD COLUMN "fixed_start" date;--> statement-breakpoint
ALTER TABLE "trip" ADD COLUMN "fixed_end" date;--> statement-breakpoint
ALTER TABLE "trip" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "trip_member" ADD COLUMN "role" text DEFAULT 'member' NOT NULL;--> statement-breakpoint
ALTER TABLE "trip_member" ADD COLUMN "submitted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "trip_member" ADD COLUMN "voted_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "rate_limit_event_key_kind_idx" ON "rate_limit_event" USING btree ("key","kind","created_at");--> statement-breakpoint
CREATE INDEX "trip_member_user_id_idx" ON "trip_member" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "trip_member_one_organizer_idx" ON "trip_member" USING btree ("trip_id") WHERE "trip_member"."role" = 'organizer';--> statement-breakpoint
ALTER TABLE "trip" ADD CONSTRAINT "trip_public_id_unique" UNIQUE("public_id");--> statement-breakpoint
ALTER TABLE "trip" ADD CONSTRAINT "trip_phase_check" CHECK ("trip"."phase" in ('collecting', 'voting', 'fixed'));--> statement-breakpoint
ALTER TABLE "trip" ADD CONSTRAINT "trip_range_check" CHECK ("trip"."range_end" > "trip"."range_start");--> statement-breakpoint
ALTER TABLE "trip" ADD CONSTRAINT "trip_nights_check" CHECK ("trip"."min_nights" between 1 and 30);--> statement-breakpoint
ALTER TABLE "trip_member" ADD CONSTRAINT "trip_member_role_check" CHECK ("trip_member"."role" in ('organizer', 'member'));