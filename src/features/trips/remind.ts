import "server-only";
import { getTranslations } from "next-intl/server";
import { locales, type Locale } from "@/i18n/config";
import { formatDate, isoDateInZone } from "@/lib/dates";
import {
  NAMES_TOKEN,
  remindCase,
  remindGroups,
  type RemindGroups,
  type RemindPerson,
  type RemindPhase,
} from "@/lib/remind";
import { shareTextIntl } from "@/lib/share-text";
import { nextStep, type NextStep, type OrgaNudge } from "@/lib/trip-status";
import type { TripView } from "./load";
import { tripPath } from "./paths";
import type { RemindAllTemplates, RemindPersonView, RemindSheetData } from "./remind-types";
import { inviteLink, tripLink } from "./share-texts";

/** Phase 1/2 of the trip as remind phase – null in phase 3 and «past» (no reminders, §14.4). */
export function remindPhase(view: TripView): RemindPhase | null {
  return view.phase === "collect" || view.phase === "vote" ? view.phase : null;
}

/** Display name of the organiser in this trip («{orga}», §14.1 rule 4). */
export function orgaName(view: TripView): string {
  return view.members.find((m) => m.role === "organizer")?.displayName ?? "";
}

/** «Fehlt noch» / «Eingetragen bzw. Abgestimmt» of the trip for the viewer. */
export function tripRemindGroups(view: TripView, phase: RemindPhase): RemindGroups {
  return remindGroups(
    phase,
    view.members.map((m) => ({
      key: m.userId,
      name: m.displayName,
      kind: "member" as const,
      organizer: m.role === "organizer",
      done: phase === "vote" ? m.votedAt !== null : m.submittedAt !== null,
    })),
    view.placeholders.map((p) => ({
      key: p.id,
      name: p.displayName,
      kind: "placeholder" as const,
      organizer: false,
      done: false,
    })),
    view.me.userId,
  );
}

/** «Nächster Schritt» of the viewer (ux-spec §14.1) from the loaded trip. */
export function tripNextStep(view: TripView): NextStep | null {
  const { trip, phase, members, placeholders, me, today } = view;
  return nextStep({
    phase,
    storedPhase: trip.phase,
    viewerId: me.userId,
    members: members.map((m) => ({
      userId: m.userId,
      role: m.role,
      done: phase === "vote" ? m.votedAt !== null : m.submittedAt !== null,
    })),
    placeholders: placeholders.map((p) => p.displayName),
    deadline: phase === "vote" ? trip.pollDeadline : trip.deadline,
    today,
  });
}

type Texts = Record<Locale, string>;

async function perLocale<T = string>(
  render: (locale: Locale) => Promise<T>,
): Promise<Record<Locale, T>> {
  const entries = await Promise.all(
    locales.map(async (locale) => [locale, await render(locale)] as const),
  );
  return Object.fromEntries(entries) as Record<Locale, T>;
}

const NUDGE_KEY = {
  p1All: "nudgeP1All",
  p1Deadline: "nudgeP1Deadline",
  p2All: "nudgeP2All",
  p2Deadline: "nudgeP2Deadline",
} as const satisfies Record<OrgaNudge, string>;

/** «{orga} Bescheid geben» texts (§14.1) – link = overview of the trip. */
export async function orgaNudgeShareTexts(view: TripView, nudge: OrgaNudge): Promise<Texts> {
  const link = tripLink(tripPath(view.trip.publicId));
  return perLocale(async (locale) => {
    const t = await getTranslations({ locale, namespace: "share.remind" });
    return t(NUDGE_KEY[nudge], { orga: orgaName(view), trip: view.trip.name, link });
  });
}

/**
 * Everything the remind sheet needs (ux-spec §14.2), texts ready in both languages like the
 * share panel. Security: texts with a placeholder's PERSONAL link are only rendered for the
 * organiser – members get «{orga} Bescheid geben» instead (F-007, `load.ts`).
 */
export async function remindSheetData(view: TripView): Promise<RemindSheetData | null> {
  const phase = remindPhase(view);
  if (!phase) return null;
  const { trip, format, isOrganizer, today } = view;
  const t = await getTranslations("trip");
  const groups = tripRemindGroups(view, phase);
  const deadline = phase === "vote" ? trip.pollDeadline : trip.deadline;
  const deadlineAhead = deadline !== null && deadline >= today;
  const openCount = groups.open.length;
  const memberLink = tripLink(tripPath(trip.publicId, phase === "vote" ? "poll" : "days"));
  const overviewLink = tripLink(tripPath(trip.publicId));
  const orga = orgaName(view);
  const tokens = new Map(view.placeholders.map((p) => [p.id, p.inviteToken]));
  const byUser = new Map(view.members.map((m) => [m.userId, m]));

  const status = (person: RemindPerson): string => {
    if (person.kind === "placeholder") return t("status.placeholder");
    if (!person.done) return t(phase === "vote" ? "status.openVote" : "status.openCollect");
    if (phase === "vote") return t("status.voted");
    const member = byUser.get(person.key);
    const changed = member?.availabilityUpdatedAt ?? member?.submittedAt;
    return changed
      ? t("status.submittedOn", {
          date: formatDate(isoDateInZone(changed), format.intl, {
            weekday: false,
            year: false,
          }),
        })
      : t("status.submitted");
  };

  const singleTexts = async (person: RemindPerson): Promise<Texts | null> => {
    if (person.me || person.done) return null;
    if (person.kind === "placeholder" && !isOrganizer) return null;
    const token = person.kind === "placeholder" ? tokens.get(person.key) : undefined;
    if (person.kind === "placeholder" && !token) return null;
    const variant = remindCase(phase, person, openCount, deadlineAhead);
    const link = token ? inviteLink(token) : memberLink;
    return perLocale(async (locale) => {
      const tt = await getTranslations({ locale, namespace: "share.remind" });
      return tt(variant, {
        name: person.name,
        trip: trip.name,
        link,
        deadline: deadline
          ? formatDate(deadline, shareTextIntl(locale, format.country), {
              weekday: true,
              year: false,
            })
          : "",
      });
    });
  };

  const orgaTexts = async (person: RemindPerson): Promise<Texts | null> => {
    if (isOrganizer || person.kind !== "placeholder") return null;
    return perLocale(async (locale) => {
      const tt = await getTranslations({ locale, namespace: "share.remind" });
      return tt("nudgePlaceholder", {
        orga,
        name: person.name,
        trip: trip.name,
        link: overviewLink,
      });
    });
  };

  const toView = async (person: RemindPerson): Promise<RemindPersonView> => ({
    key: person.key,
    name: person.name,
    kind: person.kind,
    organizer: person.organizer,
    me: person.me,
    done: person.done,
    status: status(person),
    texts: await singleTexts(person),
    orgaTexts: await orgaTexts(person),
  });

  const step = isOrganizer ? null : tripNextStep(view);
  const [open, done, all, nudge] = await Promise.all([
    Promise.all(groups.open.map(toView)),
    Promise.all(groups.done.map(toView)),
    perLocale<RemindAllTemplates>(async (locale) => {
      const tt = await getTranslations({ locale, namespace: "share.remind" });
      const tTrip = await getTranslations({ locale, namespace: "trip" });
      const values = { names: NAMES_TOKEN, trip: trip.name, link: memberLink };
      return {
        one: tt(phase === "vote" ? "allP2One" : "allP1One", values),
        many: tt(phase === "vote" ? "allP2Many" : "allP1Many", values),
        more: tTrip("kpiMore", { count: 0 }).replace("0", "#"),
      };
    }),
    step?.nudge ? orgaNudgeShareTexts(view, step.nudge) : Promise.resolve(null),
  ]);

  return {
    phase,
    tripName: trip.name,
    orgaName: orga,
    isOrganizer,
    defaultLocale: format.locale,
    progress: view.progress ?? { done: 0, total: 0 },
    ownHref: tripPath(trip.publicId, phase === "vote" ? "poll" : "days"),
    open,
    done,
    all,
    nudge,
  };
}
