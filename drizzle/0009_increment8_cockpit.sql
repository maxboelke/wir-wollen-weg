-- Increment 8 (F-053 «Reiseverlauf», F-033 Infos, UX-8, UX-9): trip info page (1:1, deleted
-- with the trip – F-013), «Allen Bescheid geben» marker of station V1, «macht ohne App mit» per
-- placeholder (V2) and the small departure-day celebration per membership. No data migration.
CREATE TABLE "trip_info" (
	"trip_id" uuid PRIMARY KEY NOT NULL,
	"stay_name" text,
	"address" text,
	"check_in" text,
	"check_out" text,
	"meeting_point" text,
	"emergency_name" text,
	"emergency_phone" text,
	"notes" text,
	"updated_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "trip_info_length_check" CHECK (coalesce(char_length("trip_info"."stay_name"), 0) <= 80
        and coalesce(char_length("trip_info"."address"), 0) <= 200
        and coalesce(char_length("trip_info"."meeting_point"), 0) <= 300
        and coalesce(char_length("trip_info"."emergency_name"), 0) <= 60
        and coalesce(char_length("trip_info"."emergency_phone"), 0) <= 20
        and coalesce(char_length("trip_info"."notes"), 0) <= 2000),
	CONSTRAINT "trip_info_time_check" CHECK (("trip_info"."check_in" is null or "trip_info"."check_in" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$')
        and ("trip_info"."check_out" is null or "trip_info"."check_out" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'))
);
--> statement-breakpoint
ALTER TABLE "trip" ADD COLUMN "fixed_announced_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "trip_member" ADD COLUMN "departure_celebrated_on" date;--> statement-breakpoint
ALTER TABLE "trip_placeholder" ADD COLUMN "without_app_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "trip_placeholder" ADD COLUMN "without_app_by" uuid;--> statement-breakpoint
ALTER TABLE "trip_info" ADD CONSTRAINT "trip_info_trip_id_trip_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trip"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_info" ADD CONSTRAINT "trip_info_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_placeholder" ADD CONSTRAINT "trip_placeholder_without_app_by_user_id_fk" FOREIGN KEY ("without_app_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;