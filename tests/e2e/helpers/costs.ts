import pg from "pg";
import { isoDay } from "./db";

/**
 * Cost splitting test data (Increment 10, features.md R.8): parties in the app's fixed order
 * (members by joining, then open placeholders – like `ensureParties`), expenses with explicit
 * shares, settlements and payment details. People are addressed by their display name in the
 * trip; `former:<n>` creates/uses a former member («ehemaliges Mitglied n»).
 */

const databaseUrl = process.env.DATABASE_URL ?? "postgres://app:app@localhost:5432/wirwollenweg";

async function withClient<T>(work: (client: pg.Client) => Promise<T>): Promise<T> {
  const client = new pg.Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    return await work(client);
  } finally {
    await client.end();
  }
}

/** Creates missing parties (members, open placeholders) and returns name → party id. */
async function parties(client: pg.Client, tripId: string): Promise<Map<string, string>> {
  const existing = await client.query<{
    id: string;
    seq: number;
    user_id: string | null;
    placeholder_id: string | null;
    former_no: number | null;
  }>("select id, seq, user_id, placeholder_id, former_no from trip_cost_party where trip_id = $1", [
    tripId,
  ]);
  let seq = existing.rows.reduce((max, r) => Math.max(max, r.seq), 0);
  const members = await client.query<{ user_id: string; display_name: string }>(
    "select user_id, display_name from trip_member where trip_id = $1 order by joined_at, display_name",
    [tripId],
  );
  const placeholders = await client.query<{ id: string; display_name: string }>(
    `select id, display_name from trip_placeholder where trip_id = $1 and claimed_at is null
      order by created_at, display_name`,
    [tripId],
  );
  const result = new Map<string, string>();
  for (const m of members.rows) {
    let id = existing.rows.find((r) => r.user_id === m.user_id)?.id;
    if (!id) {
      const row = await client.query<{ id: string }>(
        "insert into trip_cost_party (trip_id, seq, user_id) values ($1, $2, $3) returning id",
        [tripId, ++seq, m.user_id],
      );
      id = row.rows[0]?.id ?? "";
    }
    result.set(m.display_name, id);
  }
  for (const p of placeholders.rows) {
    let id = existing.rows.find((r) => r.placeholder_id === p.id)?.id;
    if (!id) {
      const row = await client.query<{ id: string }>(
        "insert into trip_cost_party (trip_id, seq, placeholder_id) values ($1, $2, $3) returning id",
        [tripId, ++seq, p.id],
      );
      id = row.rows[0]?.id ?? "";
    }
    result.set(p.display_name, id);
  }
  for (const f of existing.rows.filter((r) => r.user_id === null && r.placeholder_id === null)) {
    result.set(`former:${String(f.former_no ?? 0)}`, f.id);
  }
  return result;
}

async function partyOf(client: pg.Client, tripId: string, key: string): Promise<string> {
  const map = await parties(client, tripId);
  const found = map.get(key);
  if (found) return found;
  if (key.startsWith("former:")) {
    const seq = await client.query<{ n: number }>(
      "select coalesce(max(seq), 0)::int as n from trip_cost_party where trip_id = $1",
      [tripId],
    );
    const row = await client.query<{ id: string }>(
      `insert into trip_cost_party (trip_id, seq, former_at, former_no)
       values ($1, $2, now() - interval '1 day', $3) returning id`,
      [tripId, (seq.rows[0]?.n ?? 0) + 1, Number(key.slice(7))],
    );
    return row.rows[0]?.id ?? "";
  }
  throw new Error(`No person «${key}» in the trip`);
}

export interface ExpenseInput {
  title: string;
  /** Cents. */
  amount: number;
  payer: string;
  /** Person → cents (must add up to `amount`). */
  shares: Record<string, number>;
  /** Day offset from today. */
  day?: number;
  /** Display name of the creator (member) – default: the payer if a member. */
  by?: string;
  mode?: "equal" | "amounts";
  deletedHoursAgo?: number;
}

/** Inserts an expense with shares; returns its id. */
export async function addExpense(tripId: string, input: ExpenseInput): Promise<string> {
  return withClient(async (client) => {
    await client.query("begin");
    const payer = await partyOf(client, tripId, input.payer);
    const shares: [string, number][] = [];
    for (const [key, cents] of Object.entries(input.shares)) {
      shares.push([await partyOf(client, tripId, key), cents]);
    }
    const row = await client.query<{ id: string }>(
      `insert into trip_expense (trip_id, title, amount_cents, currency, spent_on, payer_party_id,
         split_mode, created_by, updated_by, deleted_at)
       select $1, $2, $3, t.currency, $4, $5, $6,
         (select user_id from trip_member where trip_id = $1 and display_name = $7),
         (select user_id from trip_member where trip_id = $1 and display_name = $7),
         case when $8::int is not null then now() - make_interval(hours => $8::int) end
       from trip t where t.id = $1 returning id`,
      [
        tripId,
        input.title,
        input.amount,
        isoDay(input.day ?? 0),
        payer,
        input.mode ?? "equal",
        input.by ?? input.payer,
        input.deletedHoursAgo ?? null,
      ],
    );
    const id = row.rows[0]?.id ?? "";
    for (const [party, cents] of shares) {
      await client.query(
        "insert into trip_expense_share (expense_id, trip_id, party_id, share_cents) values ($1, $2, $3, $4)",
        [id, tripId, party, cents],
      );
    }
    await client.query("commit");
    return id;
  });
}

/** A settlement «from → to» marked by a member (display name). */
export async function addSettlement(
  tripId: string,
  from: string,
  to: string,
  cents: number,
  by: string,
): Promise<void> {
  await withClient(async (client) => {
    const a = await partyOf(client, tripId, from);
    const b = await partyOf(client, tripId, to);
    await client.query(
      `insert into trip_settlement (trip_id, from_party_id, to_party_id, amount_cents, marked_by)
       values ($1, $2, $3, $4, (select user_id from trip_member where trip_id = $1 and display_name = $5))`,
      [tripId, a, b, cents, by],
    );
  });
}

/** Payment details of a member (display name). */
export async function setPayInfo(
  tripId: string,
  name: string,
  iban: string | null,
  note: string | null,
) {
  await withClient(async (client) => {
    await client.query(
      `update trip_member set payment_iban = $3, payment_note = $4, payment_updated_at = now()
        where trip_id = $1 and display_name = $2`,
      [tripId, name, iban, note],
    );
  });
}

/** Closes the costs (by the organiser). */
export async function closeCosts(tripId: string): Promise<void> {
  await withClient(async (client) => {
    await client.query(
      `update trip set costs_closed_at = now(), costs_closed_by =
         (select user_id from trip_member where trip_id = $1 and role = 'organizer') where id = $1`,
      [tripId],
    );
  });
}

/** Someone else changed an expense meanwhile (version + 1, new amount for all shares). */
export async function bumpExpense(expenseId: string, title: string): Promise<void> {
  await withClient(async (client) => {
    await client.query(
      "update trip_expense set title = $2, version = version + 1, updated_at = now() where id = $1",
      [expenseId, title],
    );
  });
}

export async function costRows(tripId: string) {
  return withClient(async (client) => {
    const expenses = await client.query<{
      id: string;
      title: string;
      amount_cents: number;
      deleted: boolean;
      version: number;
      split_mode: string;
      note: string | null;
      currency: string;
    }>(
      `select id, title, amount_cents, deleted_at is not null as deleted, version, split_mode, note,
         currency from trip_expense where trip_id = $1 order by created_at`,
      [tripId],
    );
    const shares = await client.query<{ expense_id: string; share_cents: number; seq: number }>(
      `select s.expense_id, s.share_cents, p.seq from trip_expense_share s
         join trip_cost_party p on p.id = s.party_id where s.trip_id = $1 order by p.seq`,
      [tripId],
    );
    const settlements = await client.query<{ amount_cents: number }>(
      "select amount_cents from trip_settlement where trip_id = $1",
      [tripId],
    );
    const parties = await client.query<{
      user_id: string | null;
      former_no: number | null;
      former_at: Date | null;
    }>(
      "select user_id, former_no, former_at from trip_cost_party where trip_id = $1 order by seq",
      [tripId],
    );
    const trip = await client.query<{ currency: string; closed: boolean }>(
      "select currency, costs_closed_at is not null as closed from trip where id = $1",
      [tripId],
    );
    const pay = await client.query<{
      display_name: string;
      payment_iban: string | null;
      payment_note: string | null;
    }>("select display_name, payment_iban, payment_note from trip_member where trip_id = $1", [
      tripId,
    ]);
    return {
      expenses: expenses.rows,
      shares: shares.rows,
      settlements: settlements.rows,
      parties: parties.rows,
      trip: trip.rows[0],
      pay: pay.rows,
    };
  });
}
