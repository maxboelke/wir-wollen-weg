import "server-only";
import {
  canEditExpense,
  canUndoSettlement,
  debtThresholdCents,
  expenseDateWindow,
  formerNumbers,
  settleUp,
  type PartyInfo,
} from "@/lib/costs";
import { isoDateInZone, type IsoDate } from "@/lib/dates";
import type { CostPerson, CostStatus } from "@/lib/trip-route";
import { subphaseOf } from "@/lib/trip-route";
import { balancesOf, type CostsRaw } from "@/server/costs/db";
import type { TripView } from "../trips/load";

/**
 * Viewer model of the cost pages (F-035/F-036, W19 D). Everything here is visible to every
 * member of the trip (Q35 – transparency); non-members never get here (404 via the membership).
 * The client recomputes balances and the settle-up proposal with the same pure functions
 * (src/lib/costs.ts) for its optimistic steps (delete, mark), the server is the truth after
 * every refresh.
 */

export type PersonKind = "member" | "placeholder" | "former";

export interface CostPersonView {
  /** Party id – or `u:<userId>` / `p:<placeholderId>` for an active person without a party yet. */
  key: string;
  seq: number;
  kind: PersonKind;
  /** Display name (members, placeholders); null for former members. */
  name: string | null;
  /** Number of a former member when there are several («ehemaliges Mitglied 2»). */
  formerNo: number | null;
  me: boolean;
  organizer: boolean;
  /** Active member with an account (marking rules). */
  account: boolean;
  /** Active = may be chosen in new expenses. */
  active: boolean;
  /** Avatar colour seed. */
  avatarId: string;
  /** Voluntary payment details (members only). */
  pay: { iban: string | null; note: string | null; updatedOn: IsoDate | null } | null;
}

export interface CostExpenseView {
  id: string;
  version: number;
  title: string;
  note: string | null;
  amountCents: number;
  category: string | null;
  date: IsoDate;
  payer: string;
  mode: "equal" | "amounts";
  shares: { party: string; cents: number }[];
  createdOn: IsoDate;
  /** null → «ehemaliges Mitglied». */
  createdByName: string | null;
  edited: { on: IsoDate; byName: string | null } | null;
  canEdit: boolean;
  /** «Ändern können {names} und die Orga.» – active members with the right (never formers). */
  editors: string[];
  createdAt: number;
}

export interface CostSettlementView {
  id: string;
  from: string;
  to: string;
  cents: number;
  markedOn: IsoDate;
  markedByName: string | null;
  markedByMe: boolean;
  /** The organiser marked it for two sides without an account («markiert von Lena (Orga)»). */
  markedByOrga: boolean;
  canUndo: boolean;
}

export interface CostsModel {
  publicId: string;
  tripName: string;
  currency: string;
  intl: string;
  locale: string;
  isOrganizer: boolean;
  orgaName: string;
  /** Viewer's key (party id or `u:<id>`). */
  me: string;
  /** Viewer's party id (null: never in the costs yet). */
  myParty: string | null;
  people: CostPersonView[];
  /** Not deleted, newest first (date desc, created desc). */
  expenses: CostExpenseView[];
  /** Newest first. */
  settlements: CostSettlementView[];
  closed: { byName: string | null; on: IsoDate } | null;
  window: { min: IsoDate; max: IsoDate };
  today: IsoDate;
  subphase: "before" | "during" | "after";
  /** Organiser and no expense/settlement (the currency can change). */
  canChangeCurrency: boolean;
}

/** People of the settlement: active members, open placeholders, relevant former members. */
function peopleOf(view: TripView, raw: CostsRaw): CostPersonView[] {
  const { members, placeholders, me } = view;
  const maxSeq = raw.parties.reduce((max, p) => Math.max(max, p.seq), 0);
  let virtual = maxSeq;
  const payByUser = new Map(raw.payInfos.map((p) => [p.userId, p]));
  const memberIds = new Set(members.map((m) => m.userId));
  const openIds = new Set(placeholders.map((p) => p.id));
  const people: CostPersonView[] = [];
  for (const m of members) {
    const party = raw.parties.find((p) => p.userId === m.userId);
    const pay = payByUser.get(m.userId);
    people.push({
      key: party?.id ?? `u:${m.userId}`,
      seq: party?.seq ?? ++virtual,
      kind: "member",
      name: m.displayName,
      formerNo: null,
      me: m.userId === me.userId,
      organizer: m.role === "organizer",
      account: true,
      active: true,
      avatarId: m.userId,
      pay: {
        iban: pay?.iban ?? null,
        note: pay?.note ?? null,
        updatedOn: pay?.updatedAt ? isoDateInZone(pay.updatedAt) : null,
      },
    });
  }
  for (const p of placeholders) {
    const party = raw.parties.find((row) => row.placeholderId === p.id);
    people.push({
      key: party?.id ?? `p:${p.id}`,
      seq: party?.seq ?? ++virtual,
      kind: "placeholder",
      name: p.displayName,
      formerNo: null,
      me: false,
      organizer: false,
      account: false,
      active: true,
      avatarId: p.id,
      pay: null,
    });
  }
  // Former members: parties without an active member/placeholder that appear somewhere.
  const formers = raw.parties.filter(
    (p) =>
      !(p.userId !== null && memberIds.has(p.userId)) &&
      !(p.placeholderId !== null && openIds.has(p.placeholderId)),
  );
  const relevant = new Set<string>();
  for (const e of raw.expenses) relevant.add(e.payerPartyId);
  for (const s of raw.shares) relevant.add(s.partyId);
  for (const s of raw.settlements) {
    relevant.add(s.from);
    relevant.add(s.to);
  }
  const infos: PartyInfo[] = formers.map((p) => ({
    id: p.id,
    seq: p.seq,
    kind: "former",
    name: null,
    userId: null,
    formerNo: p.formerNo,
  }));
  const numbers = formerNumbers(infos, relevant);
  for (const p of formers) {
    if (!relevant.has(p.id)) continue;
    people.push({
      key: p.id,
      seq: p.seq,
      kind: "former",
      name: null,
      formerNo: numbers.get(p.id) ?? null,
      me: false,
      organizer: false,
      account: false,
      active: false,
      avatarId: p.id,
      pay: null,
    });
  }
  return people;
}

export function costsModel(view: TripView, raw: CostsRaw): CostsModel {
  const { trip, me, isOrganizer, members, format, today } = view;
  const people = peopleOf(view, raw);
  const mine = people.find((p) => p.me);
  const myParty = mine && !mine.key.includes(":") ? mine.key : null;
  const viewer = { userId: me.userId, partyId: myParty, organizer: isOrganizer };
  const closed = raw.closed !== null;
  const nameOfParty = new Map(people.map((p) => [p.key, p]));
  const start = trip.fixedStart ?? today;
  const end = trip.fixedEnd ?? today;
  const expenses: CostExpenseView[] = raw.expenses.map((e) => {
    const editors = new Set<string>();
    const creator = members.find((m) => m.userId === e.createdBy);
    if (creator && creator.role !== "organizer") editors.add(creator.displayName);
    const payer = nameOfParty.get(e.payerPartyId);
    if (payer?.account && !payer.organizer && payer.name) editors.add(payer.name);
    const created = isoDateInZone(e.createdAt);
    const editedLater = e.version > 1 && e.updatedAt.getTime() - e.createdAt.getTime() > 1000;
    return {
      id: e.id,
      version: e.version,
      title: e.title,
      note: e.note,
      amountCents: e.amountCents,
      category: e.category,
      date: e.spentOn,
      payer: e.payerPartyId,
      mode: e.splitMode,
      shares: raw.shares
        .filter((s) => s.expenseId === e.id)
        .map((s) => ({ party: s.partyId, cents: s.shareCents })),
      createdOn: created,
      createdByName: e.createdByName,
      edited: editedLater ? { on: isoDateInZone(e.updatedAt), byName: e.updatedByName } : null,
      canEdit:
        !closed && canEditExpense(viewer, { createdBy: e.createdBy, payerParty: e.payerPartyId }),
      editors: [...editors],
      createdAt: e.createdAt.getTime(),
    };
  });
  const organizerIds = new Set(members.filter((m) => m.role === "organizer").map((m) => m.userId));
  const settlements: CostSettlementView[] = raw.settlements.map((s) => {
    const fromUser = raw.parties.find((p) => p.id === s.from)?.userId ?? null;
    const toUser = raw.parties.find((p) => p.id === s.to)?.userId ?? null;
    return {
      id: s.id,
      from: s.from,
      to: s.to,
      cents: s.amountCents,
      markedOn: isoDateInZone(s.markedAt),
      markedByName: s.markedByName,
      markedByMe: s.markedBy === me.userId,
      markedByOrga:
        s.markedBy !== null &&
        organizerIds.has(s.markedBy) &&
        s.markedBy !== fromUser &&
        s.markedBy !== toUser,
      canUndo:
        !closed && canUndoSettlement(viewer, { from: s.from, to: s.to, markedBy: s.markedBy }),
    };
  });
  return {
    publicId: trip.publicId,
    tripName: trip.name,
    currency: trip.currency,
    intl: format.intl,
    locale: format.locale,
    isOrganizer,
    orgaName: members.find((m) => m.role === "organizer")?.displayName ?? "",
    me: mine?.key ?? `u:${me.userId}`,
    myParty,
    people,
    expenses,
    settlements,
    closed: raw.closed ? { byName: raw.closed.byName, on: isoDateInZone(raw.closed.at) } : null,
    window: expenseDateWindow(start, end),
    today,
    subphase: subphaseOf(start, end, today),
    canChangeCurrency:
      isOrganizer && !closed && raw.expenses.length === 0 && raw.settlements.length === 0,
  };
}

/** Proposal rows from the server data (party ids). */
export function proposalOf(raw: CostsRaw) {
  const balances = balancesOf(raw);
  return {
    balances,
    transfers: settleUp(
      raw.parties.map((p) => ({ id: p.id, seq: p.seq, cents: balances.get(p.id) ?? 0 })),
    ),
  };
}

/**
 * Adapter `costStatus()` for the way (W16 v2.15). `formerName(n)` resolves «ehemaliges
 * Mitglied» (numbered) in the viewer's language.
 */
export function costStatus(
  view: TripView,
  raw: CostsRaw,
  formerName: (no: number | null) => string,
): CostStatus {
  const model = costsModel(view, raw);
  const { balances, transfers } = proposalOf(raw);
  const byKey = new Map(model.people.map((p) => [p.key, p]));
  const person = (key: string, cents: number): CostPerson => {
    const p = byKey.get(key);
    return {
      key,
      cents,
      name: p?.name ?? formerName(p?.formerNo ?? null),
      placeholder: p?.kind === "placeholder",
      former: p === undefined || p.kind === "former",
    };
  };
  const me = model.myParty;
  const myDebts = transfers.filter((t) => t.from === me).map((t) => person(t.to, t.cents));
  const owedToMe = transfers.filter((t) => t.to === me).map((t) => person(t.from, t.cents));
  const firstCreditor = myDebts[0] ? byKey.get(myDebts[0].key) : undefined;
  return {
    expenseCount: raw.expenses.length,
    totalCents: raw.expenses.reduce((sum, e) => sum + e.amountCents, 0),
    currency: view.trip.currency,
    myBalanceCents: me ? (balances.get(me) ?? 0) : 0,
    myDebts,
    owedToMe,
    openTransfers: transfers.length,
    allSettled: [...balances.values()].every((cents) => cents === 0),
    closed: raw.closed !== null,
    threshold: debtThresholdCents(view.trip.currency),
    firstHasPayInfo: Boolean(firstCreditor?.pay?.iban ?? firstCreditor?.pay?.note),
  };
}
