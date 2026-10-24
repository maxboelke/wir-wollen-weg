// Key rotation of the travel details (deployment.md §0.11.6, Runbook A §0.11.7). Self-contained
// (relative `.ts` imports, plain `pg` client) so `pnpm travel-data:rotate` runs with plain Node.
// Output: counts per key id only – never ids of rows, people or values.
import type { ClientBase } from "pg";
import { openRecord, sealRecord, TravelCryptoError, type KeyRing } from "./cipher.ts";

export interface RotateReport {
  /** Rows per key id BEFORE the run. */
  before: Record<string, number>;
  /** Rows re-encrypted with the active key (0 with `dryRun`). */
  rotated: number;
  /** Rows with a key id that is not in the ring. */
  unknownKey: number;
  /** Rows whose decryption failed (wrong key, manipulated row). */
  failed: number;
  /** Rows deleted by `purgeUnreadable` (answers back to «offen»). */
  purged: number;
  /** Rows still on an old key after the run. */
  remainingOldKeys: number;
}

interface Row {
  recipient_id: string;
  trip_id: string;
  request_id: string;
  user_id: string | null;
  ciphertext: Buffer;
  nonce: Buffer;
  key_id: string;
  schema_version: number;
}

const BATCH = 200;

async function countsByKey(client: Pick<ClientBase, "query">) {
  const rows = await client.query<{ key_id: string; n: number }>(
    `select key_id, count(*)::int as n from travel_data_release group by key_id order by key_id`,
  );
  return Object.fromEntries(rows.rows.map((r) => [r.key_id, r.n]));
}

/**
 * Re-encrypts every release that is not on the active key (new nonce, same AAD and schema
 * version), batch-wise in transactions with `FOR UPDATE SKIP LOCKED` – idempotent and safe next
 * to the running app. `purgeUnreadable` (Runbook A) hard deletes rows that cannot be decrypted
 * (with their access log) and sets the answers back to «offen».
 */
export async function rotateTravelKeys(
  client: Pick<ClientBase, "query">,
  ring: KeyRing,
  options: { dryRun?: boolean; purgeUnreadable?: boolean } = {},
): Promise<RotateReport> {
  const before = await countsByKey(client);
  const report: RotateReport = {
    before,
    rotated: 0,
    unknownKey: 0,
    failed: 0,
    purged: 0,
    remainingOldKeys: 0,
  };
  if (options.dryRun) {
    for (const [kid, n] of Object.entries(before)) {
      if (kid !== ring.active.kid) {
        report.remainingOldKeys += n;
        if (!ring.byId.has(kid)) report.unknownKey += n;
      }
    }
    return report;
  }
  const skip = new Set<string>();
  for (;;) {
    await client.query("begin");
    let rows: Row[];
    try {
      const result = await client.query<Row>(
        `select r.recipient_id, c.trip_id, c.request_id, c.user_id, r.ciphertext, r.nonce, r.key_id,
           r.schema_version
         from travel_data_release r join travel_data_recipient c on c.id = r.recipient_id
         where r.key_id <> $1 and not (r.recipient_id = any($2::uuid[]))
         order by r.recipient_id limit $3 for update of r skip locked`,
        [ring.active.kid, [...skip], BATCH],
      );
      rows = result.rows;
      for (const row of rows) {
        const aad = {
          tripId: row.trip_id,
          requestId: row.request_id,
          userId: row.user_id ?? "",
          schemaVersion: row.schema_version,
        };
        let record: unknown;
        try {
          record = openRecord(
            ring,
            { ciphertext: row.ciphertext, nonce: row.nonce, keyId: row.key_id },
            aad,
          );
        } catch (error) {
          if (!(error instanceof TravelCryptoError)) throw error;
          if (error.reason === "unknownKey") report.unknownKey += 1;
          else report.failed += 1;
          if (options.purgeUnreadable) {
            await client.query(`delete from travel_data_release where recipient_id = $1`, [
              row.recipient_id,
            ]);
            await client.query(
              `update travel_data_recipient set state = 'open', responded_at = null, updated_at = now()
               where id = $1 and state = 'released'`,
              [row.recipient_id],
            );
            report.purged += 1;
          } else skip.add(row.recipient_id);
          continue;
        }
        const sealed = sealRecord(ring, record, aad);
        await client.query(
          `update travel_data_release set ciphertext = $2, nonce = $3, key_id = $4 where recipient_id = $1`,
          [row.recipient_id, sealed.ciphertext, sealed.nonce, sealed.keyId],
        );
        report.rotated += 1;
      }
      await client.query("commit");
    } catch (error) {
      await client.query("rollback");
      throw error;
    }
    if (rows.length < BATCH) break;
  }
  const after = await countsByKey(client);
  report.remainingOldKeys = Object.entries(after)
    .filter(([kid]) => kid !== ring.active.kid)
    .reduce((sum, [, n]) => sum + n, 0);
  return report;
}
