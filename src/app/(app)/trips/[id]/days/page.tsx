import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Illustration } from "@/components/illustrations/illustration";
import { SealMotion } from "@/components/seal-motion";
import { DaysEditor } from "@/features/days/components/days-editor";
import { tripCalendar } from "@/features/trips/calendar-format";
import { TripShell } from "@/features/trips/components/trip-shell";
import { WelcomeHint } from "@/features/trips/components/welcome-hint";
import { loadTripView } from "@/features/trips/load";
import { tripPath } from "@/features/trips/paths";
import { firstName } from "@/lib/display-name";
import { hasAnsweredImportFeedback, listOwnAvailability } from "@/server/availability";
import styles from "./days.module.css";

type Params = PageProps<"/trips/[id]/days">;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const [t, view] = await Promise.all([
    getTranslations("trip"),
    loadTripView(id, `/trips/${id}/days`),
  ]);
  return { title: `${t("tabs.days")} · ${view.trip.name}` };
}

/**
 * W08 «Meine Tage» (F-005, F-016, F-007): the server prepares everything that is formatted
 * (month headings, weekday names, accessible day names, holiday names in the viewer's
 * language and region) so the client never formats differently during hydration; the
 * editor does the painting. Own data only – loaded through the viewer's membership.
 */
export default async function DaysPage({ params, searchParams }: Params) {
  const { id } = await params;
  const query = await searchParams;
  const view = await loadTripView(id, `/trips/${id}/days`);
  const t = await getTranslations("days");
  const tTrip = await getTranslations("trip");
  const { trip, me, phase, today, format } = view;
  const calendar = await tripCalendar(view);

  const [entries, answered] = await Promise.all([
    listOwnAvailability(trip.id, me.userId),
    hasAnsweredImportFeedback(me.userId),
  ]);
  const mode = phase === "fixed" ? "locked" : phase === "past" ? "lockedPast" : "edit";
  const welcome = query.welcome === "1";

  return (
    <TripShell view={view} tab="days">
      <div className={styles.page}>
        <h1 className="visually-hidden">{`${tTrip("tabs.days")} · ${trip.name}`}</h1>
        {welcome ? (
          <WelcomeHint
            title={t("welcome.title")}
            text={t("welcome.text")}
            closeLabel={tTrip("welcomeClose")}
            seal={
              <SealMotion size="md">
                <Illustration name="seal" width={40} />
              </SealMotion>
            }
            extra={
              <span className={styles.sketch} role="img" aria-label={t("welcome.sketch")}>
                <span />
                <span />
                <span />
                <span />
                <i />
              </span>
            }
          />
        ) : null}
        <DaysEditor
          publicId={trip.publicId}
          name={firstName(me.displayName)}
          today={today}
          rangeStart={trip.rangeStart}
          rangeEnd={trip.rangeEnd}
          intl={format.intl}
          months={calendar.months}
          weekdays={calendar.weekdays}
          dateLabels={calendar.dateLabels}
          shortDates={calendar.shortDates}
          firstDay={calendar.firstDay}
          holidays={calendar.holidays}
          tripHolidays={calendar.tripHolidays}
          regionLabel={calendar.regionName(calendar.ownRegion)}
          tripRegionLabel={calendar.tripHolidays ? calendar.regionName(calendar.tripRegion) : null}
          accountHref="/account"
          initial={entries}
          submittedAt={me.submittedAt?.toISOString() ?? null}
          updatedAt={me.availabilityUpdatedAt?.toISOString() ?? null}
          comment={me.comment ?? ""}
          mode={mode}
          voting={phase === "vote"}
          askFeedback={!answered}
          doneHref={tripPath(trip.publicId, "group")}
          loginHref={`/login?next=${encodeURIComponent(tripPath(trip.publicId, "days"))}`}
          successArt={
            <SealMotion size="lg">
              <Illustration name="seal" width={64} />
            </SealMotion>
          }
          gesture={welcome}
        />
      </div>
    </TripShell>
  );
}
