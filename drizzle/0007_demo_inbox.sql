-- Online preview (PRD Q25): demo inbox for MAIL_TRANSPORT=inbox – outgoing mails are stored
-- here and shown on /demo/postfach instead of being sent. Rows live at most 24 hours.
CREATE TABLE "demo_mail" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"to_address" text NOT NULL,
	"subject" text NOT NULL,
	"text" text NOT NULL,
	"html" text NOT NULL,
	"code" text,
	"link" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "demo_mail_created_idx" ON "demo_mail" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "demo_mail_to_idx" ON "demo_mail" USING btree ("to_address","created_at");