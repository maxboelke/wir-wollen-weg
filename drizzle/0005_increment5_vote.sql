-- Increment 5: vote (F-010 options, F-011 one answer per member and option, F-012 fixed dates).
-- The unique index (id, trip_id) on poll_option must exist before the composite foreign key of
-- poll_vote references it, so the indexes come first. Votes cascade with the option and the
-- membership (removal/leaving, F-004); the celebration «Es geht los!» is remembered per member.
CREATE TABLE "poll_option" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"trip_id" uuid NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "poll_option_range_check" CHECK ("poll_option"."end_date" > "poll_option"."start_date")
);
--> statement-breakpoint
CREATE TABLE "poll_vote" (
	"option_id" uuid NOT NULL,
	"trip_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"choice" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "poll_vote_option_id_user_id_pk" PRIMARY KEY("option_id","user_id"),
	CONSTRAINT "poll_vote_choice_check" CHECK ("poll_vote"."choice" in ('yes', 'maybe', 'no'))
);
--> statement-breakpoint
ALTER TABLE "trip" ADD COLUMN "fixed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "trip" ADD COLUMN "poll_deadline" date;--> statement-breakpoint
ALTER TABLE "trip" ADD COLUMN "poll_started_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "trip_member" ADD COLUMN "celebrated_for" text;--> statement-breakpoint
CREATE UNIQUE INDEX "poll_option_trip_range_idx" ON "poll_option" USING btree ("trip_id","start_date","end_date");--> statement-breakpoint
CREATE UNIQUE INDEX "poll_option_id_trip_idx" ON "poll_option" USING btree ("id","trip_id");--> statement-breakpoint
CREATE INDEX "poll_vote_trip_user_idx" ON "poll_vote" USING btree ("trip_id","user_id");--> statement-breakpoint
ALTER TABLE "poll_option" ADD CONSTRAINT "poll_option_trip_id_trip_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trip"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poll_vote" ADD CONSTRAINT "poll_vote_option_fk" FOREIGN KEY ("option_id","trip_id") REFERENCES "public"."poll_option"("id","trip_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poll_vote" ADD CONSTRAINT "poll_vote_member_fk" FOREIGN KEY ("trip_id","user_id") REFERENCES "public"."trip_member"("trip_id","user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
-- Existing rows: a fixed trip always has its dates, other phases none (trip_fixed_check).
UPDATE "trip" SET "phase" = 'collecting' WHERE "phase" = 'fixed' AND ("fixed_start" IS NULL OR "fixed_end" IS NULL);--> statement-breakpoint
UPDATE "trip" SET "fixed_start" = NULL, "fixed_end" = NULL WHERE "phase" <> 'fixed';--> statement-breakpoint
ALTER TABLE "trip" ADD CONSTRAINT "trip_fixed_check" CHECK (("trip"."phase" = 'fixed') = ("trip"."fixed_start" is not null and "trip"."fixed_end" is not null));