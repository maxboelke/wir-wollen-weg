"use server";

import { z } from "zod";
import type { LimitRule } from "@/lib/invite-limits";
import {
  checkStayUrl,
  normalizeStayUrl,
  STAY_LIMITS,
  validateStayForm,
  type StayFormErrors,
} from "@/lib/stays";
import { runAfterResponse } from "@/server/background";
import { takeLimit } from "@/server/rate-limit";
import { getSession } from "@/server/session";
import {
  chooseStay,
  createStay,
  deleteStay,
  dismissDateNotice,
  rateStay,
  setBooked,
  setPartySize,
  setStayPreview,
  setStayWithoutApp,
  unchooseStay,
  updateStay,
} from "@/server/stays/db";
import { fetchLinkPreview, previewKey } from "@/server/stays/preview";
import { verifyPreviewToken } from "@/server/stays/preview-token";
import { findMembership, type Membership } from "@/server/trips";
import { loadTripView } from "../trips/load";
import { loadStaysRaw, staysModel, type StayItem } from "./load";

/**
 * Server Actions of the places to stay (F-031, features.md R.7 «Rechte»). Every action resolves
 * the trip through the caller's OWN membership (no IDOR; a suggestion id of another trip is
 * never found because every statement is bound to the trip id) and only works in phase «fixed».
 * Organiser-only actions check the role here; rate limits per ACCOUNT (R.7 table).
 */

export type StayError =
  "signedOut" | "notAllowed" | "phase" | "invalid" | "limited" | "chosen" | "limit" | "gone";

export type StayResult = { ok: true } | { ok: false; error: StayError };

const MINUTE = 60_000;
const CREATE_LIMIT: LimitRule = { kind: "stay-create", limit: 10, windowMs: 10 * MINUTE };
const RATE_LIMIT: LimitRule = { kind: "stay-rate", limit: 300, windowMs: 10 * MINUTE };
/** Like other organiser writes – generous, only against runaway clients. */
const WRITE_LIMIT: LimitRule = { kind: "stay-write", limit: 60, windowMs: 10 * MINUTE };

const idSchema = z.uuid();

async function fixedMembership(publicId: unknown): Promise<Membership | { error: StayError }> {
  const session = await getSession();
  if (!session) return { error: "signedOut" };
  if (typeof publicId !== "string") return { error: "notAllowed" };
  const found = await findMembership(publicId, session.user.id);
  if (!found) return { error: "notAllowed" };
  if (found.trip.phase !== "fixed" || !found.trip.fixedStart) return { error: "phase" };
  return found;
}

async function limited(rule: LimitRule, userId: string): Promise<boolean> {
  return (await takeLimit(rule, `${rule.kind}:${userId}`)).limited;
}

async function organizer(publicId: unknown): Promise<Membership | { error: StayError }> {
  const found = await fixedMembership(publicId);
  if ("error" in found) return found;
  if (found.member.role !== "organizer") return { error: "notAllowed" };
  if (await limited(WRITE_LIMIT, found.member.userId)) return { error: "limited" };
  return found;
}

export interface CreateStayInput {
  url: unknown;
  title: unknown;
  price: unknown;
  note: unknown;
  /** Signed preview token (R.7 I9-03) – image URL and site name come ONLY from it. */
  token: unknown;
  locale: unknown;
}

export type CreateStayState =
  | { ok: true }
  | {
      ok: false;
      error: StayError;
      errors?: StayFormErrors;
      link?: "missing" | "invalid" | "unusable";
    }
  | { ok: false; error: "duplicate"; duplicate: { name: string | null; own: boolean } };

async function createFor(
  input: CreateStayInput & { publicId?: unknown },
): Promise<CreateStayState> {
  const found = await fixedMembership(input.publicId);
  if ("error" in found) return { ok: false, error: found.error };
  const locale = input.locale === "de" ? "de" : "en";
  const link = checkStayUrl(input.url);
  const form = validateStayForm(
    { title: input.title, price: input.price, note: input.note },
    locale,
  );
  if (!link.ok || !form.ok) {
    return {
      ok: false,
      error: "invalid",
      ...(form.ok ? {} : { errors: form.errors }),
      ...(link.ok ? {} : { link: link.error }),
    };
  }
  if (await limited(CREATE_LIMIT, found.member.userId)) return { ok: false, error: "limited" };
  const normalized = normalizeStayUrl(link.url);
  const claims = verifyPreviewToken(previewKey(), input.token);
  const preview =
    claims && claims.trip === found.trip.id && claims.url === normalized ? claims : null;
  const result = await createStay(found.trip.id, found.member.userId, {
    url: link.url,
    urlNormalized: normalized,
    title: form.values.title,
    priceCents: form.values.priceCents,
    note: form.values.note,
    previewImageUrl: preview?.image ?? null,
    previewSiteName: preview?.site ?? null,
    previewStatus: preview ? "ok" : "pending",
  });
  if (!result.ok) {
    if (result.reason === "duplicate") {
      return {
        ok: false,
        error: "duplicate",
        duplicate: {
          name: result.duplicate.authorName,
          own: result.duplicate.authorId === found.member.userId,
        },
      };
    }
    return { ok: false, error: result.reason };
  }
  if (!preview) {
    const tripId = found.trip.id;
    runAfterResponse(
      fetchLinkPreview(link.url, found.trip.locale).then((meta) =>
        setStayPreview(tripId, result.id, {
          imageUrl: meta?.imageUrl ?? null,
          siteName: meta?.siteName ?? null,
          ok: meta !== null,
        }),
      ),
    );
  }
  return { ok: true };
}

/**
 * «Vorschlag hinzufügen» (R.7 I9-02). Without a valid preview token the preview is fetched in
 * the background after saving (`after()`, like R-067) and fills in image/site name; on failure
 * the placeholder card stays. The token must belong to THIS trip and THIS (normalised) link.
 */
export async function createStayAction(publicId: string, input: unknown): Promise<CreateStayState> {
  if (typeof input !== "object" || input === null) return { ok: false, error: "invalid" };
  return createFor({ ...(input as CreateStayInput), publicId });
}

export type UpdateStayState =
  { ok: true } | { ok: false; error: StayError; errors?: StayFormErrors };

/** «Vorschlag bearbeiten» (W17 F.4): author or organiser; not the picked place once booked. */
export async function updateStayAction(
  publicId: string,
  stayId: unknown,
  input: unknown,
): Promise<UpdateStayState> {
  const found = await fixedMembership(publicId);
  if ("error" in found) return { ok: false, error: found.error };
  const id = idSchema.safeParse(stayId);
  if (!id.success || typeof input !== "object" || input === null) {
    return { ok: false, error: "invalid" };
  }
  const values = input as { title?: unknown; price?: unknown; note?: unknown; locale?: unknown };
  const form = validateStayForm(
    { title: values.title, price: values.price, note: values.note },
    values.locale === "de" ? "de" : "en",
  );
  if (!form.ok) return { ok: false, error: "invalid", errors: form.errors };
  if (await limited(WRITE_LIMIT, found.member.userId)) return { ok: false, error: "limited" };
  const saved = await updateStay(
    found.trip.id,
    id.data,
    { userId: found.member.userId, organizer: found.member.role === "organizer" },
    form.values,
  );
  return saved ? { ok: true } : { ok: false, error: "notAllowed" };
}

/** Delete (W18 E.4): author or organiser, never the picked place. */
export async function deleteStayAction(publicId: string, stayId: unknown): Promise<StayResult> {
  const found = await fixedMembership(publicId);
  if ("error" in found) return { ok: false, error: found.error };
  const id = idSchema.safeParse(stayId);
  if (!id.success) return { ok: false, error: "invalid" };
  if (await limited(WRITE_LIMIT, found.member.userId)) return { ok: false, error: "limited" };
  const deleted = await deleteStay(found.trip.id, id.data, {
    userId: found.member.userId,
    organizer: found.member.role === "organizer",
  });
  return deleted ? { ok: true } : { ok: false, error: "notAllowed" };
}

export type RateState =
  | {
      ok: true;
      /** The viewer's open suggestions after this rating (stack order). */
      open: StayItem[];
      /** Ranking was free and is locked again by this change (W18 E.3 snackbar). */
      locked: boolean;
    }
  | { ok: false; error: StayError };

const ratingSchema = z.enum(["like", "nope"]).nullable();

/**
 * ♥ / ✕ or take back (null) – R.7 I9-05. Placeholders cannot rate (they have no account). The
 * answer carries only the viewer's OWN open suggestions (no data of other people's ratings).
 */
export async function rateStayAction(
  publicId: string,
  stayId: unknown,
  value: unknown,
): Promise<RateState> {
  const found = await fixedMembership(publicId);
  if ("error" in found) return { ok: false, error: found.error };
  const id = idSchema.safeParse(stayId);
  const rating = ratingSchema.safeParse(value);
  if (!id.success || !rating.success) return { ok: false, error: "invalid" };
  if (await limited(RATE_LIMIT, found.member.userId)) return { ok: false, error: "limited" };
  const result = await rateStay(found.trip.id, id.data, found.member.userId, rating.data);
  if (!result.ok) return { ok: false, error: result.reason };
  const view = await loadTripView(publicId, `/trips/${publicId}/stays`);
  const model = staysModel(view, await loadStaysRaw(found.trip.id));
  return {
    ok: true,
    open: model.stack,
    locked: rating.data === null && !model.rankingFree && found.member.role !== "organizer",
  };
}

/** «Das wird's» (organiser, R.7 I9-07). */
export async function chooseStayAction(publicId: string, stayId: unknown): Promise<StayResult> {
  const found = await organizer(publicId);
  if ("error" in found) return { ok: false, error: found.error };
  const id = idSchema.safeParse(stayId);
  if (!id.success) return { ok: false, error: "invalid" };
  const result = await chooseStay(found.trip.id, id.data, found.member.userId);
  return result.ok ? { ok: true } : { ok: false, error: result.reason };
}

/** «Festlegung aufheben» (organiser) – picked and booked are reset, ratings stay. */
export async function unchooseStayAction(publicId: string): Promise<StayResult> {
  const found = await organizer(publicId);
  if ("error" in found) return { ok: false, error: found.error };
  return (await unchooseStay(found.trip.id)) ? { ok: true } : { ok: false, error: "gone" };
}

/** «Als gebucht markieren» / «Doch nicht gebucht» (organiser in Increment 9). */
export async function setBookedAction(publicId: string, booked: unknown): Promise<StayResult> {
  const found = await organizer(publicId);
  if ("error" in found) return { ok: false, error: found.error };
  if (typeof booked !== "boolean") return { ok: false, error: "invalid" };
  const done = await setBooked(found.trip.id, booked ? found.member.userId : null);
  return done ? { ok: true } : { ok: false, error: "gone" };
}

/** UX-9 for V3 (organiser): «Haben wir schon / brauchen wir nicht» on/off. */
export async function stayWithoutAppAction(publicId: string, on: unknown): Promise<StayResult> {
  const found = await organizer(publicId);
  if ("error" in found) return { ok: false, error: found.error };
  if (typeof on !== "boolean") return { ok: false, error: "invalid" };
  const done = await setStayWithoutApp(found.trip.id, on ? found.member.userId : null);
  return done ? { ok: true } : { ok: false, error: "chosen" };
}

/** «Für wie viele rechnet ihr?» (organiser, Should): 1–50 or null = automatic. */
export async function partySizeAction(publicId: string, size: unknown): Promise<StayResult> {
  const found = await organizer(publicId);
  if ("error" in found) return { ok: false, error: found.error };
  const parsed = z
    .number()
    .int()
    .min(STAY_LIMITS.partyMin)
    .max(STAY_LIMITS.partyMax)
    .nullable()
    .safeParse(size);
  if (!parsed.success) return { ok: false, error: "invalid" };
  await setPartySize(found.trip.id, parsed.data);
  return { ok: true };
}

/** Organiser closes «Euer Termin hat sich geändert» for everyone. */
export async function dismissDatesNoticeAction(publicId: string): Promise<StayResult> {
  const found = await organizer(publicId);
  if ("error" in found) return { ok: false, error: found.error };
  await dismissDateNotice(found.trip.id);
  return { ok: true };
}
