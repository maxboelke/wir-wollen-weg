ALTER TABLE "user" ADD COLUMN "beta_consent_version" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "beta_consent_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "beta_signup_via" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "install_hint_seen_at" timestamp with time zone;