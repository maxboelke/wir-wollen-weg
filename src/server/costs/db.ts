import "server-only";
import { and, asc, count, desc, eq, inArray, isNotNull, isNull, lt, or, sql } from "drizzle-orm";
import {
  canEditExpense,
  canMarkSettlement,
  canUndoSettlement,
  computeBalances,
  COST_LIMITS,
  isCostCurrency,
  settlementAllowed,
  sharesByExpense,
  validateExpense,
  type CostViewer,
  type ExpenseErrors,
  type ExpenseFormInput,
  type PartyRef,
} from "@/lib/costs";
import type { IsoDate } from "@/lib/dates";
import { db } from "../db/client";
import {
  trip,
  tripCostParty,
  tripExpense,
  tripExpenseShare,
  tripMember,
  tripPlaceholder,
  tripSettlement,
} from "../db/schema";

/**
 * Data access of cost splitting (F-035/F-036, features.md R.8). Like src/server/stays/db.ts
 * every function takes the INTERNAL trip id – callers resolve it through the viewer's
 * membership first (no IDOR) – and every statement is bound to that trip id (composite foreign
 * keys in the database as well). All writes run under the trip row lock (FOR UPDATE), so balance
 * checks (I10-06), the currency change (I10-08) and «abgeschlossen» never race each other.
 * Titles, notes, amounts and payment details never go to logs.
 */

type Tx = Parameters<Parameters<ReturnType<typeof db>["transaction"]>[0]>[0];
type Executor = Tx | ReturnType<typeof db>;

/* ------------------------------------------------------------------------------------------ */
/* Reading                                                                                      */
/* ------------------------------------------------------------------------------------------ */

export interface PartyRow {
  id: string;
  seq: number;
  userId: string | null;
  placeholderId: string | null;
  formerAt: Date | null;
  formerNo: number | null;
}

export interface ExpenseRow {
  id: string;
  title: string;
  note: string | null;
  amountCents: number;
  currency: string;
  category: string | null;
  spentOn: IsoDate;
  payerPartyId: string;
  splitMode: "equal" | "amounts";
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
  /** Names in this trip – null once the person left (→ «ehemaliges Mitglied»). */
  createdByName: string | null;
  updatedByName: string | null;
}

export interface ShareRow {
  expenseId: string;
  partyId: string;
  shareCents: number;
}

export interface SettlementRow {
  id: string;
  from: string;
  to: string;
  amountCents: number;
  markedBy: string | null;
  markedByName: string | null;
  markedAt: Date;
}

export interface PayInfoRow {
  userId: string;
  iban: string | null;
  note: string | null;
  updatedAt: Date | null;
}

export interface CostsRaw {
  parties: PartyRow[];
  /** Not deleted, newest first (date desc, then creation desc). */
  expenses: ExpenseRow[];
  shares: ShareRow[];
  settlements: SettlementRow[];
  payInfos: PayInfoRow[];
  closed: { at: Date; byName: string | null } | null;
}

function memberName(table: string, column: string) {
  return sql<string | null>`(select m.display_name from trip_member m
    where m.trip_id = ${sql.raw(`"${table}"."trip_id"`)} and m.user_id = ${sql.raw(`"${table}"."${column}"`)})`;
}

const partyColumns = {
  id: tripCostParty.id,
  seq: tripCostParty.seq,
  userId: tripCostParty.userId,
  placeholderId: tripCostParty.placeholderId,
  formerAt: tripCostParty.formerAt,
  formerNo: tripCostParty.formerNo,
};

async function listParties(executor: Executor, tripId: string): Promise<PartyRow[]> {
  return executor
    .select(partyColumns)
    .from(tripCostParty)
    .where(eq(tripCostParty.tripId, tripId))
    .orderBy(asc(tripCostParty.seq));
}

async function listExpenses(executor: Executor, tripId: string): Promise<ExpenseRow[]> {
  const rows = await executor
    .select({
      expense: tripExpense,
      createdByName: memberName("trip_expense", "created_by"),
      updatedByName: memberName("trip_expense", "updated_by"),
    })
    .from(tripExpense)
    .where(and(eq(tripExpense.tripId, tripId), isNull(tripExpense.deletedAt)))
    .orderBy(desc(tripExpense.spentOn), desc(tripExpense.createdAt), desc(tripExpense.id));
  return rows.map(({ expense: e, createdByName, updatedByName }) => ({
    id: e.id,
    title: e.title,
    note: e.note,
    amountCents: e.amountCents,
    currency: e.currency,
    category: e.category,
    spentOn: e.spentOn,
    payerPartyId: e.payerPartyId,
    splitMode: e.splitMode,
    createdBy: e.createdBy,
    updatedBy: e.updatedBy,
    createdAt: e.createdAt,
    updatedAt: e.updatedAt,
    version: e.version,
    createdByName,
    updatedByName,
  }));
}

async function listShares(executor: Executor, tripId: string): Promise<ShareRow[]> {
  return executor
    .select({
      expenseId: tripExpenseShare.expenseId,
      partyId: tripExpenseShare.partyId,
      shareCents: tripExpenseShare.shareCents,
    })
    .from(tripExpenseShare)
    .innerJoin(
      tripExpense,
      and(eq(tripExpense.id, tripExpenseShare.expenseId), eq(tripExpense.tripId, tripId)),
    )
    .where(and(eq(tripExpenseShare.tripId, tripId), isNull(tripExpense.deletedAt)));
}

async function listSettlements(executor: Executor, tripId: string): Promise<SettlementRow[]> {
  return executor
    .select({
      id: tripSettlement.id,
      from: tripSettlement.fromPartyId,
      to: tripSettlement.toPartyId,
      amountCents: tripSettlement.amountCents,
      markedBy: tripSettlement.markedBy,
      markedByName: memberName("trip_settlement", "marked_by"),
      markedAt: tripSettlement.markedAt,
    })
    .from(tripSettlement)
    .where(eq(tripSettlement.tripId, tripId))
    .orderBy(desc(tripSettlement.markedAt), desc(tripSettlement.id));
}

/** Everything the cost pages and the cockpit adapter need (members only – see load.ts). */
export async function loadCostsRaw(tripId: string): Promise<CostsRaw> {
  const executor = db();
  const [parties, expenses, shares, settlements, payInfos, closedRows] = await Promise.all([
    listParties(executor, tripId),
    listExpenses(executor, tripId),
    listShares(executor, tripId),
    listSettlements(executor, tripId),
    executor
      .select({
        userId: tripMember.userId,
        iban: tripMember.paymentIban,
        note: tripMember.paymentNote,
        updatedAt: tripMember.paymentUpdatedAt,
      })
      .from(tripMember)
      .where(eq(tripMember.tripId, tripId)),
    executor
      .select({
        at: trip.costsClosedAt,
        byName: sql<string | null>`(select m.display_name from trip_member m
          where m.trip_id = "trip"."id" and m.user_id = "trip"."costs_closed_by")`,
      })
      .from(trip)
      .where(eq(trip.id, tripId)),
  ]);
  const closed = closedRows[0]?.at ? { at: closedRows[0].at, byName: closedRows[0].byName } : null;
  return { parties, expenses, shares, settlements, payInfos, closed };
}

/** One expense of THIS trip incl. soft-deleted ones (edit page, conflicts). */
export async function findExpense(tripId: string, expenseId: string) {
  const [row] = await db()
    .select()
    .from(tripExpense)
    .where(and(eq(tripExpense.id, expenseId), eq(tripExpense.tripId, tripId)));
  return row ?? null;
}

/* ------------------------------------------------------------------------------------------ */
/* People of the settlement                                                                     */
/* ------------------------------------------------------------------------------------------ */

/** Active persons of a trip in natural order: members (joining order), then open placeholders. */
async function activePersons(tx: Tx, tripId: string) {
  const [members, placeholders] = await Promise.all([
    tx
      .select({ userId: tripMember.userId })
      .from(tripMember)
      .where(eq(tripMember.tripId, tripId))
      .orderBy(asc(tripMember.joinedAt), asc(tripMember.displayName)),
    tx
      .select({ id: tripPlaceholder.id })
      .from(tripPlaceholder)
      .where(and(eq(tripPlaceholder.tripId, tripId), isNull(tripPlaceholder.claimedAt)))
      .orderBy(asc(tripPlaceholder.createdAt), asc(tripPlaceholder.displayName)),
  ]);
  return { members: members.map((m) => m.userId), placeholders: placeholders.map((p) => p.id) };
}

/**
 * Makes sure every ACTIVE person (members + open placeholders) has a party – created in natural
 * order after the existing ones, so `seq` is predictable for the form's live line (rest cents).
 * Runs under the trip lock. Returns all parties and the set of active party ids.
 */
async function ensureParties(tx: Tx, tripId: string) {
  const parties = await listParties(tx, tripId);
  const { members, placeholders } = await activePersons(tx, tripId);
  let next = parties.reduce((max, p) => Math.max(max, p.seq), 0);
  const missing: { userId?: string; placeholderId?: string; seq: number }[] = [];
  for (const userId of members) {
    if (!parties.some((p) => p.userId === userId)) missing.push({ userId, seq: ++next });
  }
  for (const placeholderId of placeholders) {
    if (!parties.some((p) => p.placeholderId === placeholderId)) {
      missing.push({ placeholderId, seq: ++next });
    }
  }
  if (missing.length > 0) {
    await tx.insert(tripCostParty).values(missing.map((m) => ({ tripId, ...m })));
  }
  const all = missing.length > 0 ? await listParties(tx, tripId) : parties;
  const memberSet = new Set(members);
  const placeholderSet = new Set(placeholders);
  const active = new Set(
    all
      .filter(
        (p) =>
          (p.userId !== null && memberSet.has(p.userId)) ||
          (p.placeholderId !== null && placeholderSet.has(p.placeholderId)),
      )
      .map((p) => p.id),
  );
  const accounts = new Set(
    all.filter((p) => p.userId !== null && memberSet.has(p.userId)).map((p) => p.id),
  );
  return { parties: all, active, accounts };
}

/**
 * Key of a person in the form (W19 D.5): an existing party id, or `u:<userId>` / `p:<placeholderId>`
 * for an active person without a party yet. Resolved to party ids under the lock.
 */
export function partyKeyResolver(parties: readonly PartyRow[]) {
  return (key: string): string | null => {
    if (key.startsWith("u:")) return parties.find((p) => p.userId === key.slice(2))?.id ?? null;
    if (key.startsWith("p:")) {
      return parties.find((p) => p.placeholderId === key.slice(2))?.id ?? null;
    }
    return parties.some((p) => p.id === key) ? key : null;
  };
}

/**
 * Leaving, removal, account deletion (R.8 I10-04): the party stays with all amounts but loses
 * the link to the account – «ehemaliges Mitglied» (numbered by leaving order). The person's
 * names as creator/editor/marker in this trip become «ehemaliges Mitglied» as well. Call inside
 * the transaction that ends the membership (trip row locked).
 */
export async function retireParty(tx: Tx, tripId: string, userId: string): Promise<void> {
  const [max] = await tx
    .select({ no: sql<number>`coalesce(max(${tripCostParty.formerNo}), 0)` })
    .from(tripCostParty)
    .where(eq(tripCostParty.tripId, tripId));
  await tx
    .update(tripCostParty)
    .set({ userId: null, formerAt: new Date(), formerNo: (max?.no ?? 0) + 1 })
    .where(and(eq(tripCostParty.tripId, tripId), eq(tripCostParty.userId, userId)));
  for (const column of ["createdBy", "updatedBy", "deletedBy"] as const) {
    await tx
      .update(tripExpense)
      .set({ [column]: null })
      .where(and(eq(tripExpense.tripId, tripId), eq(tripExpense[column], userId)));
  }
  await tx
    .update(tripSettlement)
    .set({ markedBy: null })
    .where(and(eq(tripSettlement.tripId, tripId), eq(tripSettlement.markedBy, userId)));
}

/** Account deletion: retire the person's parties in all their trips (same transaction). */
export async function retireAllParties(tx: Tx, userId: string): Promise<void> {
  const rows = await tx
    .select({ tripId: tripCostParty.tripId })
    .from(tripCostParty)
    .where(eq(tripCostParty.userId, userId));
  for (const row of rows) await retireParty(tx, row.tripId, userId);
}

/** A placeholder is claimed (F-007): the person takes over its party – amounts and balance. */
export async function claimPlaceholderParty(
  tx: Tx,
  tripId: string,
  placeholderId: string,
  userId: string,
): Promise<void> {
  await tx
    .update(tripCostParty)
    .set({ userId, placeholderId: null })
    .where(and(eq(tripCostParty.tripId, tripId), eq(tripCostParty.placeholderId, placeholderId)));
}

/**
 * How often a placeholder is used (R.8 I10-04): expenses (also soft-deleted ones) as payer or
 * participant, and settlements. > 0 blocks deleting the placeholder.
 */
export async function placeholderUsage(
  executor: Executor,
  tripId: string,
  placeholderId: string,
): Promise<{ expenses: number; settlements: number }> {
  const [party] = await executor
    .select({ id: tripCostParty.id })
    .from(tripCostParty)
    .where(and(eq(tripCostParty.tripId, tripId), eq(tripCostParty.placeholderId, placeholderId)));
  if (!party) return { expenses: 0, settlements: 0 };
  const [expenses] = await executor
    .select({ n: count() })
    .from(tripExpense)
    .where(
      and(
        eq(tripExpense.tripId, tripId),
        or(
          eq(tripExpense.payerPartyId, party.id),
          sql`exists (select 1 from trip_expense_share s where s.expense_id = ${tripExpense.id}
            and s.party_id = ${party.id})`,
        ),
      ),
    );
  const [settlements] = await executor
    .select({ n: count() })
    .from(tripSettlement)
    .where(
      and(
        eq(tripSettlement.tripId, tripId),
        or(eq(tripSettlement.fromPartyId, party.id), eq(tripSettlement.toPartyId, party.id)),
      ),
    );
  return { expenses: expenses?.n ?? 0, settlements: settlements?.n ?? 0 };
}

/** Deleting an unused placeholder: its (unused) party goes too. */
export async function dropPlaceholderParty(
  executor: Executor,
  tripId: string,
  placeholderId: string,
): Promise<void> {
  await executor
    .delete(tripCostParty)
    .where(and(eq(tripCostParty.tripId, tripId), eq(tripCostParty.placeholderId, placeholderId)));
}

/* ------------------------------------------------------------------------------------------ */
/* Writing                                                                                      */
/* ------------------------------------------------------------------------------------------ */

async function lockTrip(tx: Tx, tripId: string) {
  const [row] = await tx
    .select({
      phase: trip.phase,
      currency: trip.currency,
      closedAt: trip.costsClosedAt,
      fixedStart: trip.fixedStart,
      fixedEnd: trip.fixedEnd,
    })
    .from(trip)
    .where(eq(trip.id, tripId))
    .for("update");
  return row ?? null;
}

async function balancesIn(tx: Tx, tripId: string) {
  const [parties, shares, expenses, settlements] = await Promise.all([
    listParties(tx, tripId),
    listShares(tx, tripId),
    tx
      .select({
        id: tripExpense.id,
        payer: tripExpense.payerPartyId,
        amount: tripExpense.amountCents,
      })
      .from(tripExpense)
      .where(and(eq(tripExpense.tripId, tripId), isNull(tripExpense.deletedAt))),
    listSettlements(tx, tripId),
  ]);
  const byExpense = sharesByExpense(shares);
  return computeBalances(
    parties.map((p) => p.id),
    expenses.map((e) => ({
      payer: e.payer,
      amountCents: e.amount,
      shares: byExpense.get(e.id) ?? [],
    })),
    settlements.map((s) => ({ from: s.from, to: s.to, cents: s.amountCents })),
  );
}

export interface CostActor {
  userId: string;
  organizer: boolean;
}

export type CostWriteError =
  "phase" | "closed" | "notAllowed" | "gone" | "changed" | "limit" | "invalid" | "hasExpenses";

export type SaveExpenseResult =
  | { ok: true; id: string; amountCents: number; replayed: boolean }
  | { ok: false; error: CostWriteError }
  | { ok: false; error: "invalid"; errors: ExpenseErrors }
  | { ok: false; error: "conflict"; current: { version: number; updatedBy: string | null } }
  | { ok: false; error: "deleted" };

export interface SaveExpenseInput {
  form: ExpenseFormInput;
  locale: string;
  window: { min: IsoDate; max: IsoDate };
  /** Create: client key per form opening (idempotency). */
  idempotencyKey?: string;
  /** Edit: expense id + version read by the client. */
  edit?: { id: string; version: number };
}

async function viewerOf(tx: Tx, tripId: string, actor: CostActor): Promise<CostViewer> {
  const [party] = await tx
    .select({ id: tripCostParty.id })
    .from(tripCostParty)
    .where(and(eq(tripCostParty.tripId, tripId), eq(tripCostParty.userId, actor.userId)));
  return { userId: actor.userId, organizer: actor.organizer, partyId: party?.id ?? null };
}

/**
 * Create or edit an expense (R.8 I10-02/I10-03) – validated again under the trip lock with the
 * parties of THIS trip only: new expenses only with active persons; an edit may keep former
 * members that are already in it (as payer or participant). Shares are stored explicitly; the
 * deferred trigger re-checks «sum = amount» at commit.
 */
export async function saveExpense(
  tripId: string,
  actor: CostActor,
  input: SaveExpenseInput,
): Promise<SaveExpenseResult> {
  return db().transaction(async (tx) => {
    const locked = await lockTrip(tx, tripId);
    if (locked?.phase !== "fixed") return { ok: false, error: "phase" } as const;
    if (locked.closedAt) return { ok: false, error: "closed" } as const;

    if (!input.edit && input.idempotencyKey) {
      const [existing] = await tx
        .select({ id: tripExpense.id, amount: tripExpense.amountCents })
        .from(tripExpense)
        .where(
          and(eq(tripExpense.tripId, tripId), eq(tripExpense.idempotencyKey, input.idempotencyKey)),
        );
      if (existing) {
        return { ok: true, id: existing.id, amountCents: existing.amount, replayed: true } as const;
      }
      const [counted] = await tx
        .select({ n: count() })
        .from(tripExpense)
        .where(and(eq(tripExpense.tripId, tripId), isNull(tripExpense.deletedAt)));
      if ((counted?.n ?? 0) >= COST_LIMITS.perTrip) return { ok: false, error: "limit" } as const;
    }

    const { parties, active } = await ensureParties(tx, tripId);
    const viewer = await viewerOf(tx, tripId, actor);
    let allowed = new Set(active);
    const payers = new Set(active);
    let existing: typeof tripExpense.$inferSelect | null = null;
    if (input.edit) {
      const [row] = await tx
        .select()
        .from(tripExpense)
        .where(and(eq(tripExpense.id, input.edit.id), eq(tripExpense.tripId, tripId)));
      if (!row) return { ok: false, error: "gone" } as const;
      if (row.deletedAt) return { ok: false, error: "deleted" } as const;
      if (!canEditExpense(viewer, { createdBy: row.createdBy, payerParty: row.payerPartyId })) {
        return { ok: false, error: "notAllowed" } as const;
      }
      if (row.version !== input.edit.version) {
        return {
          ok: false,
          error: "conflict",
          current: { version: row.version, updatedBy: row.updatedBy },
        } as const;
      }
      existing = row;
      const own = await tx
        .select({ party: tripExpenseShare.partyId })
        .from(tripExpenseShare)
        .where(eq(tripExpenseShare.expenseId, row.id));
      allowed = new Set([...active, ...own.map((s) => s.party), row.payerPartyId]);
      payers.add(row.payerPartyId);
    }

    // Keys → party ids of this trip; unknown keys stay unknown (validation rejects them).
    const resolve = partyKeyResolver(parties);
    const form = input.form;
    const participants = Array.isArray(form.participants)
      ? form.participants.map((key) =>
          typeof key === "string" ? (resolve(key) ?? `?${key}`) : "?",
        )
      : [];
    const amounts: Record<string, unknown> = {};
    if (typeof form.amounts === "object" && form.amounts !== null) {
      for (const [key, value] of Object.entries(form.amounts as Record<string, unknown>)) {
        const id = resolve(key);
        if (id) amounts[id] = value;
      }
    }
    const payer = typeof form.payer === "string" ? resolve(form.payer) : null;
    const refs: PartyRef[] = parties
      .filter((p) => allowed.has(p.id))
      .map((p) => ({ id: p.id, seq: p.seq }));
    const checked = validateExpense(
      { ...form, participants, amounts, payer },
      { locale: input.locale, parties: refs, payers: [...payers], window: input.window },
    );
    if (!checked.ok) return { ok: false, error: "invalid", errors: checked.errors } as const;
    const values = checked.values;
    const now = new Date();
    let id: string;
    if (existing) {
      await tx
        .update(tripExpense)
        .set({
          title: values.title,
          note: values.note,
          amountCents: values.amountCents,
          category: values.category,
          spentOn: values.date,
          payerPartyId: values.payer,
          splitMode: values.mode,
          updatedBy: actor.userId,
          updatedAt: now,
          version: existing.version + 1,
        })
        .where(eq(tripExpense.id, existing.id));
      await tx.delete(tripExpenseShare).where(eq(tripExpenseShare.expenseId, existing.id));
      id = existing.id;
    } else {
      const [row] = await tx
        .insert(tripExpense)
        .values({
          tripId,
          title: values.title,
          note: values.note,
          amountCents: values.amountCents,
          currency: locked.currency,
          category: values.category,
          spentOn: values.date,
          payerPartyId: values.payer,
          splitMode: values.mode,
          createdBy: actor.userId,
          updatedBy: actor.userId,
          createdAt: now,
          updatedAt: now,
          idempotencyKey: input.idempotencyKey ?? null,
        })
        .returning({ id: tripExpense.id });
      if (!row) return { ok: false, error: "changed" } as const;
      id = row.id;
    }
    await tx.insert(tripExpenseShare).values(
      values.shares.map((s) => ({
        expenseId: id,
        tripId,
        partyId: s.party,
        shareCents: s.cents,
      })),
    );
    return { ok: true, id, amountCents: values.amountCents, replayed: false } as const;
  });
}

/** Soft delete (I10-03): right + version; «Rückgängig» restores it. */
export async function deleteExpense(
  tripId: string,
  actor: CostActor,
  expenseId: string,
  version: number,
): Promise<{ ok: true; version: number } | { ok: false; error: CostWriteError | "conflict" }> {
  return db().transaction(async (tx) => {
    const locked = await lockTrip(tx, tripId);
    if (locked?.phase !== "fixed") return { ok: false, error: "phase" } as const;
    if (locked.closedAt) return { ok: false, error: "closed" } as const;
    const [row] = await tx
      .select()
      .from(tripExpense)
      .where(and(eq(tripExpense.id, expenseId), eq(tripExpense.tripId, tripId)));
    if (!row || row.deletedAt) return { ok: false, error: "gone" } as const;
    const viewer = await viewerOf(tx, tripId, actor);
    if (!canEditExpense(viewer, { createdBy: row.createdBy, payerParty: row.payerPartyId })) {
      return { ok: false, error: "notAllowed" } as const;
    }
    if (row.version !== version) return { ok: false, error: "conflict" } as const;
    await tx
      .update(tripExpense)
      .set({ deletedAt: new Date(), deletedBy: actor.userId, version: row.version + 1 })
      .where(eq(tripExpense.id, row.id));
    return { ok: true, version: row.version + 1 } as const;
  });
}

/** «Rückgängig» after deleting – same rights, not when closed. */
export async function restoreExpense(
  tripId: string,
  actor: CostActor,
  expenseId: string,
): Promise<{ ok: true } | { ok: false; error: CostWriteError }> {
  return db().transaction(async (tx) => {
    const locked = await lockTrip(tx, tripId);
    if (locked?.phase !== "fixed") return { ok: false, error: "phase" } as const;
    if (locked.closedAt) return { ok: false, error: "closed" } as const;
    const [row] = await tx
      .select()
      .from(tripExpense)
      .where(and(eq(tripExpense.id, expenseId), eq(tripExpense.tripId, tripId)));
    if (!row?.deletedAt) return { ok: false, error: "gone" } as const;
    const viewer = await viewerOf(tx, tripId, actor);
    if (!canEditExpense(viewer, { createdBy: row.createdBy, payerParty: row.payerPartyId })) {
      return { ok: false, error: "notAllowed" } as const;
    }
    await tx
      .update(tripExpense)
      .set({ deletedAt: null, deletedBy: null, version: row.version + 1 })
      .where(eq(tripExpense.id, row.id));
    return { ok: true } as const;
  });
}

/**
 * «Als bezahlt/erhalten markieren» (I10-06): rights (CEO a) and the balance check under the trip
 * lock – A owes now, B is owed now, amount ≤ min(|A|, B). A double tap books exactly once.
 */
export async function markSettlement(
  tripId: string,
  actor: CostActor,
  from: string,
  to: string,
  cents: number,
): Promise<{ ok: true; id: string } | { ok: false; error: CostWriteError }> {
  return db().transaction(async (tx) => {
    const locked = await lockTrip(tx, tripId);
    if (locked?.phase !== "fixed") return { ok: false, error: "phase" } as const;
    if (locked.closedAt) return { ok: false, error: "closed" } as const;
    const { parties, accounts } = await ensureParties(tx, tripId);
    if (!parties.some((p) => p.id === from) || !parties.some((p) => p.id === to)) {
      return { ok: false, error: "gone" } as const;
    }
    const viewer = await viewerOf(tx, tripId, actor);
    const allowed = canMarkSettlement(
      viewer,
      { party: from, account: accounts.has(from) },
      { party: to, account: accounts.has(to) },
    );
    if (!allowed) return { ok: false, error: "notAllowed" } as const;
    const balances = await balancesIn(tx, tripId);
    if (!settlementAllowed(balances, from, to, cents))
      return { ok: false, error: "changed" } as const;
    const [row] = await tx
      .insert(tripSettlement)
      .values({
        tripId,
        fromPartyId: from,
        toPartyId: to,
        amountCents: cents,
        markedBy: actor.userId,
      })
      .returning({ id: tripSettlement.id });
    return row ? ({ ok: true, id: row.id } as const) : ({ ok: false, error: "changed" } as const);
  });
}

/** «Zurücknehmen» / «Rückgängig» of a settlement – hard delete (I10-06). */
export async function undoSettlement(
  tripId: string,
  actor: CostActor,
  settlementId: string,
): Promise<{ ok: true } | { ok: false; error: CostWriteError }> {
  return db().transaction(async (tx) => {
    const locked = await lockTrip(tx, tripId);
    if (locked?.phase !== "fixed") return { ok: false, error: "phase" } as const;
    if (locked.closedAt) return { ok: false, error: "closed" } as const;
    const [row] = await tx
      .select()
      .from(tripSettlement)
      .where(and(eq(tripSettlement.id, settlementId), eq(tripSettlement.tripId, tripId)));
    if (!row) return { ok: false, error: "gone" } as const;
    const viewer = await viewerOf(tx, tripId, actor);
    const allowed = canUndoSettlement(viewer, {
      from: row.fromPartyId,
      to: row.toPartyId,
      markedBy: row.markedBy,
    });
    if (!allowed) return { ok: false, error: "notAllowed" } as const;
    await tx.delete(tripSettlement).where(eq(tripSettlement.id, row.id));
    return { ok: true } as const;
  });
}

/** Own payment details (I10-07) – only the own membership row; null/null = delete. */
export async function savePayInfo(
  tripId: string,
  userId: string,
  values: { iban: string | null; note: string | null },
): Promise<boolean> {
  const empty = values.iban === null && values.note === null;
  const rows = await db()
    .update(tripMember)
    .set({
      paymentIban: values.iban,
      paymentNote: values.note,
      paymentUpdatedAt: empty ? null : new Date(),
    })
    .where(and(eq(tripMember.tripId, tripId), eq(tripMember.userId, userId)))
    .returning({ userId: tripMember.userId });
  return rows.length > 0;
}

/**
 * Currency of the trip (I10-08, organiser – checked by the caller): only while there is no
 * expense (not deleted) and no settlement; soft-deleted expenses are purged for good.
 */
export async function changeCurrency(
  tripId: string,
  currency: string,
): Promise<{ ok: true } | { ok: false; error: CostWriteError }> {
  if (!isCostCurrency(currency)) return { ok: false, error: "invalid" };
  return db().transaction(async (tx) => {
    const locked = await lockTrip(tx, tripId);
    if (locked?.phase !== "fixed") return { ok: false, error: "phase" } as const;
    if (locked.closedAt) return { ok: false, error: "closed" } as const;
    const [expenses] = await tx
      .select({ n: count() })
      .from(tripExpense)
      .where(and(eq(tripExpense.tripId, tripId), isNull(tripExpense.deletedAt)));
    const [settlements] = await tx
      .select({ n: count() })
      .from(tripSettlement)
      .where(eq(tripSettlement.tripId, tripId));
    if ((expenses?.n ?? 0) > 0 || (settlements?.n ?? 0) > 0) {
      return { ok: false, error: "hasExpenses" } as const;
    }
    await tx
      .delete(tripExpense)
      .where(and(eq(tripExpense.tripId, tripId), isNotNull(tripExpense.deletedAt)));
    await tx.update(trip).set({ currency }).where(eq(trip.id, tripId));
    return { ok: true } as const;
  });
}

/** «Abrechnung abschließen» / «wieder öffnen» (organiser – checked by the caller). */
export async function setCostsClosed(
  tripId: string,
  by: string | null,
): Promise<{ ok: true } | { ok: false; error: CostWriteError }> {
  return db().transaction(async (tx) => {
    const locked = await lockTrip(tx, tripId);
    if (locked?.phase !== "fixed") return { ok: false, error: "phase" } as const;
    await tx
      .update(trip)
      .set(
        by
          ? { costsClosedAt: new Date(), costsClosedBy: by }
          : { costsClosedAt: null, costsClosedBy: null },
      )
      .where(eq(trip.id, tripId));
    return { ok: true } as const;
  });
}

/* ------------------------------------------------------------------------------------------ */
/* Retention, export, warnings                                                                  */
/* ------------------------------------------------------------------------------------------ */

/** Retention job (deployment.md §0.10): soft-deleted expenses older than 24 h go for good. */
export async function purgeDeletedExpenses(now: Date): Promise<number> {
  const rows = await db()
    .delete(tripExpense)
    .where(
      and(
        isNotNull(tripExpense.deletedAt),
        lt(tripExpense.deletedAt, new Date(now.getTime() - 24 * 60 * 60 * 1000)),
      ),
    )
    .returning({ id: tripExpense.id });
  return rows.length;
}

/** Current balances per party of a trip (from scratch – nothing is stored, R.8). */
export async function tripBalances(tripId: string) {
  const raw = await loadCostsRaw(tripId);
  return balancesOf(raw);
}

export function balancesOf(raw: Pick<CostsRaw, "parties" | "expenses" | "shares" | "settlements">) {
  const byExpense = sharesByExpense(raw.shares);
  return computeBalances(
    raw.parties.map((p) => p.id),
    raw.expenses.map((e) => ({
      payer: e.payerPartyId,
      amountCents: e.amountCents,
      shares: byExpense.get(e.id) ?? [],
    })),
    raw.settlements.map((s) => ({ from: s.from, to: s.to, cents: s.amountCents })),
  );
}

/** Own balance of a person in several trips (leave/remove/account-deletion warnings). */
export async function userBalances(
  userId: string,
  tripIds: readonly string[],
): Promise<Map<string, { cents: number; currency: string; closed: boolean }>> {
  const result = new Map<string, { cents: number; currency: string; closed: boolean }>();
  if (tripIds.length === 0) return result;
  const rows = await db()
    .select({
      tripId: tripCostParty.tripId,
      partyId: tripCostParty.id,
      currency: trip.currency,
      closed: trip.costsClosedAt,
    })
    .from(tripCostParty)
    .innerJoin(trip, eq(trip.id, tripCostParty.tripId))
    .where(and(eq(tripCostParty.userId, userId), inArray(tripCostParty.tripId, [...tripIds])));
  for (const row of rows) {
    const balances = await tripBalances(row.tripId);
    result.set(row.tripId, {
      cents: balances.get(row.partyId) ?? 0,
      currency: row.currency,
      closed: row.closed !== null,
    });
  }
  return result;
}

export interface CostExport {
  tripId: string;
  partyId: string;
}

/** Data export (I10-10): the person's party per trip. */
export async function partiesOfUser(userId: string): Promise<CostExport[]> {
  return db()
    .select({ tripId: tripCostParty.tripId, partyId: tripCostParty.id })
    .from(tripCostParty)
    .where(eq(tripCostParty.userId, userId));
}

/** Expenses incl. shares of a trip for the export (not deleted). */
export async function exportRows(tripId: string) {
  const raw = await loadCostsRaw(tripId);
  return { ...raw, balances: balancesOf(raw) };
}
