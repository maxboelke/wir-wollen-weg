-- R-069 (ux-spec §14.4): the notice «{orga} hat den Termin wieder geöffnet» gets its own flag
-- instead of the prefix «~seen:» in celebrated_for. Existing data: an unprefixed range in a
-- running vote meant «notice still due» for members; afterwards the prefix is removed so that
-- celebrated_for holds the plain celebrated range again.
ALTER TABLE "trip_member" ADD COLUMN "reopen_notice_due" boolean DEFAULT false NOT NULL;--> statement-breakpoint
UPDATE "trip_member" AS m SET "reopen_notice_due" = true
  FROM "trip" AS t
  WHERE t."id" = m."trip_id" AND t."phase" = 'voting' AND m."role" <> 'organizer'
    AND m."celebrated_for" IS NOT NULL AND left(m."celebrated_for", 6) <> '~seen:';--> statement-breakpoint
UPDATE "trip_member" SET "celebrated_for" = substr("celebrated_for", 7)
  WHERE left("celebrated_for", 6) = '~seen:';
