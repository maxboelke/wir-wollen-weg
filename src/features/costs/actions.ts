"use server";

import { z } from "zod";
import {
  expenseDateWindow,
  validatePayInfo,
  type ExpenseErrors,
  type PayInfoErrors,
} from "@/lib/costs";
import type { LimitRule } from "@/lib/invite-limits";
import {
  changeCurrency,
  deleteExpense,
  loadCostsRaw,
  markSettlement,
  restoreExpense,
  saveExpense,
  savePayInfo,
  setCostsClosed,
  undoSettlement,
  type CostActor,
  type CostWriteError,
} from "@/server/costs/db";
import { takeLimit } from "@/server/rate-limit";
import { getSession } from "@/server/session";
import { findMembership, type Membership } from "@/server/trips";
import { loadTripView } from "../trips/load";
import { costsPath } from "../trips/paths";
import { costsModel, type CostExpenseView } from "./load";

/**
 * Server Actions of cost splitting (F-035/F-036, features.md R.8 «Rechte»). Every action
 * resolves the trip through the caller's OWN membership (no IDOR) and only works in phase
 * «fixed»; every id is checked against the trip id in the data layer. Rights per row of the
 * R.8 table are checked under the trip lock (src/server/costs/db.ts). Rate limits per ACCOUNT.
 * Nothing about titles, amounts or payment details is logged.
 */

export type CostError = CostWriteError | "signedOut" | "limited";

const MINUTE = 60_000;
const CREATE_LIMIT: LimitRule = { kind: "cost-create", limit: 60, windowMs: 10 * MINUTE };
const WRITE_LIMIT: LimitRule = { kind: "cost-write", limit: 120, windowMs: 10 * MINUTE };
const MARK_LIMIT: LimitRule = { kind: "cost-mark", limit: 60, windowMs: 10 * MINUTE };
const PAY_LIMIT: LimitRule = { kind: "cost-pay", limit: 20, windowMs: 60 * MINUTE };
const ORGA_LIMIT: LimitRule = { kind: "cost-orga", limit: 60, windowMs: 10 * MINUTE };

const idSchema = z.uuid();

async function fixedMembership(publicId: unknown): Promise<Membership | { error: CostError }> {
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

const actorOf = (found: Membership): CostActor => ({
  userId: found.member.userId,
  organizer: found.member.role === "organizer",
});

export type SaveExpenseState =
  | { ok: true; id: string; amountCents: number }
  | { ok: false; error: CostError }
  | { ok: false; error: "invalid"; errors: ExpenseErrors }
  | { ok: false; error: "conflict"; current: CostExpenseView | null }
  | { ok: false; error: "deleted" }
  | { ok: false; error: "closed"; orga: string };

const saveSchema = z.object({
  amount: z.string().max(40),
  title: z.string().max(400),
  note: z.string().max(2000).nullable(),
  category: z.string().max(40).nullable(),
  payer: z.string().max(80),
  participants: z.array(z.string().max(80)).max(100),
  mode: z.enum(["equal", "amounts"]),
  amounts: z.record(z.string().max(80), z.string().max(40)),
  date: z.string().max(20),
  locale: z.enum(["de", "en"]),
  idempotencyKey: z.string().min(8).max(64).optional(),
  edit: z.object({ id: z.uuid(), version: z.number().int().min(1) }).optional(),
});

async function closedBy(publicId: string): Promise<string> {
  const view = await loadTripView(publicId, costsPath(publicId));
  const raw = await loadCostsRaw(view.trip.id);
  return raw.closed?.byName ?? "";
}

/**
 * «Ausgabe speichern» (R.8 I10-02/I10-03): create (idempotent per form opening) or edit with the
 * version read by the client. A conflict returns the current state of the expense (D.5.7).
 */
export async function saveExpenseAction(
  publicId: string,
  input: unknown,
): Promise<SaveExpenseState> {
  const found = await fixedMembership(publicId);
  if ("error" in found) return { ok: false, error: found.error };
  const parsed = saveSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid", errors: {} };
  const data = parsed.data;
  if (!data.edit && !data.idempotencyKey) return { ok: false, error: "invalid", errors: {} };
  const rule = data.edit ? WRITE_LIMIT : CREATE_LIMIT;
  if (await limited(rule, found.member.userId)) return { ok: false, error: "limited" };
  const trip = found.trip;
  const result = await saveExpense(trip.id, actorOf(found), {
    form: data,
    locale: data.locale,
    window: expenseDateWindow(trip.fixedStart ?? "", trip.fixedEnd ?? trip.fixedStart ?? ""),
    ...(data.idempotencyKey ? { idempotencyKey: data.idempotencyKey } : {}),
    ...(data.edit ? { edit: data.edit } : {}),
  });
  if (result.ok) return { ok: true, id: result.id, amountCents: result.amountCents };
  if (result.error === "conflict") {
    const view = await loadTripView(publicId, costsPath(publicId));
    const model = costsModel(view, await loadCostsRaw(trip.id));
    return {
      ok: false,
      error: "conflict",
      current: model.expenses.find((e) => e.id === data.edit?.id) ?? null,
    };
  }
  if (result.error === "closed")
    return { ok: false, error: "closed", orga: await closedBy(publicId) };
  if (result.error === "invalid" && "errors" in result) {
    return { ok: false, error: "invalid", errors: result.errors };
  }
  if (result.error === "deleted") return { ok: false, error: "deleted" };
  return { ok: false, error: result.error };
}

export type CostResult = { ok: true } | { ok: false; error: CostError | "conflict" };

/** Delete (soft, «Rückgängig» possible) – creator, payer or organiser; version must match. */
export async function deleteExpenseAction(
  publicId: string,
  expenseId: unknown,
  version: unknown,
): Promise<CostResult> {
  const found = await fixedMembership(publicId);
  if ("error" in found) return { ok: false, error: found.error };
  const id = idSchema.safeParse(expenseId);
  const v = z.number().int().min(1).safeParse(version);
  if (!id.success || !v.success) return { ok: false, error: "invalid" };
  if (await limited(WRITE_LIMIT, found.member.userId)) return { ok: false, error: "limited" };
  const result = await deleteExpense(found.trip.id, actorOf(found), id.data, v.data);
  return result.ok ? { ok: true } : { ok: false, error: result.error };
}

/** «Rückgängig» after deleting. */
export async function restoreExpenseAction(
  publicId: string,
  expenseId: unknown,
): Promise<CostResult> {
  const found = await fixedMembership(publicId);
  if ("error" in found) return { ok: false, error: found.error };
  const id = idSchema.safeParse(expenseId);
  if (!id.success) return { ok: false, error: "invalid" };
  if (await limited(WRITE_LIMIT, found.member.userId)) return { ok: false, error: "limited" };
  const result = await restoreExpense(found.trip.id, actorOf(found), id.data);
  return result.ok ? { ok: true } : { ok: false, error: result.error };
}

export type MarkState = { ok: true; id: string } | { ok: false; error: CostError };

/** «Als bezahlt/erhalten markieren» – amount of the proposal row (R.8 I10-06). */
export async function markSettlementAction(
  publicId: string,
  from: unknown,
  to: unknown,
  cents: unknown,
): Promise<MarkState> {
  const found = await fixedMembership(publicId);
  if ("error" in found) return { ok: false, error: found.error };
  const a = idSchema.safeParse(from);
  const b = idSchema.safeParse(to);
  const amount = z.number().int().min(1).max(2_000_000_000).safeParse(cents);
  if (!a.success || !b.success || !amount.success) return { ok: false, error: "invalid" };
  if (await limited(MARK_LIMIT, found.member.userId)) return { ok: false, error: "limited" };
  return markSettlement(found.trip.id, actorOf(found), a.data, b.data, amount.data);
}

/** «Zurücknehmen» / «Rückgängig» of a settlement. */
export async function undoSettlementAction(
  publicId: string,
  settlementId: unknown,
): Promise<CostResult> {
  const found = await fixedMembership(publicId);
  if ("error" in found) return { ok: false, error: found.error };
  const id = idSchema.safeParse(settlementId);
  if (!id.success) return { ok: false, error: "invalid" };
  if (await limited(MARK_LIMIT, found.member.userId)) return { ok: false, error: "limited" };
  const result = await undoSettlement(found.trip.id, actorOf(found), id.data);
  return result.ok ? { ok: true } : { ok: false, error: result.error };
}

export type PayInfoState = { ok: true } | { ok: false; error: CostError; errors?: PayInfoErrors };

/**
 * Own payment details (I10-07) – only the caller's own membership row, also when the costs are
 * closed. IBAN only after validation; both empty = delete.
 */
export async function savePayInfoAction(publicId: string, input: unknown): Promise<PayInfoState> {
  const session = await getSession();
  if (!session) return { ok: false, error: "signedOut" };
  const found = await findMembership(publicId, session.user.id);
  if (!found) return { ok: false, error: "notAllowed" };
  const values =
    typeof input === "object" && input !== null
      ? (input as { iban?: unknown; note?: unknown })
      : {};
  const checked = validatePayInfo({ iban: values.iban ?? "", note: values.note ?? "" });
  if (!checked.ok) return { ok: false, error: "invalid", errors: checked.errors };
  if (await limited(PAY_LIMIT, session.user.id)) return { ok: false, error: "limited" };
  const saved = await savePayInfo(found.trip.id, session.user.id, {
    iban: checked.iban,
    note: checked.note,
  });
  return saved ? { ok: true } : { ok: false, error: "notAllowed" };
}

async function organizer(publicId: unknown): Promise<Membership | { error: CostError }> {
  const found = await fixedMembership(publicId);
  if ("error" in found) return found;
  if (found.member.role !== "organizer") return { error: "notAllowed" };
  if (await limited(ORGA_LIMIT, found.member.userId)) return { error: "limited" };
  return found;
}

/** Currency of the trip (organiser, only without expenses and settlements – I10-08). */
export async function changeCurrencyAction(
  publicId: string,
  currency: unknown,
): Promise<CostResult> {
  const found = await organizer(publicId);
  if ("error" in found) return { ok: false, error: found.error };
  if (typeof currency !== "string") return { ok: false, error: "invalid" };
  const result = await changeCurrency(found.trip.id, currency);
  return result.ok ? { ok: true } : { ok: false, error: result.error };
}

/** «Abrechnung abschließen» (true) / «wieder öffnen» (false) – organiser only. */
export async function closeCostsAction(publicId: string, close: unknown): Promise<CostResult> {
  const found = await organizer(publicId);
  if ("error" in found) return { ok: false, error: found.error };
  if (typeof close !== "boolean") return { ok: false, error: "invalid" };
  const result = await setCostsClosed(found.trip.id, close ? found.member.userId : null);
  return result.ok ? { ok: true } : { ok: false, error: result.error };
}
