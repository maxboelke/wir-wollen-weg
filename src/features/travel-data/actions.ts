"use server";

import { z } from "zod";
import { isDemo } from "@/server/env";
import { travelDataOn } from "@/lib/app-env";
import type { LimitRule } from "@/lib/invite-limits";
import {
  cleanPurpose,
  isCopyField,
  normalizeRequestFields,
  overlappingValues,
  type CopyField,
  type TravelInput,
  type ValueErrors,
} from "@/lib/travel-data";
import { markTravelReauthenticated } from "@/server/account";
import { takeLimit } from "@/server/rate-limit";
import { getSession, type Session } from "@/server/session";
import {
  addRecipients,
  bookerAccess,
  closeOwnRequest,
  createRequest,
  dismissExpired,
  markTravelHintSeen,
  readOwnRelease,
  releaseAnswer,
  removeRecipient,
  setBooker,
  setDeclined,
  withdrawRelease,
  type BookerResult,
  type TravelError,
} from "@/server/travel-data/db";
import { findMembership, type Membership } from "@/server/trips";
import { sendReauthCode, verifyReauthCode, type AccountResult } from "../account/actions";
import { displayValue } from "./format";
import { valueLabels } from "./load";
import { getLocale } from "next-intl/server";

/**
 * Server Actions of the personal travel details (F-054/F-056, features.md R.9). Each action
 * resolves the trip through the caller's OWN membership (no IDOR – foreign request ids are never
 * found, every statement is bound to the trip id), refuses when the area is switched off
 * (TRAVEL_DATA_ENABLED, R.9 I11-12) and takes a rate limit per ACCOUNT. The rights of R.9 are
 * checked again inside the database functions, in the same transaction as the write or the
 * decryption. Arguments and values are never logged; errors are generic.
 */

const MINUTE = 60_000;
const CREATE_LIMIT: LimitRule = { kind: "td-request", limit: 10, windowMs: 60 * MINUTE };
const MANAGE_LIMIT: LimitRule = { kind: "td-manage", limit: 30, windowMs: 10 * MINUTE };
const ANSWER_LIMIT: LimitRule = { kind: "td-answer", limit: 30, windowMs: 10 * MINUTE };
const ACCESS_LIMIT: LimitRule = { kind: "td-access", limit: 120, windowMs: 10 * MINUTE };
/** Marking «Bucht» – like the other organiser writes. */
const BOOKER_LIMIT: LimitRule = { kind: "td-booker", limit: 60, windowMs: 10 * MINUTE };

export type TravelActionError = TravelError | "signedOut" | "limited";
export type TravelResult<T = object> = ({ ok: true } & T) | { ok: false; error: TravelActionError };

const idSchema = z.uuid();

interface Ctx {
  session: Session;
  found: Membership;
}

async function context(publicId: unknown, needsArea = true): Promise<Ctx | { error: TravelActionError }> {
  const session = await getSession();
  if (!session) return { error: "signedOut" };
  if (typeof publicId !== "string") return { error: "notAllowed" };
  if (needsArea && !travelDataOn()) return { error: "notAllowed" };
  const found = await findMembership(publicId, session.user.id);
  if (!found) return { error: "notAllowed" };
  return { session, found };
}

async function limited(rule: LimitRule, userId: string): Promise<boolean> {
  return (await takeLimit(rule, `${rule.kind}:${userId}`)).limited;
}

/* ------------------------------------------------------------------------------------------ */
/* Marking «Bucht» (works also with the area switched off – R.9 I11-12)                         */
/* ------------------------------------------------------------------------------------------ */

export async function setBookerAction(
  publicId: string,
  targetUserId: unknown,
  on: unknown,
  confirmed: unknown,
): Promise<BookerResult | { ok: false; error: "signedOut" | "limited" | "notAllowed" | "invalid" }> {
  const ctx = await context(publicId, false);
  if ("error" in ctx) return { ok: false, error: ctx.error === "signedOut" ? "signedOut" : "notAllowed" };
  const target = idSchema.safeParse(targetUserId);
  if (!target.success || typeof on !== "boolean") return { ok: false, error: "invalid" };
  if (ctx.found.member.role !== "organizer") return { ok: false, error: "notAllowed" };
  if (await limited(BOOKER_LIMIT, ctx.found.member.userId)) return { ok: false, error: "limited" };
  return setBooker(ctx.found.trip.id, ctx.found.member.userId, target.data, on, confirmed === true);
}

/* ------------------------------------------------------------------------------------------ */
/* Requests                                                                                    */
/* ------------------------------------------------------------------------------------------ */

const recipientsSchema = z.object({
  users: z.array(z.uuid()).max(60),
  placeholders: z.array(z.uuid()).max(60),
});

export interface CreateRequestInput {
  purpose: unknown;
  fields: unknown;
  recipients: unknown;
  idempotencyKey: unknown;
}

export async function createRequestAction(
  publicId: string,
  input: CreateRequestInput,
): Promise<TravelResult<{ count: number; requestId: string }> | { ok: false; error: "purpose" }> {
  const ctx = await context(publicId);
  if ("error" in ctx) return { ok: false, error: ctx.error };
  const purpose = cleanPurpose(input.purpose);
  if (!purpose) return { ok: false, error: "purpose" };
  const fields = normalizeRequestFields(input.fields);
  const recipients = recipientsSchema.safeParse(input.recipients);
  const key =
    typeof input.idempotencyKey === "string" && /^[A-Za-z0-9-]{8,64}$/.test(input.idempotencyKey)
      ? input.idempotencyKey
      : null;
  if (!fields || !recipients.success) return { ok: false, error: "invalid" };
  if (await limited(CREATE_LIMIT, ctx.found.member.userId)) return { ok: false, error: "limited" };
  const result = await createRequest(ctx.found.trip.id, ctx.found.member.userId, {
    purpose,
    fields,
    recipients: recipients.data,
    idempotencyKey: key,
  });
  return result.ok ? { ok: true, count: result.count, requestId: result.id } : result;
}

export async function addRecipientsAction(
  publicId: string,
  requestId: unknown,
  recipients: unknown,
): Promise<TravelResult<{ count: number }>> {
  const ctx = await context(publicId);
  if ("error" in ctx) return { ok: false, error: ctx.error };
  const id = idSchema.safeParse(requestId);
  const parsed = recipientsSchema.safeParse(recipients);
  if (!id.success || !parsed.success) return { ok: false, error: "invalid" };
  if (await limited(MANAGE_LIMIT, ctx.found.member.userId)) return { ok: false, error: "limited" };
  return addRecipients(ctx.found.trip.id, ctx.found.member.userId, id.data, parsed.data);
}

export async function removeRecipientAction(
  publicId: string,
  requestId: unknown,
  recipientId: unknown,
): Promise<TravelResult> {
  const ctx = await context(publicId);
  if ("error" in ctx) return { ok: false, error: ctx.error };
  const id = idSchema.safeParse(requestId);
  const recipient = idSchema.safeParse(recipientId);
  if (!id.success || !recipient.success) return { ok: false, error: "invalid" };
  if (await limited(MANAGE_LIMIT, ctx.found.member.userId)) return { ok: false, error: "limited" };
  return removeRecipient(ctx.found.trip.id, ctx.found.member.userId, id.data, recipient.data);
}

/** «Erledigt – Daten löschen». */
export async function closeRequestAction(
  publicId: string,
  requestId: unknown,
): Promise<TravelResult<{ deleted: number }>> {
  const ctx = await context(publicId);
  if ("error" in ctx) return { ok: false, error: ctx.error };
  const id = idSchema.safeParse(requestId);
  if (!id.success) return { ok: false, error: "invalid" };
  if (await limited(MANAGE_LIMIT, ctx.found.member.userId)) return { ok: false, error: "limited" };
  return closeOwnRequest(ctx.found.trip.id, ctx.found.member.userId, id.data);
}

/* ------------------------------------------------------------------------------------------ */
/* Answers                                                                                     */
/* ------------------------------------------------------------------------------------------ */

const inputSchema = z
  .object({
    givenNames: z.string().max(200),
    familyNames: z.string().max(200),
    birthDay: z.string().max(4),
    birthMonth: z.string().max(4),
    birthYear: z.string().max(6),
    sex: z.string().max(2),
    nationality: z.string().max(3),
    documentType: z.string().max(10),
    documentNumber: z.string().max(40),
    expiryDay: z.string().max(4),
    expiryMonth: z.string().max(4),
    expiryYear: z.string().max(6),
    issuingCountry: z.string().max(3),
  })
  .partial()
  .strict();

export type ReleaseActionResult =
  | { ok: true }
  | { ok: false; error: TravelActionError }
  | { ok: false; error: "values"; errors: ValueErrors };

/**
 * «An … freigeben» / «Änderungen freigeben» (R.9 I11-06). `consent` must be literally `true` –
 * the server never stores without the ticked box.
 */
export async function releaseAction(
  publicId: string,
  requestId: unknown,
  input: unknown,
  consent: unknown,
): Promise<ReleaseActionResult> {
  const ctx = await context(publicId);
  if ("error" in ctx) return { ok: false, error: ctx.error };
  const id = idSchema.safeParse(requestId);
  const values = inputSchema.safeParse(input);
  if (!id.success || !values.success) return { ok: false, error: "invalid" };
  if (await limited(ANSWER_LIMIT, ctx.found.member.userId)) return { ok: false, error: "limited" };
  const locale = (await getLocale()) === "de" ? "de" : "en";
  return releaseAnswer(
    ctx.found.trip.id,
    ctx.found.member.userId,
    id.data,
    values.data as TravelInput,
    { given: consent === true, locale },
    { demo: isDemo() },
  );
}

/** «Ich kläre das direkt mit …» (true) and its «Rückgängig» / «Doch freigeben» (false). */
export async function declineAction(
  publicId: string,
  requestId: unknown,
  declined: unknown,
): Promise<TravelResult> {
  const ctx = await context(publicId);
  if ("error" in ctx) return { ok: false, error: ctx.error };
  const id = idSchema.safeParse(requestId);
  if (!id.success || typeof declined !== "boolean") return { ok: false, error: "invalid" };
  if (await limited(ANSWER_LIMIT, ctx.found.member.userId)) return { ok: false, error: "limited" };
  return setDeclined(ctx.found.trip.id, ctx.found.member.userId, id.data, declined);
}

/**
 * «Freigabe zurückziehen» – also while the dates are reopened (account page, CEO 2026-10-23)
 * and also with the area switched off: withdrawing must always be possible (Art. 7 Abs. 3).
 */
export async function withdrawAction(publicId: string, requestId: unknown): Promise<TravelResult> {
  const ctx = await context(publicId, false);
  if ("error" in ctx) return { ok: false, error: ctx.error };
  const id = idSchema.safeParse(requestId);
  if (!id.success) return { ok: false, error: "invalid" };
  if (await limited(ANSWER_LIMIT, ctx.found.member.userId)) return { ok: false, error: "limited" };
  return withdrawRelease(ctx.found.trip.id, ctx.found.member.userId, id.data);
}

export async function dismissExpiredAction(publicId: string, requestId: unknown): Promise<TravelResult> {
  const ctx = await context(publicId);
  if ("error" in ctx) return { ok: false, error: ctx.error };
  const id = idSchema.safeParse(requestId);
  if (!id.success) return { ok: false, error: "invalid" };
  await dismissExpired(ctx.found.trip.id, ctx.found.member.userId, id.data);
  return { ok: true };
}

export async function hintSeenAction(publicId: string, hint: unknown): Promise<TravelResult> {
  const ctx = await context(publicId);
  if ("error" in ctx) return { ok: false, error: ctx.error };
  if (hint !== "booker" && hint !== "dates") return { ok: false, error: "invalid" };
  await markTravelHintSeen(ctx.found.trip.id, ctx.found.member.userId, hint);
  return { ok: true };
}

/** Own document number (masked on the card – «Anzeigen» for the person themself). */
export async function ownDocumentAction(
  publicId: string,
  requestId: unknown,
): Promise<TravelResult<{ value: string }>> {
  const ctx = await context(publicId);
  if ("error" in ctx) return { ok: false, error: ctx.error };
  const id = idSchema.safeParse(requestId);
  if (!id.success) return { ok: false, error: "invalid" };
  if (await limited(ACCESS_LIMIT, ctx.found.member.userId)) return { ok: false, error: "limited" };
  const values = await readOwnRelease(ctx.found.trip.id, ctx.found.member.userId, id.data);
  return values?.documentNumber ? { ok: true, value: values.documentNumber } : { ok: false, error: "gone" };
}

/**
 * «Angaben aus deiner Freigabe an {Name} übernehmen» (Should, R.9 I11-05) – only from another
 * own release in THIS trip, only the fields of the target request; nothing is stored.
 */
export async function reuseAction(
  publicId: string,
  fromRequestId: unknown,
  toFields: unknown,
): Promise<TravelResult<{ input: TravelInput }>> {
  const ctx = await context(publicId);
  if ("error" in ctx) return { ok: false, error: ctx.error };
  const id = idSchema.safeParse(fromRequestId);
  const fields = normalizeRequestFields(toFields);
  if (!id.success || !fields) return { ok: false, error: "invalid" };
  if (await limited(ACCESS_LIMIT, ctx.found.member.userId)) return { ok: false, error: "limited" };
  const values = await readOwnRelease(ctx.found.trip.id, ctx.found.member.userId, id.data);
  if (!values) return { ok: false, error: "gone" };
  return { ok: true, input: toInput(overlappingValues(values, fields)) };
}

/** Values → form input (dates as three parts). */
function toInput(values: ReturnType<typeof overlappingValues>): TravelInput {
  const parts = (iso: string | undefined) => {
    if (!iso) return {};
    const [y, m, d] = iso.split("-");
    return { d: d ?? "", m: m ?? "", y: y ?? "" };
  };
  const birth = parts(values.birthDate);
  const expiry = parts(values.documentExpiry);
  return {
    ...(values.givenNames ? { givenNames: values.givenNames } : {}),
    ...(values.familyNames ? { familyNames: values.familyNames } : {}),
    ...("d" in birth ? { birthDay: birth.d, birthMonth: birth.m, birthYear: birth.y } : {}),
    ...(values.sex ? { sex: values.sex } : {}),
    ...(values.nationality ? { nationality: values.nationality } : {}),
    ...(values.documentType ? { documentType: values.documentType } : {}),
    ...(values.documentNumber ? { documentNumber: values.documentNumber } : {}),
    ...("d" in expiry ? { expiryDay: expiry.d, expiryMonth: expiry.m, expiryYear: expiry.y } : {}),
    ...(values.issuingCountry ? { issuingCountry: values.issuingCountry } : {}),
  };
}

/* ------------------------------------------------------------------------------------------ */
/* «Bucht»: Anzeigen / Kopieren (logged) + re-authentication                                   */
/* ------------------------------------------------------------------------------------------ */

async function formatOptions() {
  const locale = await getLocale();
  const { viewerFormat } = await import("@/server/viewer");
  const session = await getSession();
  const format = await viewerFormat(session);
  return { intl: format.intl, locale, labels: await valueLabels() };
}

export type RevealResult =
  | { ok: true; values: Partial<Record<CopyField, string>> }
  | { ok: false; error: TravelActionError };

/** «Anzeigen» – one person's values, one access-log row «angesehen» (R.9 I11-08). */
export async function revealAction(
  publicId: string,
  requestId: unknown,
  recipientId: unknown,
): Promise<RevealResult> {
  const ctx = await context(publicId);
  if ("error" in ctx) return { ok: false, error: ctx.error };
  const id = idSchema.safeParse(requestId);
  const recipient = idSchema.safeParse(recipientId);
  if (!id.success || !recipient.success) return { ok: false, error: "invalid" };
  if (await limited(ACCESS_LIMIT, ctx.found.member.userId)) return { ok: false, error: "limited" };
  const result = await bookerAccess(ctx.found.trip.id, ctx.found.member.userId, ctx.session.session.id, {
    mode: "view",
    requestId: id.data,
    recipientId: recipient.data,
  });
  if (!result.ok) return result;
  if (result.mode !== "view") return { ok: false, error: "invalid" };
  const format = await formatOptions();
  const values: Partial<Record<CopyField, string>> = {};
  const raw = fromCopyFields(result.values);
  for (const field of Object.keys(result.values) as CopyField[]) {
    const shown = displayValue(field, raw, format);
    if (shown !== undefined) values[field] = shown;
  }
  return { ok: true, values };
}

/** «Kopieren» – one value, one access-log row «{Feld} kopiert». */
export async function copyAction(
  publicId: string,
  requestId: unknown,
  recipientId: unknown,
  field: unknown,
): Promise<TravelResult<{ value: string }>> {
  const ctx = await context(publicId);
  if ("error" in ctx) return { ok: false, error: ctx.error };
  const id = idSchema.safeParse(requestId);
  const recipient = idSchema.safeParse(recipientId);
  if (!id.success || !recipient.success || !isCopyField(field)) return { ok: false, error: "invalid" };
  if (await limited(ACCESS_LIMIT, ctx.found.member.userId)) return { ok: false, error: "limited" };
  const result = await bookerAccess(ctx.found.trip.id, ctx.found.member.userId, ctx.session.session.id, {
    mode: "copy",
    requestId: id.data,
    recipientId: recipient.data,
    field,
  });
  if (!result.ok) return result;
  if (result.mode !== "copy") return { ok: false, error: "invalid" };
  const shown = displayValue(field, fromCopyFields({ [field]: result.value }), await formatOptions());
  return { ok: true, value: shown ?? result.value };
}

function fromCopyFields(values: Partial<Record<CopyField, string>>) {
  return {
    ...(values.given_name ? { givenNames: values.given_name } : {}),
    ...(values.family_name ? { familyNames: values.family_name } : {}),
    ...(values.birth_date ? { birthDate: values.birth_date } : {}),
    ...(values.sex ? { sex: values.sex as "F" | "M" | "X" } : {}),
    ...(values.nationality ? { nationality: values.nationality } : {}),
    ...(values.document_type ? { documentType: values.document_type as "passport" | "id_card" } : {}),
    ...(values.document_number ? { documentNumber: values.document_number } : {}),
    ...(values.document_expiry ? { documentExpiry: values.document_expiry } : {}),
    ...(values.issuing_country ? { issuingCountry: values.issuing_country } : {}),
  };
}

/** Code for the re-authentication (W20 H.7) – the existing code mail. */
export async function sendTravelCodeAction(): Promise<AccountResult> {
  return sendReauthCode();
}

/** Confirms the code: document numbers may be shown in this session for 12 hours. */
export async function confirmTravelCodeAction(code: string): Promise<AccountResult> {
  const session = await getSession();
  if (!session) return { error: "generic" };
  const result = await verifyReauthCode(code);
  if (result.ok) await markTravelReauthenticated(session.session.id);
  return result;
}
