import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Illustration } from "@/components/illustrations/illustration";
import { SealMotion } from "@/components/seal-motion";
import { DaysEditor } from "@/features/days/components/days-editor";
import type { DayMonth, WeekdayHeader } from "@/features/days/components/month-grid";
import { TripShell } from "@/features/trips/components/trip-shell";
import { WelcomeHint } from "@/features/trips/components/welcome-hint";
import { loadTripView } from "@/features/trips/load";
import { tripPath } from "@/features/trips/paths";
import { buildMonths, weekdayColumns } from "@/lib/calendar";
import { addDays, addMonths, toUtcDate, type IsoDate } from "@/lib/dates";
import { firstName } from "@/lib/display-name";
import { holidaysInRange } from "@/lib/holidays";
import { firstDayOfWeek, isWeekStart } from "@/lib/region";
import { BUILT_TABS } from "@/lib/trip-status";
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

function utcFormat(intl: string, options: Intl.DateTimeFormatOptions) {
  const format = new Intl.DateTimeFormat(intl, { ...options, timeZone: "UTC" });
  return (date: IsoDate) => format.format(toUtcDate(date));
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
  const tRegions = await getTranslations("regions");
  const { trip, me, format, phase, session, today } = view;

  const weekStart = isWeekStart(session.user.weekStart) ? session.user.weekStart : "auto";
  const firstDay = firstDayOfWeek(weekStart, format.country);
  const calendar = buildMonths(trip.rangeStart, trip.rangeEnd, firstDay);
  const gridStart = calendar[0]?.first ?? trip.rangeStart;
  const gridEnd = addDays(addMonths(calendar.at(-1)?.first ?? trip.rangeEnd, 1), -1);

  const monthName = utcFormat(format.intl, { month: "long" });
  const monthHeading = utcFormat(format.intl, { month: "long", year: "numeric" });
  const longDate = utcFormat(format.intl, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const shortDate = utcFormat(
    format.intl,
    format.locale === "de"
      ? { day: "numeric", month: "numeric" }
      : { day: "numeric", month: "short" },
  );

  const months: DayMonth[] = calendar.map((month) => ({
    key: month.key,
    heading: monthHeading(month.first),
    holidaysLabel: t("holidaysIn", { month: monthName(month.first) }),
    weeks: month.weeks,
  }));
  // 2027-07-04 is a Sunday – weekday names from a known week.
  const weekdayShort = utcFormat(format.intl, { weekday: "short" });
  const weekdayLong = utcFormat(format.intl, { weekday: "long" });
  const weekdays: WeekdayHeader[] = weekdayColumns(firstDay).map((day) => {
    const sample = addDays("2027-07-04", day);
    return {
      short: weekdayShort(sample),
      long: weekdayLong(sample),
      weekend: day === 0 || day === 6,
    };
  });
  const dateLabels: Record<IsoDate, string> = {};
  for (const month of calendar) {
    for (const date of month.weeks.flat()) if (date) dateLabels[date] = longDate(date);
  }

  const ownRegion = format.region;
  const tripRegion = trip.holidaySubdivision ?? trip.holidayCountry;
  const holidays = holidaysInRange(ownRegion, gridStart, gridEnd, format.locale);
  const tripHolidays =
    tripRegion !== ownRegion
      ? holidaysInRange(tripRegion, gridStart, gridEnd, format.locale)
      : null;
  const shortDates: Record<IsoDate, string> = {};
  for (const holiday of [...holidays, ...(tripHolidays ?? [])]) {
    shortDates[holiday.date] = shortDate(holiday.date);
  }
  const regionName = (code: string) =>
    code.includes("-")
      ? tRegions(`subdivisions.${code}` as never)
      : tRegions(`countries.${code}` as never);

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
          months={months}
          weekdays={weekdays}
          dateLabels={dateLabels}
          shortDates={shortDates}
          firstDay={firstDay}
          holidays={holidays}
          tripHolidays={tripHolidays}
          regionLabel={regionName(ownRegion)}
          tripRegionLabel={tripHolidays ? regionName(tripRegion) : null}
          accountHref="/account"
          initial={entries}
          submittedAt={me.submittedAt?.toISOString() ?? null}
          updatedAt={me.availabilityUpdatedAt?.toISOString() ?? null}
          comment={me.comment ?? ""}
          mode={mode}
          voting={phase === "vote"}
          askFeedback={!answered}
          doneHref={tripPath(trip.publicId, BUILT_TABS.has("group") ? "group" : "overview")}
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
