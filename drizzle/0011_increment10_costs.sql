-- Increment 10 (F-035/F-036 «Kosten teilen», features.md R.8): people of the settlement (survive
-- leaving – no FK to the membership), expenses with explicit shares (soft delete, version,
-- idempotency key), settlements, «Abrechnung abschließen» on the trip, voluntary payment details
-- on the membership. Every row is bound to its trip by composite foreign keys; everything
-- cascades with the trip (F-013, Q31). A deferred constraint trigger checks «sum of the shares =
-- amount» at commit (R.8 Sicherheit Nr. 2). The foreign keys onto the parties are DEFERRABLE
-- INITIALLY DEFERRED: deleting a trip cascades to parties AND expenses/settlements in one
-- statement – the «no action» check must run at commit, after the cascade (else trips with costs
-- could not be deleted). A party that is still used can never be removed on its own.
CREATE TABLE "trip_cost_party" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"trip_id" uuid NOT NULL,
	"seq" integer NOT NULL,
	"user_id" uuid,
	"placeholder_id" uuid,
	"former_at" timestamp with time zone,
	"former_no" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "trip_cost_party_kind_check" CHECK (not ("trip_cost_party"."user_id" is not null and "trip_cost_party"."placeholder_id" is not null))
);
--> statement-breakpoint
CREATE TABLE "trip_expense" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"trip_id" uuid NOT NULL,
	"title" text NOT NULL,
	"note" text,
	"amount_cents" integer NOT NULL,
	"currency" text NOT NULL,
	"category" text,
	"spent_on" date NOT NULL,
	"payer_party_id" uuid NOT NULL,
	"split_mode" text NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"deleted_at" timestamp with time zone,
	"deleted_by" uuid,
	"idempotency_key" text,
	CONSTRAINT "trip_expense_values_check" CHECK (char_length("trip_expense"."title") between 1 and 60
        and coalesce(char_length("trip_expense"."note"), 0) <= 200
        and "trip_expense"."amount_cents" between 1 and 100000000
        and "trip_expense"."currency" ~ '^[A-Z]{3}$'
        and "trip_expense"."version" >= 1
        and coalesce(char_length("trip_expense"."idempotency_key"), 0) <= 64),
	CONSTRAINT "trip_expense_category_check" CHECK ("trip_expense"."category" is null or "trip_expense"."category" in ('accommodation', 'travel', 'food', 'activities', 'other')),
	CONSTRAINT "trip_expense_split_check" CHECK ("trip_expense"."split_mode" in ('equal', 'amounts'))
);
--> statement-breakpoint
CREATE TABLE "trip_expense_share" (
	"expense_id" uuid NOT NULL,
	"trip_id" uuid NOT NULL,
	"party_id" uuid NOT NULL,
	"share_cents" integer NOT NULL,
	CONSTRAINT "trip_expense_share_expense_id_party_id_pk" PRIMARY KEY("expense_id","party_id"),
	CONSTRAINT "trip_expense_share_cents_check" CHECK ("trip_expense_share"."share_cents" between 0 and 100000000)
);
--> statement-breakpoint
CREATE TABLE "trip_settlement" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"trip_id" uuid NOT NULL,
	"from_party_id" uuid NOT NULL,
	"to_party_id" uuid NOT NULL,
	"amount_cents" integer NOT NULL,
	"marked_by" uuid,
	"marked_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "trip_settlement_values_check" CHECK ("trip_settlement"."from_party_id" <> "trip_settlement"."to_party_id" and "trip_settlement"."amount_cents" between 1 and 2000000000)
);
--> statement-breakpoint
CREATE UNIQUE INDEX "trip_cost_party_seq_idx" ON "trip_cost_party" USING btree ("trip_id","seq");--> statement-breakpoint
CREATE UNIQUE INDEX "trip_cost_party_id_trip_idx" ON "trip_cost_party" USING btree ("id","trip_id");--> statement-breakpoint
CREATE UNIQUE INDEX "trip_cost_party_user_idx" ON "trip_cost_party" USING btree ("trip_id","user_id") WHERE "trip_cost_party"."user_id" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "trip_cost_party_placeholder_idx" ON "trip_cost_party" USING btree ("trip_id","placeholder_id") WHERE "trip_cost_party"."placeholder_id" is not null;--> statement-breakpoint
CREATE INDEX "trip_expense_trip_spent_idx" ON "trip_expense" USING btree ("trip_id","spent_on" DESC NULLS LAST);--> statement-breakpoint
CREATE UNIQUE INDEX "trip_expense_id_trip_idx" ON "trip_expense" USING btree ("id","trip_id");--> statement-breakpoint
CREATE UNIQUE INDEX "trip_expense_idempotency_idx" ON "trip_expense" USING btree ("trip_id","idempotency_key") WHERE "trip_expense"."idempotency_key" is not null;--> statement-breakpoint
CREATE INDEX "trip_expense_deleted_idx" ON "trip_expense" USING btree ("deleted_at") WHERE "trip_expense"."deleted_at" is not null;--> statement-breakpoint
CREATE INDEX "trip_expense_share_party_idx" ON "trip_expense_share" USING btree ("party_id");--> statement-breakpoint
CREATE INDEX "trip_settlement_trip_idx" ON "trip_settlement" USING btree ("trip_id","marked_at");--> statement-breakpoint
ALTER TABLE "trip" ADD COLUMN "costs_closed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "trip" ADD COLUMN "costs_closed_by" uuid;--> statement-breakpoint
ALTER TABLE "trip_member" ADD COLUMN "payment_iban" text;--> statement-breakpoint
ALTER TABLE "trip_member" ADD COLUMN "payment_note" text;--> statement-breakpoint
ALTER TABLE "trip_member" ADD COLUMN "payment_updated_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "trip_cost_party" ADD CONSTRAINT "trip_cost_party_trip_id_trip_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trip"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_cost_party" ADD CONSTRAINT "trip_cost_party_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_cost_party" ADD CONSTRAINT "trip_cost_party_placeholder_id_trip_placeholder_id_fk" FOREIGN KEY ("placeholder_id") REFERENCES "public"."trip_placeholder"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_expense" ADD CONSTRAINT "trip_expense_trip_id_trip_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trip"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_expense" ADD CONSTRAINT "trip_expense_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_expense" ADD CONSTRAINT "trip_expense_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_expense" ADD CONSTRAINT "trip_expense_deleted_by_user_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_expense" ADD CONSTRAINT "trip_expense_payer_fk" FOREIGN KEY ("payer_party_id","trip_id") REFERENCES "public"."trip_cost_party"("id","trip_id") ON DELETE no action ON UPDATE no action DEFERRABLE INITIALLY DEFERRED;--> statement-breakpoint
ALTER TABLE "trip_expense_share" ADD CONSTRAINT "trip_expense_share_expense_fk" FOREIGN KEY ("expense_id","trip_id") REFERENCES "public"."trip_expense"("id","trip_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_expense_share" ADD CONSTRAINT "trip_expense_share_party_fk" FOREIGN KEY ("party_id","trip_id") REFERENCES "public"."trip_cost_party"("id","trip_id") ON DELETE no action ON UPDATE no action DEFERRABLE INITIALLY DEFERRED;--> statement-breakpoint
ALTER TABLE "trip_settlement" ADD CONSTRAINT "trip_settlement_trip_id_trip_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trip"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_settlement" ADD CONSTRAINT "trip_settlement_marked_by_user_id_fk" FOREIGN KEY ("marked_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_settlement" ADD CONSTRAINT "trip_settlement_from_fk" FOREIGN KEY ("from_party_id","trip_id") REFERENCES "public"."trip_cost_party"("id","trip_id") ON DELETE no action ON UPDATE no action DEFERRABLE INITIALLY DEFERRED;--> statement-breakpoint
ALTER TABLE "trip_settlement" ADD CONSTRAINT "trip_settlement_to_fk" FOREIGN KEY ("to_party_id","trip_id") REFERENCES "public"."trip_cost_party"("id","trip_id") ON DELETE no action ON UPDATE no action DEFERRABLE INITIALLY DEFERRED;--> statement-breakpoint
ALTER TABLE "trip" ADD CONSTRAINT "trip_costs_closed_by_user_id_fk" FOREIGN KEY ("costs_closed_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_member" ADD CONSTRAINT "trip_member_payment_check" CHECK (("trip_member"."payment_iban" is null or "trip_member"."payment_iban" ~ '^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$')
        and coalesce(char_length("trip_member"."payment_note"), 0) <= 100);
--> statement-breakpoint
CREATE FUNCTION "trip_expense_share_sum_check"() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  eid uuid;
  amount integer;
  total bigint;
BEGIN
  IF TG_TABLE_NAME = 'trip_expense' THEN
    eid := NEW.id;
  ELSIF TG_OP = 'DELETE' THEN
    eid := OLD.expense_id;
  ELSE
    eid := NEW.expense_id;
  END IF;
  SELECT e.amount_cents INTO amount FROM "trip_expense" e WHERE e.id = eid;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  SELECT coalesce(sum(s.share_cents), 0) INTO total FROM "trip_expense_share" s WHERE s.expense_id = eid;
  IF total <> amount THEN
    RAISE EXCEPTION 'trip_expense_share_sum' USING ERRCODE = '23514';
  END IF;
  RETURN NULL;
END
$$;
--> statement-breakpoint
CREATE CONSTRAINT TRIGGER "trip_expense_share_sum" AFTER INSERT OR UPDATE OR DELETE ON "trip_expense_share" DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION "trip_expense_share_sum_check"();
--> statement-breakpoint
CREATE CONSTRAINT TRIGGER "trip_expense_amount_sum" AFTER INSERT OR UPDATE OF "amount_cents" ON "trip_expense" DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION "trip_expense_share_sum_check"();
