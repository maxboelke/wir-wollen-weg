import "server-only";
import { getTranslations } from "next-intl/server";
import type { TileTone } from "@/components/ui/card";
import type { IconName } from "@/components/ui/icon";
import { locales, type Locale } from "@/i18n/config";
import { formatDate, formatDateRange, toUtcDate, type IsoDate } from "@/lib/dates";
import { googleCalendarUrl } from "@/lib/ics";
import { nightsOf } from "@/lib/poll";
import { rankingVisible } from "@/lib/stays";
import { formatTime } from "@/lib/trip-info";
import type { Msg, RouteAction, RouteTarget, TripGoal, TripStation } from "@/lib/trip-route";
import { stayRemindData } from "../stays/remind";
import { nameList, nightsText, rangeText } from "../trips/format";
import type { TripView } from "../trips/load";
import { tripPath } from "../trips/paths";
import { orgaName } from "../trips/remind";
import { inviteLink, resultShareTexts, tripLink } from "../trips/share-texts";
import type { CockpitData } from "./load";
import type {
  CockpitAction,
  CockpitLink,
  CockpitSheetData,
  GoalView,
  RouteView,
  StationView,
  TicketView,
  TileView,
} from "./types";

type Values = Record<string, string | number>;

/** «Titel. Status» for accessible names – no extra full stop after «Es geht los!». */
function sentence(title: string, status: string): string {
  return /[.!?…]$/.test(title) ? `${title} ${status}` : `${title}. ${status}`;
}
type Translate = (key: string, values?: Values) => string;

interface Ctx {
  t: Translate;
  intl: string;
  locale: Locale;
  more: (count: number) => string;
}

/** Resolves a message of the way (`route.*`) with names, dates and times in the viewer's format. */
function text(ctx: Ctx, msg: Msg): string {
  const values: Values = {};
  for (const [key, value] of Object.entries(msg.values ?? {})) {
    if (typeof value === "string" || typeof value === "number") values[key] = value;
    else if ("names" in value) values[key] = nameList([...value.names], ctx.locale, ctx.more);
    else if ("date" in value) values[key] = formatDate(value.date, ctx.intl, { weekday: false });
    else if ("time" in value) values[key] = formatTime(value.time, ctx.intl);
    else values[key] = text(ctx, value.msg);
  }
  return ctx.t(msg.key, values);
}

/** «So., 2. Mai» */
function shortDate(date: IsoDate, intl: string): string {
  return formatDate(date, intl, { weekday: true, year: false });
}

/** «Sonntag, 2. Mai» – the long form for screen readers (h3 of «Heute»). */
function longDate(date: IsoDate, intl: string): string {
  return new Intl.DateTimeFormat(intl, {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(toUtcDate(date));
}

const LOOK: Record<string, { icon: IconName; tone: Exclude<TileTone, "brand"> }> = {
  V1: { icon: "vote", tone: "lavender" },
  V2: { icon: "users", tone: "mint" },
  V3: { icon: "bed", tone: "lavender" },
  A2: { icon: "info", tone: "lavender" },
  "T-meet": { icon: "users", tone: "lavender" },
};

function link(view: TripView, target: RouteTarget): CockpitLink {
  if (target.kind === "sheet") return target;
  const id = view.trip.publicId;
  switch (target.page) {
    case "info":
      return { kind: "path", href: `${tripPath(id)}/info` };
    case "infoEdit":
      return { kind: "path", href: `${tripPath(id)}/info/edit` };
    case "newTrip":
      return { kind: "path", href: "/trips/new" };
    case "stays":
      return { kind: "path", href: `${tripPath(id)}/stays` };
    case "staysSwipe":
      return { kind: "path", href: `${tripPath(id)}/stays/swipe` };
    case "staysRanking":
      return { kind: "path", href: `${tripPath(id)}/stays#ranking` };
  }
}

function action(view: TripView, value: RouteTarget | RouteAction): CockpitAction {
  switch (value.kind) {
    case "announce":
      return { kind: "announce" };
    case "withoutApp":
      return { kind: "withoutApp", placeholderId: value.placeholderId, name: value.name, on: true };
    case "undoWithoutApp":
      return {
        kind: "withoutApp",
        placeholderId: value.placeholderId,
        name: value.name,
        on: false,
      };
    case "stayWithoutApp":
      return { kind: "stayWithoutApp", on: value.on };
    default:
      return link(view, value);
  }
}

function stateWord(ctx: Ctx, station: TripStation): string {
  if (station.kind === "plan") return ctx.t("label.plan");
  if (station.kind === "task") {
    return ctx.t("label.task", { area: ctx.t("label.areaInfo") });
  }
  switch (station.state) {
    case "done":
      return station.unused ? ctx.t("label.unusedWord") : ctx.t("label.doneWord");
    case "yours":
      return ctx.t("label.yours");
    case "waiting":
      return ctx.t("label.waitingWord");
    case "next":
      return ctx.t("label.next");
    case "later":
      return ctx.t("label.later");
  }
}

function station(ctx: Ctx, view: TripView, value: TripStation): StationView {
  const label = stateWord(ctx, value);
  const title = text(ctx, value.title);
  const status = text(ctx, value.status);
  const detail = value.detail ? text(ctx, value.detail) : null;
  const look = LOOK[value.id] ?? { icon: "info", tone: "lavender" };
  return {
    id: value.id,
    kind: value.kind,
    state: value.state,
    label,
    title,
    status,
    ariaLabel: `${label}: ${sentence(title, status)}`,
    link: link(view, value.href),
    icon: look.icon,
    tone: look.tone,
    ...(value.primary
      ? {
          primary: {
            label: text(ctx, value.primary.label),
            action: action(view, value.primary.action),
            variant: "primary" as const,
          },
        }
      : {}),
    ...(value.remind
      ? {
          remind: {
            occasion: value.remind.occasion,
            keys: value.remind.keys,
            label: text(ctx, value.remind.label),
            name: text(ctx, value.remind.name),
          },
        }
      : {}),
    ...(value.textActions
      ? {
          textActions: value.textActions.map((item) => ({
            label: text(ctx, item.label),
            action: action(view, item.action),
          })),
        }
      : {}),
    ...(value.offline ? { offline: true } : {}),
    ...(value.unused ? { unused: true } : {}),
    ...(detail ? { detail } : {}),
    ...(value.progress !== undefined ? { progress: value.progress } : {}),
  };
}

function path(view: TripView, target: RouteTarget): string {
  const resolved = link(view, target);
  return resolved.kind === "path" ? resolved.href : tripPath(view.trip.publicId);
}

function goal(ctx: Ctx, view: TripView, value: TripGoal): GoalView {
  const word = ctx.t("label.goal");
  const title = text(ctx, value.title);
  const status = text(ctx, value.status);
  return {
    label: value.date ? `${word} · ${shortDate(value.date, view.format.intl)}` : word,
    title,
    status,
    ariaLabel: `${word}: ${sentence(title, status)}`,
    link: value.href ? link(view, value.href) : null,
    icon: value.id === "T-goal" ? "plane" : "sun",
    ...(value.button
      ? {
          button: {
            label: text(ctx, value.button.label),
            href: path(view, value.button.href),
          },
        }
      : {}),
    ...(value.note ? { note: text(ctx, value.note) } : {}),
  };
}

/** Way, «Immer griffbereit» and «Mehr zur Reise» – all texts resolved. */
export async function routeView(view: TripView, data: CockpitData): Promise<RouteView> {
  const [t, tTrip] = await Promise.all([getTranslations("route"), getTranslations("trip")]);
  const ctx: Ctx = {
    t: t as unknown as Translate,
    intl: view.format.intl,
    locale: view.format.locale,
    more: (count) => tTrip("kpiMore", { count }),
  };
  const { route } = data;
  const { intl } = view.format;
  const done = route.groups.done.map((s) => station(ctx, view, s));
  const today = route.heute.date;
  const heuteLabel = route.heute.label;
  const short =
    heuteLabel.kind === "date"
      ? t("today.short", { date: shortDate(today, intl) })
      : heuteLabel.kind === "day"
        ? t("today.dayShort", { day: heuteLabel.day, date: shortDate(today, intl) })
        : t("today.backShort", { count: heuteLabel.days });
  const long =
    heuteLabel.kind === "date"
      ? t("today.long", { date: longDate(today, intl) })
      : heuteLabel.kind === "day"
        ? t("today.dayLong", { day: heuteLabel.day, date: longDate(today, intl) })
        : t("today.backLong", { date: longDate(today, intl), count: heuteLabel.days });
  const tiles: TileView[] = route.tiles.map((tile) => {
    const title = text(ctx, tile.title);
    const status = tile.status.map((part) => text(ctx, part)).join(" · ");
    return {
      area: tile.area,
      title,
      status,
      ariaLabel: sentence(title, status),
      href: path(view, tile.href),
      icon: tile.area === "stay" ? "bed" : "info",
      tone: "lavender",
    };
  });
  const placeholders = view.placeholders.length;
  const orga = orgaName(view);
  return {
    sessionKey: view.trip.publicId,
    wayTitle: text(ctx, route.wayTitle),
    meta: route.meta ? text(ctx, route.meta) : null,
    done,
    doneSummary: route.doneSummary
      ? text(ctx, route.doneSummary)
      : t("done.list", { count: done.length, titles: done.map((s) => s.title).join(", ") }),
    heute: {
      short,
      long,
      sentence: text(ctx, route.heute.sentence),
      items: route.heute.items.map((s) => station(ctx, view, s)),
    },
    waiting: route.groups.waiting.map((s) => station(ctx, view, s)),
    next: route.groups.next ? station(ctx, view, route.groups.next) : null,
    later: route.groups.later.map((s) => station(ctx, view, s)),
    goal: goal(ctx, view, route.goal),
    tiles,
    more: {
      decided: { title: t("decided.title"), sub: t("decided.sub") },
      members: {
        title: t("members.title", { count: view.members.length }),
        sub:
          placeholders > 0
            ? t("members.subPlaceholders", { orga, count: placeholders })
            : t("members.sub", { orga }),
      },
    },
  };
}

/** Ticket head (W16 v2.2): ring, range, crew, calendar button. */
export async function ticketView(view: TripView, data: CockpitData): Promise<TicketView> {
  const [t, tResult] = await Promise.all([
    getTranslations("route"),
    getTranslations("poll.result"),
  ]);
  const ctx: Ctx = {
    t: t as unknown as Translate,
    intl: view.format.intl,
    locale: view.format.locale,
    more: (count) => String(count),
  };
  const { trip, members, format, today } = view;
  const { route } = data;
  const start = trip.fixedStart ?? today;
  const end = trip.fixedEnd ?? today;
  const ring = route.ring;
  const link = tripLink(tripPath(trip.publicId));
  return {
    phaseText: text(ctx, route.phaseLine),
    srSentence: text(ctx, route.srSentence),
    ring:
      ring.kind === "count"
        ? { kind: "count", count: ring.count, unit: t("ring.unit", { count: ring.count }) }
        : ring.kind === "day"
          ? {
              kind: "day",
              day: ring.day,
              top: t("ring.dayTop"),
              of: t("ring.dayOf", { total: ring.total }),
            }
          : { kind: "bye", text: t("ring.bye") },
    percent: ring.percent,
    ringName: text(ctx, route.ringLabel),
    range: formatDateRange(start, end, format.intl, { weekday: true, today }),
    crew: {
      avatars: members.slice(0, 3).map((m) => ({ id: m.userId, name: m.displayName })),
      more: Math.max(0, members.length - 3),
      text: t("crew", { count: members.length, nights: nightsOf({ start, end }) }),
    },
    calendar: route.headActions.includes("calendar")
      ? {
          icsHref: `${tripPath(trip.publicId)}/event.ics`,
          googleHref: googleCalendarUrl({
            title: trip.name,
            start,
            end,
            url: link,
            description: tResult("calendarDescription"),
          }),
        }
      : null,
    celebrate: view.celebrate,
    departureDue: data.departureDue,
  };
}

async function perLocale(render: (locale: Locale) => Promise<string>) {
  const entries = await Promise.all(
    locales.map(async (locale) => [locale, await render(locale)] as const),
  );
  return Object.fromEntries(entries) as Record<Locale, string>;
}

/**
 * Data of the cockpit sheets («Wer ist dabei?», «So habt ihr entschieden», reminders,
 * «Allen Bescheid geben»). Personal placeholder links are rendered for the organiser ONLY;
 * members get «{orga} Bescheid geben» texts with the normal trip link (F-007).
 */
export async function sheetData(view: TripView, data: CockpitData): Promise<CockpitSheetData> {
  const [t, tTrip] = await Promise.all([getTranslations("route"), getTranslations("trip")]);
  const { trip, members, placeholders, format, today, isOrganizer, me } = view;
  const orga = orgaName(view);
  const overview = tripLink(tripPath(trip.publicId));
  const start = trip.fixedStart ?? today;
  const end = trip.fixedEnd ?? today;
  const nights = nightsText(trip.minNights, trip.preferredNights, {
    nights: (count) => tTrip("nightsFact", { count }),
    range: (min, max) => tTrip("nightsRangeFact", { min, max }),
  });
  const sheetPlaceholders = await Promise.all(
    placeholders.map(async (p) => ({
      id: p.id,
      name: p.displayName,
      withoutApp: p.withoutApp,
      texts: isOrganizer
        ? await perLocale(async (locale) => {
            const tt = await getTranslations({ locale, namespace: "share.remind" });
            return tt("p3Placeholder", {
              name: p.displayName,
              trip: trip.name,
              link: inviteLink(p.inviteToken),
            });
          })
        : null,
      orgaTexts: isOrganizer
        ? null
        : await perLocale(async (locale) => {
            const tt = await getTranslations({ locale, namespace: "share.remind" });
            return tt("nudgePlaceholder", {
              orga,
              name: p.displayName,
              trip: trip.name,
              link: overview,
            });
          }),
    })),
  );
  const announce =
    isOrganizer && data.route.subphase === "before"
      ? {
          link: overview,
          texts: await resultShareTexts({
            tripName: trip.name,
            link: overview,
            start,
            end,
            nights: nightsOf({ start, end }),
            senderCountry: format.country,
          }),
        }
      : null;
  const shortRange = (a: IsoDate, b: IsoDate) =>
    formatDateRange(a, b, format.intl, { weekday: true, today });
  return {
    publicId: trip.publicId,
    tripName: trip.name,
    isOrganizer,
    orgaName: orga,
    defaultLocale: format.locale,
    members: members.map((m) => ({
      key: m.userId,
      name: m.displayName,
      organizer: m.role === "organizer",
      me: m.userId === me.userId,
    })),
    placeholders: sheetPlaceholders,
    announce,
    decided: {
      description: trip.description?.trim() ? trip.description : null,
      fixedBy: t("decided.fixedBy", {
        orga,
        date: formatDate(data.fixedOn, format.intl, { weekday: false }),
      }),
      range: shortRange(start, end),
      places: data.places.map((place) => ({
        label: t("decided.place", { rank: place.rank }),
        range: shortRange(place.start, place.end),
        votes: t("decided.votes", { ...place.tally }),
        fixed: place.fixed,
      })),
      noVotes: data.places.length === 0,
      pollHref: tripPath(trip.publicId, "poll"),
      groupHref: `${tripPath(trip.publicId, "group")}?view=calendar`,
      searched: tTrip("hub.searched", {
        range: rangeText(trip.rangeStart, trip.rangeEnd, format.intl, today),
        nights,
      }),
    },
    inviteHref:
      isOrganizer || (trip.joinOpen && !view.full) ? tripPath(trip.publicId, "invite") : null,
    manageHref: isOrganizer ? `${tripPath(trip.publicId, "invite")}#placeholders` : null,
    // Who has rated (names + open counts) only when the viewer's ranking is free – the same
    // rule as `openNames` on /stays (Q33, R.7 I9-06: a locked member gets the progress number).
    stayRemind:
      data.stay.total > 0 &&
      rankingVisible({
        organizer: isOrganizer,
        done: data.stay.myUnrated === 0,
        chosen: data.stay.chosen !== null,
      })
        ? await stayRemindData(view, data.staysRaw)
        : null,
  };
}
