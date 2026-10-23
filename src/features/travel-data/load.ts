import "server-only";
import { getTranslations } from "next-intl/server";
import { formatDate, formatDateRange, isoDateInZone, addDays, type IsoDate } from "@/lib/dates";
import {
  copyFieldsOf,
  DOCUMENT_TYPES,
  expiresBeforeReturn,
  maskDocumentNumber,
  TRAVEL_LIMITS,
  travelDeleteOn,
  type CopyField,
  type TravelValues,
} from "@/lib/travel-data";
import {
  bookerAccess,
  loadTravelRaw,
  readOwnRelease,
  type RawAccess,
  type TravelRaw,
} from "@/server/travel-data/db";
import { bookersOf } from "../trips/bookers";
import { nameList } from "../trips/format";
import type { TripView } from "../trips/load";
import { travelDataPath } from "../trips/paths";
import { displayValue, type ValueLabels } from "./format";
import { travelRemindData } from "./remind";
import { countsOf, deleted, memberName } from "./status";
import type {
  AccessLine,
  CountCard,
  OwnRequest,
  OwnValue,
  PersonCard,
  ToMeCard,
  TravelPageModel,
} from "./types";

type T = Awaited<ReturnType<typeof getTranslations<"travelData">>>;

export async function valueLabels(): Promise<ValueLabels> {
  const t = await getTranslations("travelData");
  return {
    sex: (code) => t(`sex.${code}`),
    documentType: (type) => t(`documentType.${type}`),
  };
}

function shortDate(at: Date | IsoDate, intl: string): string {
  const iso = typeof at === "string" ? at : isoDateInZone(at);
  return formatDate(iso, intl, { weekday: false, year: false });
}

function clock(at: Date, intl: string): string {
  return new Intl.DateTimeFormat(intl, {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: process.env.APP_TIME_ZONE || "Europe/Berlin",
  }).format(at);
}

/** «heute, 14:32» / «gestern, 09:10» / «3. Mai, 09:10» (W20 H.8). */
function when(t: T, at: Date, today: IsoDate, intl: string): string {
  const day = isoDateInZone(at);
  const time = clock(at, intl);
  if (day === today) return t("log.today", { time });
  if (day === addDays(today, -1)) return t("log.yesterday", { time });
  return t("log.date", { date: shortDate(day, intl), time });
}

/** Access log grouped per action, field and day – newest first (W20 H.8). */
export function groupAccess(
  rows: readonly RawAccess[],
  format: (at: Date) => string,
): AccessLine[] {
  const groups: (AccessLine & { at: Date; day: string })[] = [];
  for (const row of rows) {
    const day = isoDateInZone(row.at);
    const group = groups.find(
      (g) => g.action === row.action && g.field === row.field && g.day === day,
    );
    if (group) {
      group.count += 1;
      if (row.at > group.at) group.at = row.at;
    } else {
      groups.push({ action: row.action, field: row.field, count: 1, when: "", at: row.at, day });
    }
  }
  return groups
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .map(({ action, field, count, at }) => ({ action, field, count, when: format(at) }));
}

function ownValues(values: TravelValues, fields: CopyField[], format: Parameters<typeof displayValue>[2]): OwnValue[] {
  const out: OwnValue[] = [];
  for (const field of fields) {
    const shown = displayValue(field, values, format);
    if (shown === undefined) continue;
    out.push(
      field === "document_number"
        ? { field, value: maskDocumentNumber(shown), masked: true }
        : { field, value: shown },
    );
  }
  return out;
}

/**
 * View model of `/trips/{id}/travel-data` for ONE viewer (W20 H.3). Own values are decrypted
 * for the person themself only (`readOwnRelease`); the «Bucht» view gets server-side masks of
 * its OWN requests (`bookerAccess` mode «mask»); other people's requests appear as numbers and
 * states – for the organiser and «Bucht» only (R.9 «Rechte»).
 */
export async function travelPageModel(
  view: TripView,
  options: { demo: boolean; raw?: TravelRaw },
): Promise<TravelPageModel> {
  const { trip, me, format, today, members, placeholders, isOrganizer } = view;
  const fixedEnd = trip.fixedEnd ?? today;
  const raw = options.raw ?? (await loadTravelRaw(trip.id, me.userId));
  const [t, labels] = await Promise.all([getTranslations("travelData"), valueLabels()]);
  const valueFormat = { intl: format.intl, locale: format.locale, labels };
  const isBooker = me.bookerSince !== null;
  const gone = deleted(view);
  const afterTrip = today > fixedEnd;
  const deleteOnIso = travelDeleteOn(fixedEnd);
  const byId = new Map(raw.requests.map((r) => [r.id, r]));
  const bookers = bookersOf(members);

  // --- Requests to me (block 3) -------------------------------------------------------------
  const toMe: ToMeCard[] = [];
  for (const recipient of raw.recipients.filter((r) => r.userId === me.userId)) {
    const request = byId.get(recipient.requestId);
    if (!request) continue;
    const closed = request.closedAt !== null;
    // Closed requests stay visible only where the person's details were deleted (erloschen).
    if (closed && recipient.state !== "expired") continue;
    if (recipient.state === "expired" && recipient.dismissedAt) continue;
    let released: ToMeCard["released"] = null;
    if (recipient.state === "released" && recipient.release && !gone) {
      const values = await readOwnRelease(trip.id, me.userId, request.id);
      if (values) {
        released = {
          on: shortDate(recipient.release.consentAt, format.intl),
          values: ownValues(values, copyFieldsOf(request.fields), valueFormat),
          access: groupAccess(
            raw.myAccess.filter((a) => a.recipientId === recipient.id),
            (at) => when(t, at, today, format.intl),
          ),
          expiresBeforeReturn:
            values.documentExpiry && expiresBeforeReturn(values.documentExpiry, fixedEnd)
              ? formatDate(values.documentExpiry, format.intl, { weekday: false })
              : null,
          expired: values.documentExpiry !== undefined && values.documentExpiry < today,
        };
      }
    }
    const requester = members.find((m) => m.userId === request.requesterId);
    toMe.push({
      requestId: request.id,
      byKey: request.requesterId ?? request.id,
      byName: requester?.displayName ?? t("formerMember"),
      byIsBooker: requester?.bookerSince != null,
      purpose: request.purpose,
      fields: request.fields,
      askedOn: shortDate(request.createdAt, format.intl),
      state: recipient.state,
      expiredReason:
        recipient.state !== "expired"
          ? null
          : request.closedReason === "done"
            ? "closedByBooker"
            : request.closedReason === "booker_revoked"
              ? "bookerRevoked"
              : request.closedReason === "requester_left" || !requester
                ? "requesterLeft"
                : request.closedReason === "unfixed"
                  ? "unfixed"
                  : "expired",
      released,
      afterTrip,
    });
  }
  // Open first, then newest (W20 H.3).
  toMe.sort((a, b) =>
    a.state === "open" && b.state !== "open"
      ? -1
      : b.state === "open" && a.state !== "open"
        ? 1
        : (byId.get(b.requestId)?.createdAt.getTime() ?? 0) -
          (byId.get(a.requestId)?.createdAt.getTime() ?? 0),
  );

  // --- My requests as «Bucht» (block 4) -------------------------------------------------------
  const ownRequests = raw.requests.filter((r) => r.requesterId === me.userId);
  const masks =
    isBooker && !gone && ownRequests.some((r) => r.closedAt === null)
      ? await Promise.all(
          ownRequests
            .filter((r) => r.closedAt === null)
            .map((r) =>
              bookerAccess(trip.id, me.userId, view.session.session.id, {
                mode: "mask",
                requestId: r.id,
              }),
            ),
        )
      : [];
  const maskOf = new Map<string, Partial<Record<CopyField, string>>>();
  for (const result of masks) {
    if (result.ok && result.mode === "mask") {
      for (const [recipientId, mask] of Object.entries(result.masks)) maskOf.set(recipientId, mask);
    }
  }
  const mine: OwnRequest[] = ownRequests.map((request) => {
    const counts = countsOf(raw, request.id);
    const recipients = raw.recipients.filter((r) => r.requestId === request.id);
    const persons: PersonCard[] = recipients.map((r) => {
      if (r.placeholderId) {
        const placeholder = placeholders.find((p) => p.id === r.placeholderId);
        return {
          recipientId: r.id,
          key: r.placeholderId,
          name: placeholder?.displayName ?? "",
          isBooker: false,
          state: "placeholder",
          changedOn: null,
          masks: null,
        };
      }
      const member = members.find((m) => m.userId === r.userId);
      const state = r.state === "expired" ? "released" : r.state;
      return {
        recipientId: r.id,
        key: r.userId ?? r.id,
        name: member?.displayName ?? "",
        isBooker: member?.bookerSince != null,
        state,
        changedOn:
          r.release && r.release.updatedAt.getTime() - r.release.createdAt.getTime() > 1000
            ? shortDate(r.release.updatedAt, format.intl)
            : null,
        masks: r.state === "released" ? (maskOf.get(r.id) ?? null) : null,
      };
    });
    const order = { released: 0, open: 1, declined: 2, placeholder: 3 } as const;
    persons.sort(
      (a, b) => order[a.state] - order[b.state] || a.name.localeCompare(b.name, format.locale),
    );
    const askedUsers = new Set(recipients.map((r) => r.userId).filter(Boolean));
    const askedPlaceholders = new Set(recipients.map((r) => r.placeholderId).filter(Boolean));
    const addable = [
      ...members
        .filter((m) => m.userId !== me.userId && !askedUsers.has(m.userId))
        .map((m) => ({ key: m.userId, name: m.displayName, placeholder: false })),
      ...placeholders
        .filter((p) => !p.withoutApp && !askedPlaceholders.has(p.id))
        .map((p) => ({ key: p.id, name: p.displayName, placeholder: true })),
    ];
    return {
      requestId: request.id,
      purpose: request.purpose,
      fields: request.fields,
      askedOn: shortDate(request.createdAt, format.intl),
      released: counts.released,
      total: counts.total,
      allAnswered: counts.total > 0 && counts.open.length === 0,
      hasDocument: request.fields.includes("document"),
      persons: request.closedAt ? [] : persons,
      addable: request.closedAt ? [] : addable,
      newMembers: request.closedAt
        ? []
        : members
            .filter(
              (m) =>
                m.userId !== me.userId && !askedUsers.has(m.userId) && m.joinedAt > request.createdAt,
            )
            .map((m) => ({ key: m.userId, name: m.displayName })),
      closed: request.closedAt
        ? {
            on: shortDate(request.closedAt, format.intl),
            reason: request.closedReason === "done" ? "done" : "other",
          }
        : null,
    };
  });
  // Oldest open first, closed ones at the end (collapsed in the view).
  mine.sort((a, b) => Number(a.closed !== null) - Number(b.closed !== null));

  // --- Other «Bucht» people's requests (block 6) – organiser and «Bucht» only ----------------
  const others: CountCard[] =
    isOrganizer || isBooker
      ? raw.requests
          .filter((r) => r.requesterId !== me.userId && r.closedAt === null)
          .map((request) => {
            const counts = countsOf(raw, request.id);
            return {
              requestId: request.id,
              byName: memberName(view, request.requesterId) ?? t("formerMember"),
              purpose: request.purpose,
              released: counts.released,
              total: counts.total,
              persons: raw.recipients
                .filter((r) => r.requestId === request.id)
                .map((r) => ({
                  key: r.userId ?? r.placeholderId ?? r.id,
                  name: r.userId
                    ? (memberName(view, r.userId) ?? "")
                    : (placeholders.find((p) => p.id === r.placeholderId)?.displayName ?? ""),
                  state: r.placeholderId
                    ? ("placeholder" as const)
                    : r.state === "expired"
                      ? ("released" as const)
                      : r.state,
                })),
            };
          })
      : [];

  // --- One-off notices --------------------------------------------------------------------------
  const setter = me.bookerSetBy && me.bookerSetBy !== me.userId ? memberName(view, me.bookerSetBy) : null;
  const marked =
    isBooker && setter && (me.bookerHintSeenAt === null || me.bookerHintSeenAt < (me.bookerSince ?? new Date(0)))
      ? setter
      : null;
  const revoked =
    !isBooker &&
    me.bookerRevokedAt !== null &&
    (me.bookerHintSeenAt === null || me.bookerHintSeenAt < me.bookerRevokedAt);
  const datesChanged =
    trip.travelDatesChangedAt !== null &&
    (me.travelDatesHintSeenAt === null || me.travelDatesHintSeenAt < trip.travelDatesChangedAt);
  const openOwn = ownRequests.filter((r) => r.closedAt === null);
  const bookerNames = bookers.map((b) => b.displayName);
  return {
    publicId: trip.publicId,
    tripName: trip.name,
    demo: options.demo,
    deleteOn: formatDate(deleteOnIso, format.intl, { weekday: true, year: false }),
    deleted: gone,
    afterTrip,
    isBooker,
    isOrganizer,
    canRequest: isBooker && !afterTrip && !gone,
    limitReached: openOwn.length >= TRAVEL_LIMITS.openRequestsPerBooker,
    newHref: travelDataPath(trip.publicId, "new"),
    hints: {
      marked,
      revoked,
      datesMember: datesChanged && toMe.some((c) => c.state === "released"),
      datesBooker:
        datesChanged && isBooker && openOwn.length > 0 && trip.fixedStart && trip.fixedEnd
          ? formatDateRange(trip.fixedStart, trip.fixedEnd, format.intl, { today })
          : null,
    },
    toMe,
    mine,
    others,
    bookerNames: nameList(bookerNames, format.locale, (count) => t("more", { count })),
    bookerCount: bookerNames.length,
    remind: !gone && isBooker ? await travelRemindData(view, raw) : null,
  };
}

/** Document types offered in the form (W20 H.5). */
export const DOCUMENT_TYPE_OPTIONS = DOCUMENT_TYPES;
