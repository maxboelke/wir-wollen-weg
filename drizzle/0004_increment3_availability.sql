-- Increment 3: own availability per day (F-005: only «zur Not»/«geht nicht» are stored, no row
-- = «geht»), comment and last change per membership (F-007), one-off import feedback (F-005)
-- and placeholders with their own invite link (F-007). Leaving/removal cascades to the days.
CREATE TABLE "availability" (
	"trip_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"day" date NOT NULL,
	"state" text NOT NULL,
	CONSTRAINT "availability_trip_id_user_id_day_pk" PRIMARY KEY("trip_id","user_id","day"),
	CONSTRAINT "availability_state_check" CHECK ("availability"."state" in ('maybe', 'no'))
);
--> statement-breakpoint
CREATE TABLE "trip_placeholder" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"trip_id" uuid NOT NULL,
	"display_name" text NOT NULL,
	"invite_token" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"claimed_by" uuid,
	"claimed_at" timestamp with time zone,
	CONSTRAINT "trip_placeholder_invite_token_unique" UNIQUE("invite_token")
);
--> statement-breakpoint
ALTER TABLE "trip_member" ADD COLUMN "availability_updated_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "trip_member" ADD COLUMN "comment" text;--> statement-breakpoint
ALTER TABLE "trip_member" ADD COLUMN "import_feedback" text;--> statement-breakpoint
ALTER TABLE "availability" ADD CONSTRAINT "availability_member_fk" FOREIGN KEY ("trip_id","user_id") REFERENCES "public"."trip_member"("trip_id","user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_placeholder" ADD CONSTRAINT "trip_placeholder_trip_id_trip_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trip"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_placeholder" ADD CONSTRAINT "trip_placeholder_claimed_by_user_id_fk" FOREIGN KEY ("claimed_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "trip_placeholder_trip_id_idx" ON "trip_placeholder" USING btree ("trip_id");--> statement-breakpoint
CREATE UNIQUE INDEX "trip_placeholder_trip_name_idx" ON "trip_placeholder" USING btree ("trip_id",lower("display_name")) WHERE "trip_placeholder"."claimed_at" is null;--> statement-breakpoint
ALTER TABLE "trip_member" ADD CONSTRAINT "trip_member_comment_check" CHECK ("trip_member"."comment" is null or char_length("trip_member"."comment") <= 200);--> statement-breakpoint
ALTER TABLE "trip_member" ADD CONSTRAINT "trip_member_import_feedback_check" CHECK ("trip_member"."import_feedback" is null or "trip_member"."import_feedback" in ('apple', 'google', 'outlook', 'other', 'none', 'skipped'));