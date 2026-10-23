-- Increment 9 (F-031 «Unterkünfte», features.md R.7): suggestions with picked/booked columns
-- (at most one picked place per trip), ratings bound to the membership and the suggestion
-- (cascade on leaving/removal/deletion), UX-9 marks per station (V3), trip currency, party size
-- override and the markers for «Euer Termin hat sich geändert» (W18 E.8). Everything cascades
-- with the trip (F-013, Q31). Data migration: currency from the holiday region, last fixed range.
CREATE TABLE "trip_station_marks" (
	"trip_id" uuid NOT NULL,
	"station" text NOT NULL,
	"set_by" uuid,
	"set_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "trip_station_marks_trip_id_station_pk" PRIMARY KEY("trip_id","station"),
	CONSTRAINT "trip_station_marks_station_check" CHECK ("trip_station_marks"."station" in ('V3'))
);
--> statement-breakpoint
CREATE TABLE "trip_stay" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"trip_id" uuid NOT NULL,
	"url" text NOT NULL,
	"url_normalized" text NOT NULL,
	"title" text NOT NULL,
	"price_cents" integer,
	"currency" text NOT NULL,
	"note" text,
	"preview_image_url" text,
	"preview_site_name" text,
	"preview_status" text DEFAULT 'pending' NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"chosen_at" timestamp with time zone,
	"chosen_by" uuid,
	"booked_at" timestamp with time zone,
	"booked_by" uuid,
	CONSTRAINT "trip_stay_length_check" CHECK (char_length("trip_stay"."url") <= 2048 and "trip_stay"."url" like 'https://%'
        and char_length("trip_stay"."title") between 1 and 80
        and coalesce(char_length("trip_stay"."note"), 0) <= 200
        and coalesce(char_length("trip_stay"."preview_site_name"), 0) <= 80),
	CONSTRAINT "trip_stay_price_check" CHECK ("trip_stay"."price_cents" is null or "trip_stay"."price_cents" between 1 and 100000000),
	CONSTRAINT "trip_stay_currency_check" CHECK ("trip_stay"."currency" ~ '^[A-Z]{3}$'),
	CONSTRAINT "trip_stay_image_check" CHECK ("trip_stay"."preview_image_url" is null or (char_length("trip_stay"."preview_image_url") <= 2048
        and ("trip_stay"."preview_image_url" like 'https://%'
          or "trip_stay"."preview_image_url" ~ '^/demo/stays/[a-z0-9-]+[.]svg$'))),
	CONSTRAINT "trip_stay_preview_check" CHECK ("trip_stay"."preview_status" in ('pending', 'ok', 'none')),
	CONSTRAINT "trip_stay_booked_check" CHECK ("trip_stay"."booked_at" is null or "trip_stay"."chosen_at" is not null)
);
--> statement-breakpoint
CREATE TABLE "trip_stay_rating" (
	"stay_id" uuid NOT NULL,
	"trip_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"value" text NOT NULL,
	"rated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "trip_stay_rating_stay_id_user_id_pk" PRIMARY KEY("stay_id","user_id"),
	CONSTRAINT "trip_stay_rating_value_check" CHECK ("trip_stay_rating"."value" in ('like', 'nope'))
);
--> statement-breakpoint
CREATE INDEX "trip_stay_trip_idx" ON "trip_stay" USING btree ("trip_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "trip_stay_trip_url_idx" ON "trip_stay" USING btree ("trip_id","url_normalized");--> statement-breakpoint
CREATE UNIQUE INDEX "trip_stay_id_trip_idx" ON "trip_stay" USING btree ("id","trip_id");--> statement-breakpoint
CREATE UNIQUE INDEX "trip_stay_one_chosen_idx" ON "trip_stay" USING btree ("trip_id") WHERE "trip_stay"."chosen_at" is not null;--> statement-breakpoint
CREATE INDEX "trip_stay_rating_trip_user_idx" ON "trip_stay_rating" USING btree ("trip_id","user_id");--> statement-breakpoint
ALTER TABLE "trip" ADD COLUMN "currency" text DEFAULT 'EUR' NOT NULL;--> statement-breakpoint
ALTER TABLE "trip" ADD COLUMN "party_size_override" integer;--> statement-breakpoint
ALTER TABLE "trip" ADD COLUMN "last_fixed_range" text;--> statement-breakpoint
ALTER TABLE "trip" ADD COLUMN "stay_dates_changed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "trip" ADD COLUMN "stay_date_notice_dismissed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "trip" ADD COLUMN "stay_booking_reset" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "trip_station_marks" ADD CONSTRAINT "trip_station_marks_trip_id_trip_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trip"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_station_marks" ADD CONSTRAINT "trip_station_marks_set_by_user_id_fk" FOREIGN KEY ("set_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_stay" ADD CONSTRAINT "trip_stay_trip_id_trip_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trip"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_stay" ADD CONSTRAINT "trip_stay_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_stay" ADD CONSTRAINT "trip_stay_chosen_by_user_id_fk" FOREIGN KEY ("chosen_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_stay" ADD CONSTRAINT "trip_stay_booked_by_user_id_fk" FOREIGN KEY ("booked_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_stay_rating" ADD CONSTRAINT "trip_stay_rating_stay_fk" FOREIGN KEY ("stay_id","trip_id") REFERENCES "public"."trip_stay"("id","trip_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_stay_rating" ADD CONSTRAINT "trip_stay_rating_member_fk" FOREIGN KEY ("trip_id","user_id") REFERENCES "public"."trip_member"("trip_id","user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip" ADD CONSTRAINT "trip_currency_check" CHECK ("trip"."currency" ~ '^[A-Z]{3}$');--> statement-breakpoint
ALTER TABLE "trip" ADD CONSTRAINT "trip_party_size_check" CHECK ("trip"."party_size_override" is null or "trip"."party_size_override" between 1 and 50);--> statement-breakpoint
UPDATE "trip" SET "currency" = CASE "holiday_country" WHEN 'GB' THEN 'GBP' WHEN 'CH' THEN 'CHF' WHEN 'US' THEN 'USD' ELSE 'EUR' END;--> statement-breakpoint
UPDATE "trip" SET "last_fixed_range" = "fixed_start"::text || '/' || "fixed_end"::text WHERE "phase" = 'fixed' AND "fixed_start" IS NOT NULL;