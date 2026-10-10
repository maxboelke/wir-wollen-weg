import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import { Illustration } from "@/components/illustrations/illustration";
import { KpiBox } from "@/components/ui/cockpit";
import { ButtonLink } from "@/components/ui/button-link";
import { GroupView, type GroupPerson } from "@/features/group/components/group-view";
import { LEGEND_COOKIE } from "@/features/group/legend-cookie";
import { tripCalendar, utcFormat } from "@/features/trips/calendar-format";
import { RingDraw } from "@/features/trips/components/ring-draw";
import { TripShell } from "@/features/trips/components/trip-shell";
import { nameList } from "@/features/trips/format";
import { loadTripView, openNames, type TripView } from "@/features/trips/load";
import { tripPath } from "@/features/trips/paths";
import { datesBetween } from "@/lib/calendar";
import type { IsoDate } from "@/lib/dates";
import { listSubmittedAvailability } from "@/server/availability";

type Params = PageProps<"/trips/[id]/group">;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const [t, view] = await Promise.all([
    getTranslations("trip"),
    loadTripView(id, `/trips/${id}/group`),
  ]);
  return { title: `${t("tabs.group")} · ${view.trip.name}` };
}

/**
 * KPI box of the group tab (ux-spec §4.10, W09-09): ring + «5 von 7 haben abgegeben» + who is
 * still open (members, then placeholders – Q20). Everyone in → «Alle haben abgegeben.» and the
 * organiser gets «Abstimmung starten». «Erinnern» comes with F-015 (Increment 7).
 */
async function GroupKpi({ view }: { view: TripView }) {
  const t = await getTranslations("trip");
  const tGroup = await getTranslations("group");
  const { progress, trip, format, phase, isOrganizer } = view;
  if (!progress || phase !== "collect") return null;
  const open = openNames(view);
  const allIn = open.length === 0;
  return (
    <RingDraw sessionKey={`kpi:${trip.publicId}:group`}>
      <KpiBox
        value={progress.done}
        max={progress.total}
        title={t("kpiSubmitted", { done: progress.done, total: progress.total })}
        text={
          allIn
            ? t("kpiAllDone")
            : tGroup("kpiOpen", {
                names: nameList(open, format.locale, (count) => t("kpiMore", { count })),
              })
        }
        action={
          allIn && isOrganizer ? (
            <ButtonLink href={tripPath(trip.publicId, "poll")} variant="accent" size="sm">
              {tGroup("startVote")}
            </ButtonLink>
          ) : undefined
        }
      />
    </RingDraw>
  );
}

/**
 * W09 «Gruppe» (F-008 heatmap, F-009 suggestions, F-016 holidays): the server loads the
 * SUBMITTED days only (drafts never leave the server) of a trip the viewer is a member of
 * (`loadTripView` → «Reise nicht gefunden» otherwise) and formats all dates; counting,
 * suggestions and the local filters run in the client component (pure functions).
 */
export default async function GroupPage({ params }: Params) {
  const { id } = await params;
  const view = await loadTripView(id, `/trips/${id}/group`);
  const tTrip = await getTranslations("trip");
  const { trip, me, members, placeholders, format, today, isOrganizer } = view;
  const calendar = await tripCalendar(view);
  const rows = await listSubmittedAvailability(trip.id);

  const byUser = new Map<string, [IsoDate, "no" | "maybe"][]>();
  for (const row of rows) {
    const list = byUser.get(row.userId) ?? [];
    list.push([row.day, row.state]);
    byUser.set(row.userId, list);
  }
  const people: GroupPerson[] = members
    .filter((m) => m.submittedAt)
    .map((m) => ({
      key: m.userId,
      name: m.displayName,
      me: m.userId === me.userId,
      comment: m.comment,
      entries: byUser.get(m.userId) ?? [],
    }));
  const pending = [
    ...members
      .filter((m) => !m.submittedAt)
      .map((m) => ({ key: m.userId, name: m.displayName, placeholder: false })),
    ...placeholders.map((p) => ({ key: p.id, name: p.displayName, placeholder: true })),
  ];

  // Short dates for suggestion ranges («Mi., 5. Mai»), the year only when it differs from now.
  const thisYear = today.slice(0, 4);
  const withYear = utcFormat(format.intl, {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const withoutYear = utcFormat(format.intl, { weekday: "short", day: "numeric", month: "long" });
  const shortLabels: Record<IsoDate, string> = {};
  for (const date of datesBetween(trip.rangeStart, trip.rangeEnd)) {
    shortLabels[date] = date.slice(0, 4) === thisYear ? withoutYear(date) : withYear(date);
  }
  const cookieStore = await cookies();

  return (
    <TripShell view={view} tab="group" kpi={<GroupKpi view={view} />}>
      <h1 className="visually-hidden">{`${tTrip("tabs.group")} · ${trip.name}`}</h1>
      <GroupView
        publicId={trip.publicId}
        today={today}
        rangeStart={trip.rangeStart}
        rangeEnd={trip.rangeEnd}
        minNights={trip.minNights}
        preferredNights={trip.preferredNights ?? trip.minNights}
        months={calendar.months}
        weekdays={calendar.weekdays}
        firstDay={calendar.firstDay}
        dateLabels={calendar.dateLabels}
        shortLabels={shortLabels}
        holidays={calendar.holidays}
        shortDates={calendar.shortDates}
        people={people}
        pending={pending}
        isOrganizer={isOrganizer}
        locale={format.locale}
        emptyArt={<Illustration name="empty-nobody" width={180} />}
        noMatchArt={<Illustration name="no-matches" width={180} />}
        legendClosed={cookieStore.get(LEGEND_COOKIE)?.value === "closed"}
        daysHref={tripPath(trip.publicId, "days")}
        inviteHref={tripPath(trip.publicId, "invite")}
        settingsHref={tripPath(trip.publicId, "settings")}
        pollHref={tripPath(trip.publicId, "poll")}
        viewerSubmitted={me.submittedAt !== null}
      />
    </TripShell>
  );
}
