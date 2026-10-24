import { randomBytes, randomInt, randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { addDays, todayIso } from "@/lib/dates";
import { travelDeleteOn } from "@/lib/travel-data";
import { deleteAccount } from "../account-deletion";
import { travelReauthIdentifier } from "../auth/reauth";
import { dbPool } from "../db/client";
import { fixDates, unfixDates } from "../poll";
import { removeMember } from "../trips";
import { keyRingFrom, type KeyRing } from "./crypto";
import {
  addRecipients,
  bookerAccess,
  closeOwnRequest,
  createRequest,
  exportTravelData,
  loadTravelRaw,
  purgeTravelData,
  readOwnRelease,
  releaseAnswer,
  removeRecipient,
  setBooker,
  setDeclined,
  withdrawRelease,
} from "./db";

// Rights, lifecycle and access log of the travel details against PostgreSQL (features.md R.9:
// «Rechte» per row, I11-10 per deletion trigger incl. the retention-job safety net, I11-08
// re-authentication, I11-11 export, «Verschlüsselung» Nr. 5 – no values in logs).

process.env.BETTER_AUTH_SECRET ??= "db-test-secret-0123456789abcdef0123456789";
const RING: KeyRing = keyRingFrom({
  kind: "ring",
  keys: [{ kid: "t1", base64: randomBytes(32).toString("base64") }],
}) as KeyRing;

const today = todayIso();
const NAME = { givenNames: "Erika Maria", familyNames: "Musterfrau" };
const BIRTH = { birthDay: "12", birthMonth: "08", birthYear: "1990" };
const DOC = {
  ...NAME,
  ...BIRTH,
  documentType: "passport",
  documentNumber: "DEMO48151",
  expiryDay: "31",
  expiryMonth: "12",
  expiryYear: "2032",
  issuingCountry: "DE",
  nationality: "DE",
};

const q = (sql: string, params: unknown[] = []) => dbPool().query(sql, params);
const ALPHABET = "23456789abcdefghijkmnpqrstuvwxyz";
const publicId = () => Array.from({ length: 10 }, () => ALPHABET.charAt(randomInt(32))).join("");

interface Fixture {
  tripId: string;
  orga: string;
  booker: string;
  max: string;
  mia: string;
  placeholderId: string;
  placeholderToken: string;
  optionId: string;
}

async function user(name: string): Promise<string> {
  const row = await q(
    `insert into "user" (name, email, email_verified) values ($1, $2, true) returning id`,
    [name, `td-${randomBytes(6).toString("hex")}@example.org`],
  );
  return (row.rows[0] as { id: string }).id;
}

/** Fixed trip in 40–45 days: Lena (organiser, NOT «Bucht»), Sara («Bucht»), Max, Mia, Lotte (placeholder). */
async function fixture(start = 40, end = 45): Promise<Fixture> {
  const trip = await q(
    `insert into trip (public_id, name, range_start, range_end, min_nights, holiday_country, locale,
       invite_token, phase, fixed_start, fixed_end, fixed_at, booker_defaulted_at, last_fixed_range)
     values ($1, 'DB-Test', $2, $3, 3, 'DE', 'de', $4, 'fixed', $5, $6, now(), now(), $7)
     returning id`,
    [
      publicId(),
      addDays(today, start - 20),
      addDays(today, end + 20),
      randomBytes(32).toString("base64url"),
      addDays(today, start),
      addDays(today, end),
      `${addDays(today, start)}/${addDays(today, end)}`,
    ],
  );
  const tripId = (trip.rows[0] as { id: string }).id;
  const [orga, booker, max, mia] = await Promise.all([
    user("Lena"),
    user("Sara"),
    user("Max"),
    user("Mia"),
  ]);
  for (const [id, name, role, bookerSince] of [
    [orga, "Lena", "organizer", false],
    [booker, "Sara", "member", true],
    [max, "Max", "member", false],
    [mia, "Mia", "member", false],
  ] as const) {
    await q(
      `insert into trip_member (trip_id, user_id, display_name, role, booker_since)
       values ($1, $2, $3, $4, case when $5 then now() end)`,
      [tripId, id, name, role, bookerSince],
    );
  }
  const token = randomBytes(32).toString("base64url");
  const placeholder = await q(
    `insert into trip_placeholder (trip_id, display_name, invite_token) values ($1, 'Lotte', $2) returning id`,
    [tripId, token],
  );
  const option = await q(
    `insert into poll_option (trip_id, start_date, end_date) values ($1, $2, $3) returning id`,
    [tripId, addDays(today, start), addDays(today, end)],
  );
  return {
    tripId,
    orga,
    booker,
    max,
    mia,
    placeholderId: (placeholder.rows[0] as { id: string }).id,
    placeholderToken: token,
    optionId: (option.rows[0] as { id: string }).id,
  };
}

async function request(f: Fixture, fields = ["legal_name", "birth_date"], by = f.booker) {
  const result = await createRequest(f.tripId, by, {
    purpose: "Fähre Split – Hvar",
    fields: fields as never,
    recipients: { users: [f.max, f.mia], placeholders: [f.placeholderId] },
    idempotencyKey: null,
  });
  if (!result.ok) throw new Error(`request failed: ${result.error}`);
  return result.id;
}

async function release(
  f: Fixture,
  requestId: string,
  who = f.max,
  input: object = { ...NAME, ...BIRTH },
) {
  return releaseAnswer(
    f.tripId,
    who,
    requestId,
    input,
    { given: true, locale: "de" },
    { demo: true, ring: RING },
  );
}

const counts = async (requestId: string) => {
  const releases = await q(
    `select count(*)::int n from travel_data_release r join travel_data_recipient c on c.id = r.recipient_id where c.request_id = $1`,
    [requestId],
  );
  const access = await q(
    `select count(*)::int n from travel_data_access a join travel_data_recipient c on c.id = a.recipient_id where c.request_id = $1`,
    [requestId],
  );
  return {
    releases: (releases.rows[0] as { n: number }).n,
    access: (access.rows[0] as { n: number }).n,
  };
};

async function session(
  userId: string,
  reauth: "none" | "valid" | "expired" = "none",
): Promise<string> {
  const id = randomUUID();
  await q(
    `insert into session (id, token, user_id, expires_at, created_at, updated_at) values ($1, $2, $3, now() + interval '1 day', now(), now())`,
    [id, randomBytes(16).toString("hex"), userId],
  );
  if (reauth !== "none") {
    await q(
      `insert into verification (id, identifier, value, expires_at, created_at, updated_at)
       values ($1, $2, '1', now() + make_interval(hours => $3), now(), now())`,
      [randomUUID(), travelReauthIdentifier(id), reauth === "valid" ? 12 : -1],
    );
  }
  return id;
}

const logs: string[] = [];
beforeAll(() => {
  vi.spyOn(console, "info").mockImplementation((...args: unknown[]) => {
    logs.push(args.map(String).join(" "));
  });
});
afterAll(async () => {
  vi.restoreAllMocks();
  await dbPool().end();
});

describe("rights per row of R.9 «Rechte»", () => {
  it("marking «Bucht»: organiser only, max 3, placeholders and non-members never", async () => {
    const f = await fixture();
    expect(await setBooker(f.tripId, f.max, f.mia, true, false)).toEqual({
      ok: false,
      error: "notAllowed",
    });
    expect(await setBooker(f.tripId, f.booker, f.mia, true, false)).toEqual({
      ok: false,
      error: "notAllowed",
    });
    expect(await setBooker(f.tripId, f.orga, f.placeholderId, true, false)).toEqual({
      ok: false,
      error: "invalid",
    });
    expect((await setBooker(f.tripId, f.orga, f.orga, true, false)).ok).toBe(true);
    expect((await setBooker(f.tripId, f.orga, f.max, true, false)).ok).toBe(true);
    expect(await setBooker(f.tripId, f.orga, f.mia, true, false)).toEqual({
      ok: false,
      error: "max",
    });
  });

  it("only «Bucht» may ask; recipients must belong to THIS trip and not be the asker", async () => {
    const f = await fixture();
    const other = await fixture();
    const base = { purpose: "Flüge", fields: ["legal_name"] as never, idempotencyKey: null };
    expect(
      await createRequest(f.tripId, f.orga, {
        ...base,
        recipients: { users: [f.max], placeholders: [] },
      }),
    ).toEqual({
      ok: false,
      error: "notBooker",
    });
    expect(
      await createRequest(f.tripId, f.max, {
        ...base,
        recipients: { users: [f.mia], placeholders: [] },
      }),
    ).toEqual({
      ok: false,
      error: "notBooker",
    });
    expect(
      await createRequest(f.tripId, f.booker, {
        ...base,
        recipients: { users: [other.max], placeholders: [] },
      }),
    ).toEqual({ ok: false, error: "invalid" });
    expect(
      await createRequest(f.tripId, f.booker, {
        ...base,
        recipients: { users: [f.booker], placeholders: [] },
      }),
    ).toEqual({ ok: false, error: "invalid" });
    for (let i = 0; i < 3; i++) await request(f);
    expect(
      await createRequest(f.tripId, f.booker, {
        ...base,
        recipients: { users: [f.max], placeholders: [] },
      }),
    ).toEqual({ ok: false, error: "limit" });
  });

  it("idempotency key: the same form opening creates one request", async () => {
    const f = await fixture();
    const input = {
      purpose: "Flüge",
      fields: ["legal_name"] as never,
      recipients: { users: [f.max], placeholders: [] },
      idempotencyKey: "same-key-123",
    };
    const a = await createRequest(f.tripId, f.booker, input);
    const b = await createRequest(f.tripId, f.booker, input);
    expect(a.ok && b.ok && a.id === b.id).toBe(true);
  });

  it("organiser WITHOUT the marking never gets values – also with a foreign request id", async () => {
    const f = await fixture();
    const id = await request(f);
    expect((await release(f, id)).ok).toBe(true);
    const raw = await loadTravelRaw(f.tripId, f.orga);
    const recipient = raw.recipients.find((r) => r.userId === f.max)?.id ?? "";
    const sid = await session(f.orga, "valid");
    for (const access of [
      { mode: "mask" as const, requestId: id },
      { mode: "view" as const, requestId: id, recipientId: recipient },
      {
        mode: "copy" as const,
        requestId: id,
        recipientId: recipient,
        field: "given_name" as const,
      },
    ]) {
      expect(await bookerAccess(f.tripId, f.orga, sid, access, { ring: RING })).toEqual({
        ok: false,
        error: "notBooker",
      });
    }
    // Giving herself the marking does not open EXISTING requests (only new ones).
    await setBooker(f.tripId, f.orga, f.orga, true, false);
    expect(
      await bookerAccess(
        f.tripId,
        f.orga,
        sid,
        { mode: "view", requestId: id, recipientId: recipient },
        { ring: RING },
      ),
    ).toEqual({ ok: false, error: "notAllowed" });
    // Export: nothing about other people's values.
    const exported = JSON.stringify(
      await exportTravelData(f.tripId, f.orga, { reauthed: true, formerName: "x", deleteOn: null }),
    );
    expect(exported).not.toContain("Musterfrau");
  });

  it("a second «Bucht» person never sees the first one's request; members never see others' answers", async () => {
    const f = await fixture();
    const id = await request(f);
    await release(f, id);
    await setBooker(f.tripId, f.orga, f.mia, true, false);
    const sid = await session(f.mia, "valid");
    expect(
      (await bookerAccess(f.tripId, f.mia, sid, { mode: "mask", requestId: id }, { ring: RING }))
        .ok,
    ).toBe(false);
    expect(await readOwnRelease(f.tripId, f.mia, id, { ring: RING })).toBeNull();
    // Mia's export holds no values of Max.
    const exported = JSON.stringify(
      await exportTravelData(f.tripId, f.mia, { reauthed: true, formerName: "x", deleteOn: null }),
    );
    expect(exported).not.toContain("Erika");
  });

  it("the asking «Bucht» sees masks, «Anzeigen»/«Kopieren» write the access log (never values)", async () => {
    const f = await fixture();
    const id = await request(f);
    await release(f, id);
    const sid = await session(f.booker);
    const masked = await bookerAccess(
      f.tripId,
      f.booker,
      sid,
      { mode: "mask", requestId: id },
      { ring: RING },
    );
    expect(masked.ok && masked.mode === "mask" && JSON.stringify(masked.masks)).toContain("E•••");
    expect(JSON.stringify(masked)).not.toContain("Erika");
    expect(await counts(id)).toEqual({ releases: 1, access: 0 });
    const raw = await loadTravelRaw(f.tripId, f.booker);
    const recipient = raw.recipients.find((r) => r.userId === f.max)?.id ?? "";
    const view = await bookerAccess(
      f.tripId,
      f.booker,
      sid,
      { mode: "view", requestId: id, recipientId: recipient },
      { ring: RING },
    );
    expect(view).toMatchObject({
      ok: true,
      mode: "view",
      values: { given_name: "Erika Maria", birth_date: "1990-08-12" },
    });
    const copy = await bookerAccess(
      f.tripId,
      f.booker,
      sid,
      { mode: "copy", requestId: id, recipientId: recipient, field: "birth_date" },
      { ring: RING },
    );
    expect(copy).toEqual({ ok: true, mode: "copy", value: "1990-08-12" });
    const log = await q(
      `select action, field from travel_data_access where recipient_id = $1 order by at`,
      [recipient],
    );
    expect(log.rows).toEqual([
      { action: "view", field: null },
      { action: "copy", field: "birth_date" },
    ]);
    // Max sees the log about himself.
    const own = await loadTravelRaw(f.tripId, f.max);
    expect(own.myAccess).toHaveLength(2);
    // Mia (not affected) does not.
    expect((await loadTravelRaw(f.tripId, f.mia)).myAccess).toHaveLength(0);
  });

  it("re-authentication only for document numbers: none / expired → reauth; code within 12 h → ok", async () => {
    const f = await fixture();
    const plain = await request(f);
    await release(f, plain);
    const withDoc = await request(f, [
      "legal_name",
      "birth_date",
      "nationality",
      "document",
      "document_expiry",
      "issuing_country",
    ]);
    expect((await release(f, withDoc, f.max, DOC)).ok).toBe(true);
    const raw = await loadTravelRaw(f.tripId, f.booker);
    const recipientOf = (rid: string) =>
      raw.recipients.find((r) => r.requestId === rid && r.userId === f.max)?.id ?? "";
    const view = (sid: string, rid: string) =>
      bookerAccess(
        f.tripId,
        f.booker,
        sid,
        { mode: "view", requestId: rid, recipientId: recipientOf(rid) },
        { ring: RING },
      );
    const password = await session(f.booker, "none");
    expect((await view(password, plain)).ok).toBe(true);
    expect(await view(password, withDoc)).toEqual({ ok: false, error: "reauth" });
    expect(await view(await session(f.booker, "expired"), withDoc)).toEqual({
      ok: false,
      error: "reauth",
    });
    expect((await view(await session(f.booker, "valid"), withDoc)).ok).toBe(true);
    // Masks need no confirmation (no content).
    expect(
      (
        await bookerAccess(
          f.tripId,
          f.booker,
          password,
          { mode: "mask", requestId: withDoc },
          { ring: RING },
        )
      ).ok,
    ).toBe(true);
  });

  it("consent is required on the server; tampered fields are dropped; DEMO prefix in demo", async () => {
    const f = await fixture();
    const id = await request(f, ["legal_name", "birth_date", "document"]);
    const noConsent = await releaseAnswer(
      f.tripId,
      f.max,
      id,
      { ...DOC },
      { given: false, locale: "de" },
      { demo: true, ring: RING },
    );
    expect(noConsent).toEqual({ ok: false, error: "consent" });
    expect((await counts(id)).releases).toBe(0);
    const real = await releaseAnswer(
      f.tripId,
      f.max,
      id,
      { ...DOC, documentNumber: "C01X4F7R7" },
      { given: true, locale: "de" },
      { demo: true, ring: RING },
    );
    expect(real).toMatchObject({
      ok: false,
      error: "values",
      errors: { documentNumber: "documentDemo" },
    });
    expect(
      (
        await releaseAnswer(
          f.tripId,
          f.max,
          id,
          DOC,
          { given: true, locale: "en" },
          { demo: true, ring: RING },
        )
      ).ok,
    ).toBe(true);
    const values = await readOwnRelease(f.tripId, f.max, id, { ring: RING });
    expect(values).not.toHaveProperty("nationality");
    expect(values).not.toHaveProperty("issuingCountry");
    const proof = await q(
      `select consent_version, consent_locale, key_id from travel_data_release r join travel_data_recipient c on c.id = r.recipient_id where c.request_id = $1`,
      [id],
    );
    expect(proof.rows[0]).toEqual({ consent_version: 1, consent_locale: "en", key_id: "t1" });
    // Values are never stored in plain text.
    const bytes = await q(`select encode(ciphertext, 'escape') c from travel_data_release`);
    expect(JSON.stringify(bytes.rows)).not.toContain("DEMO48151");
  });

  it("decline and «Doch freigeben»: only the state is stored", async () => {
    const f = await fixture();
    const id = await request(f);
    expect((await setDeclined(f.tripId, f.max, id, true)).ok).toBe(true);
    expect(
      (await loadTravelRaw(f.tripId, f.max)).recipients.find((r) => r.userId === f.max)?.state,
    ).toBe("declined");
    expect((await setDeclined(f.tripId, f.max, id, false)).ok).toBe(true);
    expect((await release(f, id)).ok).toBe(true);
  });

  it("a member cannot answer for someone else or for a foreign trip's request", async () => {
    const f = await fixture();
    const other = await fixture();
    const id = await request(other);
    expect(await release(f, id)).toEqual({ ok: false, error: "notAllowed" });
    expect(
      await releaseAnswer(
        other.tripId,
        f.max,
        id,
        { ...NAME, ...BIRTH },
        { given: true, locale: "de" },
        { demo: true, ring: RING },
      ),
    ).toEqual({
      ok: false,
      error: "notAllowed",
    });
  });
});

describe("deletion per trigger of R.9 I11-10 (hard: values + access log)", () => {
  async function withLog(f: Fixture) {
    const id = await request(f);
    await release(f, id);
    await release(f, id, f.mia);
    const sid = await session(f.booker);
    const raw = await loadTravelRaw(f.tripId, f.booker);
    for (const r of raw.recipients.filter((x) => x.userId)) {
      await bookerAccess(
        f.tripId,
        f.booker,
        sid,
        { mode: "view", requestId: id, recipientId: r.id },
        { ring: RING },
      );
    }
    expect(await counts(id)).toEqual({ releases: 2, access: 2 });
    return id;
  }

  it("withdrawal by the person: their release and log go, the answer is open again", async () => {
    const f = await fixture();
    const id = await withLog(f);
    expect((await withdrawRelease(f.tripId, f.max, id)).ok).toBe(true);
    expect(await counts(id)).toEqual({ releases: 1, access: 1 });
    expect(
      (await loadTravelRaw(f.tripId, f.max)).recipients.find((r) => r.userId === f.max)?.state,
    ).toBe("open");
  });

  it("removed as recipient: release goes", async () => {
    const f = await fixture();
    const id = await withLog(f);
    const recipient =
      (await loadTravelRaw(f.tripId, f.booker)).recipients.find((r) => r.userId === f.max)?.id ??
      "";
    expect((await removeRecipient(f.tripId, f.booker, id, recipient)).ok).toBe(true);
    expect(await counts(id)).toEqual({ releases: 1, access: 1 });
  });

  it("«Erledigt – Daten löschen»: everything of the request goes, answers «erloschen»", async () => {
    const f = await fixture();
    const id = await withLog(f);
    expect(await closeOwnRequest(f.tripId, f.max, id)).toEqual({ ok: false, error: "notAllowed" });
    expect((await closeOwnRequest(f.tripId, f.booker, id)).ok).toBe(true);
    expect(await counts(id)).toEqual({ releases: 0, access: 0 });
    expect(
      (await loadTravelRaw(f.tripId, f.max)).recipients.find((r) => r.userId === f.max)?.state,
    ).toBe("expired");
  });

  it("marking taken away: confirmation first, then all releases go", async () => {
    const f = await fixture();
    const id = await withLog(f);
    expect(await setBooker(f.tripId, f.orga, f.booker, false, false)).toEqual({
      ok: false,
      error: "confirm",
      requests: 1,
      released: 2,
    });
    expect(await counts(id)).toEqual({ releases: 2, access: 2 });
    expect(await setBooker(f.tripId, f.orga, f.booker, false, true)).toEqual({
      ok: true,
      deleted: 2,
    });
    expect(await counts(id)).toEqual({ releases: 0, access: 0 });
  });

  it("asking person leaves / is removed: requests close, releases go", async () => {
    const f = await fixture();
    const id = await withLog(f);
    expect(await removeMember(f.tripId, f.booker)).toBe(true);
    expect(await counts(id)).toEqual({ releases: 0, access: 0 });
    const raw = await loadTravelRaw(f.tripId, f.max);
    expect(raw.requests.find((r) => r.id === id)?.closedReason).toBe("requester_left");
  });

  it("asked person leaves: their answers and releases in this trip go (cascade)", async () => {
    const f = await fixture();
    const id = await withLog(f);
    expect(await removeMember(f.tripId, f.max)).toBe(true);
    expect(await counts(id)).toEqual({ releases: 1, access: 1 });
  });

  it("account deletion of the asked person and of the asking person", async () => {
    const f = await fixture();
    const id = await withLog(f);
    expect((await deleteAccount(f.mia, "auto")).ok).toBe(true);
    expect(await counts(id)).toEqual({ releases: 1, access: 1 });
    expect((await deleteAccount(f.booker, "auto")).ok).toBe(true);
    expect(await counts(id)).toEqual({ releases: 0, access: 0 });
  });

  it("deletion date reached: the read path returns nothing at once, the job deletes", async () => {
    const f = await fixture();
    const id = await withLog(f);
    const fixedEnd = addDays(today, 45);
    const after = addDays(travelDeleteOn(fixedEnd), 1);
    expect(
      await readOwnRelease(f.tripId, f.max, id, { ring: RING, today: travelDeleteOn(fixedEnd) }),
    ).not.toBeNull();
    expect(await readOwnRelease(f.tripId, f.max, id, { ring: RING, today: after })).toBeNull();
    const sid = await session(f.booker);
    expect(
      await bookerAccess(
        f.tripId,
        f.booker,
        sid,
        { mode: "mask", requestId: id },
        { ring: RING, today: after },
      ),
    ).toEqual({
      ok: false,
      error: "expired",
    });
    // Job on the day after the deletion date (end of that day in the app time zone).
    await purgeTravelData(new Date(`${after}T12:00:00Z`));
    expect(await counts(id)).toEqual({ releases: 0, access: 0 });
    const raw = await loadTravelRaw(f.tripId, f.max);
    expect(raw.requests.find((r) => r.id === id)?.closedReason).toBe("expired");
  });

  it("dates unfixed for 30 days: the job deletes; before that nothing happens", async () => {
    const f = await fixture();
    const id = await withLog(f);
    await unfixDates(f.tripId);
    await purgeTravelData(new Date(Date.now() + 29 * 86_400_000));
    expect((await counts(id)).releases).toBe(2);
    await purgeTravelData(new Date(Date.now() + 31 * 86_400_000));
    expect(await counts(id)).toEqual({ releases: 0, access: 0 });
  });

  it("safety net: releases of a request whose asker lost the marking without the app path", async () => {
    const f = await fixture();
    const id = await withLog(f);
    await q(`update trip_member set booker_since = null where trip_id = $1 and user_id = $2`, [
      f.tripId,
      f.booker,
    ]);
    // Read path: no values without an active marking …
    const sid = await session(f.booker);
    expect(
      (await bookerAccess(f.tripId, f.booker, sid, { mode: "mask", requestId: id }, { ring: RING }))
        .ok,
    ).toBe(false);
    // … and the job removes them.
    await purgeTravelData();
    expect(await counts(id)).toEqual({ releases: 0, access: 0 });
  });

  it("trip deleted: everything cascades", async () => {
    const f = await fixture();
    const id = await withLog(f);
    await q(`delete from trip where id = $1`, [f.tripId]);
    expect(await counts(id)).toEqual({ releases: 0, access: 0 });
  });
});

describe("dates fixed anew (R.9 I11-10) and placeholders (I11-09)", () => {
  it("new range: releases stay, deletion date moves, notice flag set; default marking only once", async () => {
    const f = await fixture();
    const id = await withLogLite(f);
    const moved = await q(
      `insert into poll_option (trip_id, start_date, end_date) values ($1, $2, $3) returning id`,
      [f.tripId, addDays(today, 50), addDays(today, 55)],
    );
    await unfixDates(f.tripId);
    expect((await fixDates(f.tripId, (moved.rows[0] as { id: string }).id)).ok).toBe(true);
    expect((await counts(id)).releases).toBe(1);
    const row = await q(
      `select travel_dates_changed_at is not null changed from trip where id = $1`,
      [f.tripId],
    );
    expect(row.rows[0]).toEqual({ changed: true });
    // booker_defaulted_at was set in the fixture → Lena does not get the marking automatically.
    const lena = await q(
      `select booker_since from trip_member where trip_id = $1 and user_id = $2`,
      [f.tripId, f.orga],
    );
    expect(lena.rows[0]).toEqual({ booker_since: null });
  });

  it("first fixing gives the organiser the marking", async () => {
    const f = await fixture();
    await q(
      `update trip set booker_defaulted_at = null, phase = 'voting', fixed_start = null, fixed_end = null where id = $1`,
      [f.tripId],
    );
    expect((await fixDates(f.tripId, f.optionId)).ok).toBe(true);
    const lena = await q(
      `select booker_since is not null marked from trip_member where trip_id = $1 and user_id = $2`,
      [f.tripId, f.orga],
    );
    expect(lena.rows[0]).toEqual({ marked: true });
  });

  it("additional recipients see the request; placeholders count after joining", async () => {
    const f = await fixture();
    const id = await createRequest(f.tripId, f.booker, {
      purpose: "Bahn",
      fields: ["legal_name"] as never,
      recipients: { users: [f.max], placeholders: [] },
      idempotencyKey: null,
    });
    if (!id.ok) throw new Error("request");
    expect(
      (
        await addRecipients(f.tripId, f.booker, id.id, {
          users: [f.mia],
          placeholders: [f.placeholderId],
        })
      ).ok,
    ).toBe(true);
    expect(
      (await addRecipients(f.tripId, f.max, id.id, { users: [f.orga], placeholders: [] })).ok,
    ).toBe(false);
    const raw = await loadTravelRaw(f.tripId, f.mia);
    expect(raw.recipients.filter((r) => r.requestId === id.id)).toHaveLength(3);
  });
});

async function withLogLite(f: Fixture) {
  const id = await request(f);
  await release(f, id);
  return id;
}

describe("export (R.9 I11-11) and logs (Verschlüsselung Nr. 5)", () => {
  it("own values in plain text, document number only after a code confirmation", async () => {
    const f = await fixture();
    const id = await request(f, ["legal_name", "birth_date", "document"]);
    const ring = (await import("./crypto")).currentKeyRing();
    expect(ring).not.toBeNull();
    expect(
      (await releaseAnswer(f.tripId, f.max, id, DOC, { given: true, locale: "de" }, { demo: true }))
        .ok,
    ).toBe(true);
    const without = await exportTravelData(f.tripId, f.max, {
      reauthed: false,
      formerName: "x",
      deleteOn: "2030-01-01",
    });
    expect(without?.myReleases[0]?.values?.familyNames).toBe("Musterfrau");
    expect(without?.myReleases[0]?.documentNumberWithheld).toBe(true);
    expect(JSON.stringify(without)).not.toContain("DEMO48151");
    const withCode = await exportTravelData(f.tripId, f.max, {
      reauthed: true,
      formerName: "x",
      deleteOn: null,
    });
    expect(withCode?.myReleases[0]?.values?.documentNumber).toBe("DEMO48151");
    // «Bucht» export: counts only.
    const booker = await exportTravelData(f.tripId, f.booker, {
      reauthed: true,
      formerName: "x",
      deleteOn: null,
    });
    expect(booker?.myRequests[0]?.answers).toEqual({ open: 1, shared: 1, sortingItOutDirectly: 0 });
    expect(JSON.stringify(booker)).not.toContain("Musterfrau");
  });

  it("no value of the whole run appears in the operating logs", () => {
    const text = logs.join("\n");
    expect(logs.length).toBeGreaterThan(0);
    for (const value of ["Erika", "Musterfrau", "DEMO48151", "1990-08-12", "C01X4F7R7"]) {
      expect(text).not.toContain(value);
    }
  });
});

describe("key rotation (deployment.md §0.11.6)", () => {
  it("two key ids → one; values stay readable; idempotent; unreadable rows are purged on request", async () => {
    const { rotateTravelKeys } = await import("./rotate");
    const old = keyRingFrom({
      kind: "ring",
      keys: [{ kid: "t-old", base64: randomBytes(32).toString("base64") }],
    }) as KeyRing;
    const f = await fixture();
    const id = await request(f);
    await releaseAnswer(
      f.tripId,
      f.max,
      id,
      { ...NAME, ...BIRTH },
      { given: true, locale: "de" },
      { demo: true, ring: old },
    );
    await releaseAnswer(
      f.tripId,
      f.mia,
      id,
      { ...NAME, ...BIRTH },
      { given: true, locale: "de" },
      { demo: true, ring: RING },
    );
    const both = keyRingFrom({
      kind: "ring",
      keys: [
        { kid: "t-new", base64: randomBytes(32).toString("base64") },
        { kid: "t-old", base64: old.byId.get("t-old")?.toString("base64") ?? "" },
        { kid: "t1", base64: RING.byId.get("t1")?.toString("base64") ?? "" },
      ],
    }) as KeyRing;
    // A dedicated connection: the rotation runs its own transactions.
    const pg = await dbPool().connect();
    try {
      const dry = await rotateTravelKeys(pg, both, { dryRun: true });
      expect(dry.rotated).toBe(0);
      const first = await rotateTravelKeys(pg, both);
      expect(first.rotated).toBeGreaterThanOrEqual(2);
      // Other rows of the shared database may use keys outside this ring – only ours count here.
      const kids = await q(
        `select distinct r.key_id from travel_data_release r join travel_data_recipient c on c.id = r.recipient_id where c.request_id = $1`,
        [id],
      );
      expect(kids.rows).toEqual([{ key_id: "t-new" }]);
      expect((await rotateTravelKeys(pg, both)).rotated).toBe(0);
      expect(await readOwnRelease(f.tripId, f.max, id, { ring: both })).toMatchObject({
        familyNames: "Musterfrau",
      });
      // Lost key (Runbook A): a ring without the active key cannot read – purge resets the answers.
      const lost = keyRingFrom({
        kind: "ring",
        keys: [{ kid: "t-x", base64: randomBytes(32).toString("base64") }],
      }) as KeyRing;
      const purge = await rotateTravelKeys(pg, lost, { purgeUnreadable: true });
      expect(purge.purged).toBeGreaterThanOrEqual(2);
      expect(await counts(id)).toEqual({ releases: 0, access: 0 });
    } finally {
      pg.release();
    }
  });
});
