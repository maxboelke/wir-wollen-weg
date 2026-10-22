import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import { Illustration } from "@/components/illustrations/illustration";
import { redirect } from "next/navigation";
import { KpiBox } from "@/components/ui/cockpit";
import { ButtonLink } from "@/components/ui/button-link";
import { GroupView, type GroupPerson } from "@/features/group/components/group-view";
import { LEGEND_COOKIE } from "@/features/group/legend-cookie";
import { tripCalendar, utcFormat } from "@/features/trips/calendar-format";
import { RemindKpiButton } from "@/features/trips/components/remind-sheet";
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
  const title = view.trip.phase === "fixed" ? t("hub.groupTitle") : t("tabs.group");
  return { title: `${title} · ${view.trip.name}` };
}

/**
 * KPI box of the group tab (ux-spec §4.10, §14.2, W09-09): ring + «5 von 9 haben eingetragen»
 * + who is still open (members, then placeholders – Q20). While somebody is open the whole box
 * is a button → «Wer hat eingetragen?» with [Erinnern]. Everyone in → «Alle haben
 * eingetragen.» and the organiser gets «Abstimmung starten».
 */
async function GroupKpi({ view }: { view: TripView }) {
  const t = await getTranslations("trip");
  const tGroup = await getTranslations("group");
  const { progress, trip, format, phase, isOrganizer } = view;
  if (!progress || phase !== "collect") return null;
  const open = openNames(view);
  const allIn = open.length === 0;
  const title = t("kpiSubmitted", { done: progress.done, total: progress.total });
  const status = allIn
    ? t("kpiAllDone")
    : t("kpiOpen", { names: nameList(open, format.locale, (count) => t("kpiMore", { count })) });
  const box = (
    <KpiBox
      value={progress.done}
      max={progress.total}
      title={title}
      text={status}
      chevron={!allIn}
      action={
        allIn && isOrganizer ? (
          <ButtonLink href={tripPath(trip.publicId, "pollNew")} variant="accent" size="sm">
            {tGroup("startVote")}
          </ButtonLink>
        ) : undefined
      }
    />
  );
  return (
    <RingDraw sessionKey={`kpi:${trip.publicId}:group`}>
      {allIn ? (
        box
      ) : (
        <RemindKpiButton label={`${title}. ${status}. ${t("kpiListOpen")}`}>{box}</RemindKpiButton>
      )}
    </RingDraw>
  );
}

/**
 * «Basiert auf 5 von 9 – noch offen: du, Kemal und Sara.» (ux-spec §14.3): counts dates
 * added (placeholders count, Q20) in phase 1 and 2; null when everyone is in or nobody is.
 */
async function basedOnHint(view: TripView) {
  const t = await getTranslations("trip");
  const tGroup = await getTranslations("group");
  const { members, placeholders, me, format } = view;
  const done = members.filter((m) => m.submittedAt).length;
  const total = members.length + placeholders.length;
  if (done === 0 || done === total) return null;
  const others = [
    ...members.filter((m) => !m.submittedAt && m.userId !== me.userId).map((m) => m.displayName),
    ...placeholders.map((p) => p.displayName),
  ];
  const open = me.submittedAt ? others : [t("you"), ...others];
  return {
    done,
    total,
    text: tGroup("basedOn", {
      done,
      total,
      names: nameList(open, format.locale, (count) => t("kpiMore", { count })),
    }),
  };
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
  // Phase 3 (ux-spec §14.4): read-only sub-page «Kalender der Gruppe» – while the celebration
  // is still due for this person, the overview comes first.
  const settled = view.trip.phase === "fixed";
  if (settled && view.celebrate) redirect(tripPath(view.trip.publicId));
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
    <TripShell
      view={view}
      tab={settled ? null : "group"}
      subtitle={settled ? tTrip("hub.groupTitle") : undefined}
      kpi={settled ? undefined : <GroupKpi view={view} />}
    >
      <h1 className="visually-hidden">
        {`${settled ? tTrip("hub.groupTitle") : tTrip("tabs.group")} · ${trip.name}`}
      </h1>
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
        pollNewHref={tripPath(trip.publicId, "pollNew")}
        pollState={view.phase === "collect" ? "none" : view.phase === "vote" ? "open" : "closed"}
        viewerSubmitted={me.submittedAt !== null}
        basedOn={settled ? null : await basedOnHint(view)}
        readOnly={settled}
      />
    </TripShell>
  );
}
