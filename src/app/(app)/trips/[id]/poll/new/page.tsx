import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { CreatePoll, type DraftOption } from "@/features/poll/components/create-poll";
import { pollPeople, shortLabels, viewerHolidays } from "@/features/poll/load";
import { TripShell } from "@/features/trips/components/trip-shell";
import { loadTripView } from "@/features/trips/load";
import { tripPath } from "@/features/trips/paths";
import { isIsoDate } from "@/lib/dates";
import { concreteWindow, MAX_OPTIONS, nightsOf, periodKey, type Period } from "@/lib/poll";
import { computeSuggestions } from "@/lib/suggestions";

type Params = PageProps<"/trips/[id]/poll/new">;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const [t, view] = await Promise.all([
    getTranslations("poll.create"),
    loadTripView(id, `/trips/${id}/poll/new`),
  ]);
  return { title: `${t("title")} · ${view.trip.name}` };
}

/** «pick=2027-05-05~2027-05-12,…» from the «Zur Abstimmung» ticks in «Gruppe» (W09). */
function picksFrom(
  value: string | string[] | undefined,
  range: Period,
  minNights: number,
): Period[] {
  const raw = Array.isArray(value) ? value.join(",") : (value ?? "");
  const out: Period[] = [];
  for (const part of raw.split(",").slice(0, MAX_OPTIONS)) {
    const [start, end] = part.split("~");
    if (!isIsoDate(start) || !isIsoDate(end) || end <= start) continue;
    if (start < range.start || end > range.end) continue;
    // Spans shorter than the trip minimum (local «Dauer» filter, A3) cannot become options.
    if (nightsOf({ start, end }) < minNights) continue;
    out.push({ start, end });
  }
  return out;
}

/**
 * W10 A «Abstimmung erstellen» (F-010, organiser only, phase «Tage sammeln»). Members, or a
 * vote that already runs, go to the tab «Abstimmen» – the action checks again (F-004).
 * Pre-selection (F-010): the spans ticked in «Gruppe», otherwise the top 3 suggestions of
 * F-009 – each as a concrete period in the wished length.
 */
export default async function CreatePollPage({ params, searchParams }: Params) {
  const { id } = await params;
  const query = await searchParams;
  const view = await loadTripView(id, `/trips/${id}/poll/new`);
  const { trip, today, format, isOrganizer, phase } = view;
  if (!isOrganizer || phase !== "collect") redirect(tripPath(trip.publicId, "poll"));
  const people = await pollPeople(view);
  const wished = trip.preferredNights ?? trip.minNights;
  const from = trip.rangeStart > today ? trip.rangeStart : today;
  const picked = picksFrom(query.pick, { start: from, end: trip.rangeEnd }, trip.minNights);
  let spans: Period[] = picked;
  if (spans.length === 0 && people.participants.length > 0 && from < trip.rangeEnd) {
    const result = computeSuggestions({
      from,
      to: trip.rangeEnd,
      participants: people.participants,
      minNights: trip.minNights,
      targetNights: wished,
      tolerance: Math.min(1, people.participants.length - 1),
    });
    spans = [...result.all, ...result.almost].slice(0, 3);
  }
  const seen = new Set<string>();
  const initial: DraftOption[] = [];
  for (const span of spans) {
    const window = concreteWindow(span, wished);
    if (seen.has(periodKey(window))) continue;
    seen.add(periodKey(window));
    initial.push({ ...window, span: { start: span.start, end: span.end } });
  }

  return (
    <TripShell view={view} tab={null} subtitle={(await getTranslations("poll.create"))("title")}>
      <CreatePoll
        publicId={trip.publicId}
        today={today}
        rangeStart={trip.rangeStart}
        rangeEnd={trip.rangeEnd}
        minNights={trip.minNights}
        labels={shortLabels(view)}
        holidays={viewerHolidays(view)}
        people={people.people}
        initial={initial}
        cancelHref={tripPath(trip.publicId, "poll")}
        pollHref={tripPath(trip.publicId, "poll")}
        intl={format.intl}
      />
    </TripShell>
  );
}
