-- R-039: display names unique per trip (case-insensitive). Before the index exists, parallel
-- renames could create duplicates; rename those (keep the organiser, then the earliest
-- member) to the first free «Name 2», «Name 3», … within the 40-character limit.
DO $$
DECLARE
  dup record;
  base text;
  candidate text;
  n int;
BEGIN
  FOR dup IN
    SELECT trip_id, user_id, display_name FROM (
      SELECT trip_id, user_id, display_name,
             row_number() OVER (
               PARTITION BY trip_id, lower(display_name)
               ORDER BY (role = 'organizer') DESC, joined_at, user_id
             ) AS rn
        FROM trip_member
    ) ranked
    WHERE rn > 1
  LOOP
    n := 2;
    LOOP
      base := left(dup.display_name, 40 - length(' ' || n));
      candidate := base || ' ' || n;
      EXIT WHEN NOT EXISTS (
        SELECT 1 FROM trip_member
         WHERE trip_id = dup.trip_id AND lower(display_name) = lower(candidate)
      );
      n := n + 1;
    END LOOP;
    UPDATE trip_member SET display_name = candidate
     WHERE trip_id = dup.trip_id AND user_id = dup.user_id;
  END LOOP;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX "trip_member_trip_name_idx" ON "trip_member" USING btree ("trip_id",lower("display_name"));
