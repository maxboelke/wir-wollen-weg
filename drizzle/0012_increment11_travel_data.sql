-- Increment 11 («Bucht» + persönliche Reisedaten, F-056/F-054 stage 1, features.md R.9): the
-- marking «Bucht» on the membership (ends with it), requests (hull only – purpose, field codes,
-- states), recipients/answers (composite FK on the membership: leaving, removal and account
-- deletion remove them like `availability`), releases (AES-256-GCM ciphertext + nonce + key id,
-- consent proof – hard deleted, R.9 I11-10) and the access log (lives exactly as long as its
-- release). Everything cascades with the trip (F-013). The values never reach the database in
-- plain text; the key lives outside of it (TRAVEL_DATA_KEYS, deployment.md §0.11).
CREATE TABLE "travel_data_access" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"recipient_id" uuid NOT NULL,
	"actor_id" uuid,
	"action" text NOT NULL,
	"field" text,
	"at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "travel_data_access_values_check" CHECK (("travel_data_access"."action" = 'view' and "travel_data_access"."field" is null)
        or ("travel_data_access"."action" = 'copy' and "travel_data_access"."field" in ('given_name', 'family_name', 'birth_date', 'sex', 'nationality', 'document_type', 'document_number', 'document_expiry', 'issuing_country')))
);
--> statement-breakpoint
CREATE TABLE "travel_data_recipient" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"request_id" uuid NOT NULL,
	"trip_id" uuid NOT NULL,
	"user_id" uuid,
	"placeholder_id" uuid,
	"state" text DEFAULT 'open' NOT NULL,
	"responded_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"dismissed_at" timestamp with time zone,
	CONSTRAINT "travel_data_recipient_kind_check" CHECK (("travel_data_recipient"."user_id" is null) <> ("travel_data_recipient"."placeholder_id" is null)),
	CONSTRAINT "travel_data_recipient_state_check" CHECK ("travel_data_recipient"."state" in ('open', 'released', 'declined', 'expired'))
);
--> statement-breakpoint
CREATE TABLE "travel_data_release" (
	"recipient_id" uuid PRIMARY KEY NOT NULL,
	"ciphertext" "bytea" NOT NULL,
	"nonce" "bytea" NOT NULL,
	"key_id" text NOT NULL,
	"schema_version" integer NOT NULL,
	"consent_at" timestamp with time zone NOT NULL,
	"consent_version" integer NOT NULL,
	"consent_locale" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "travel_data_release_values_check" CHECK (octet_length("travel_data_release"."nonce") = 12 and octet_length("travel_data_release"."ciphertext") between 17 and 8192
        and "travel_data_release"."key_id" ~ '^[a-z0-9-]{1,16}$' and "travel_data_release"."consent_locale" in ('de', 'en'))
);
--> statement-breakpoint
CREATE TABLE "travel_data_request" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"trip_id" uuid NOT NULL,
	"requester_id" uuid,
	"purpose" text NOT NULL,
	"fields" text[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"closed_at" timestamp with time zone,
	"closed_reason" text,
	"used_at" timestamp with time zone,
	"idempotency_key" text,
	CONSTRAINT "travel_data_request_purpose_check" CHECK (char_length("travel_data_request"."purpose") between 1 and 60
        and coalesce(char_length("travel_data_request"."idempotency_key"), 0) <= 64),
	CONSTRAINT "travel_data_request_fields_check" CHECK ("travel_data_request"."fields" <@ array['legal_name', 'birth_date', 'sex', 'nationality', 'document', 'document_expiry', 'issuing_country']::text[]
        and 'legal_name' = any("travel_data_request"."fields")
        and (not ('document_expiry' = any("travel_data_request"."fields") or 'issuing_country' = any("travel_data_request"."fields")) or 'document' = any("travel_data_request"."fields"))),
	CONSTRAINT "travel_data_request_closed_check" CHECK (("travel_data_request"."closed_at" is null) = ("travel_data_request"."closed_reason" is null)
        and ("travel_data_request"."closed_reason" is null or "travel_data_request"."closed_reason" in ('done', 'booker_revoked', 'requester_left', 'expired', 'unfixed')))
);
--> statement-breakpoint
CREATE INDEX "travel_data_access_recipient_idx" ON "travel_data_access" USING btree ("recipient_id","at");--> statement-breakpoint
CREATE INDEX "travel_data_recipient_trip_user_idx" ON "travel_data_recipient" USING btree ("trip_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "travel_data_recipient_user_idx" ON "travel_data_recipient" USING btree ("request_id","user_id") WHERE "travel_data_recipient"."user_id" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "travel_data_recipient_placeholder_idx" ON "travel_data_recipient" USING btree ("request_id","placeholder_id") WHERE "travel_data_recipient"."placeholder_id" is not null;--> statement-breakpoint
CREATE INDEX "travel_data_request_trip_idx" ON "travel_data_request" USING btree ("trip_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "travel_data_request_id_trip_idx" ON "travel_data_request" USING btree ("id","trip_id");--> statement-breakpoint
CREATE UNIQUE INDEX "travel_data_request_idempotency_idx" ON "travel_data_request" USING btree ("trip_id","idempotency_key") WHERE "travel_data_request"."idempotency_key" is not null;--> statement-breakpoint
ALTER TABLE "trip" ADD COLUMN "booker_defaulted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "trip" ADD COLUMN "unfixed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "trip" ADD COLUMN "travel_dates_changed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "trip_member" ADD COLUMN "booker_since" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "trip_member" ADD COLUMN "booker_set_by" uuid;--> statement-breakpoint
ALTER TABLE "trip_member" ADD COLUMN "booker_revoked_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "trip_member" ADD COLUMN "booker_hint_seen_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "trip_member" ADD COLUMN "travel_dates_hint_seen_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "travel_data_access" ADD CONSTRAINT "travel_data_access_recipient_id_travel_data_release_recipient_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."travel_data_release"("recipient_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "travel_data_access" ADD CONSTRAINT "travel_data_access_actor_id_user_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "travel_data_recipient" ADD CONSTRAINT "travel_data_recipient_placeholder_id_trip_placeholder_id_fk" FOREIGN KEY ("placeholder_id") REFERENCES "public"."trip_placeholder"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "travel_data_recipient" ADD CONSTRAINT "travel_data_recipient_request_fk" FOREIGN KEY ("request_id","trip_id") REFERENCES "public"."travel_data_request"("id","trip_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "travel_data_recipient" ADD CONSTRAINT "travel_data_recipient_member_fk" FOREIGN KEY ("trip_id","user_id") REFERENCES "public"."trip_member"("trip_id","user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "travel_data_release" ADD CONSTRAINT "travel_data_release_recipient_id_travel_data_recipient_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."travel_data_recipient"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "travel_data_request" ADD CONSTRAINT "travel_data_request_trip_id_trip_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trip"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "travel_data_request" ADD CONSTRAINT "travel_data_request_requester_id_user_id_fk" FOREIGN KEY ("requester_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_member" ADD CONSTRAINT "trip_member_booker_set_by_user_id_fk" FOREIGN KEY ("booker_set_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
-- R.9 I11-01: trips that are already in phase «fixed» get the default marking for their current
-- organiser once (the «first fixing» lies before this increment).
UPDATE "trip_member" AS m SET "booker_since" = now(), "booker_set_by" = m."user_id"
  FROM "trip" AS t
  WHERE t."id" = m."trip_id" AND t."phase" = 'fixed' AND m."role" = 'organizer' AND m."booker_since" IS NULL;--> statement-breakpoint
UPDATE "trip" SET "booker_defaulted_at" = now() WHERE "phase" = 'fixed' AND "booker_defaulted_at" IS NULL;
