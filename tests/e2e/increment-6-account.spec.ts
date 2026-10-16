import { expect, test, type Page } from "@playwright/test";
import en from "../../messages/en.json" with { type: "json" };
import { signUp } from "./helpers/auth";
import {
  accountTraces,
  addAccountToTrip,
  addMemberWithDays,
  addTripMembers,
  addVoter,
  expireReauthentication,
  inactivityNoticeSent,
  isoDay,
  makeOrganizer,
  memberNames,
  organizerName,
  seedPoll,
  seedTrip,
  setAccountInactivity,
  setAvailability,
  setTripRetention,
  tripDayCount,
  tripExists,
  tripNoticeSent,
  tripRow,
  userIdOf,
} from "./helpers/db";
import { mailIds, uniqueEmail, waitForCodeMail } from "./helpers/mailpit";
import { createTripViaUi } from "./helpers/trips";

// Increment 6: F-043 delete the account (W13 /account/delete, Flow I.3) incl. the organiser
// rule (hand over or delete per trip), re-auth checked on the server, stale plans refused;
// own data export (Art. 15/20); retention job (F-013 trips, F-043 inactive accounts).
// Tests use `expect.poll` and only visible elements (also WebKit iPhone 15, 393 × 659).

test.use({ locale: "en-GB" });

const d = en.account.delete;
/** Same test-only token as playwright.config.ts (webServer env). */
const RETENTION_TOKEN = "e2e-only-retention-token-0123456789abcdef";

const hydrated = (page: Page) => page.waitForLoadState("networkidle");

async function confirmItsMe(page: Page, email: string) {
  const seen = await mailIds(email);
  await page.getByRole("button", { name: en.account.email.sendCode }).click();
  const mail = await waitForCodeMail(email, { seen, subject: /confirmation code/ });
  await page.getByLabel(en.auth.codeLabel).fill(mail.code);
  await expect(page.getByText(d.confirmedYou)).toBeVisible();
}

async function openFinalDialog(page: Page) {
  await page.getByRole("button", { name: d.submit }).click();
  const dialog = page.getByRole("dialog", { name: d.dialogTitle });
  await expect(dialog).toBeVisible();
  return dialog;
}

test.describe("delete the account (F-043)", () => {
  test("organiser decides per trip, a stale plan is refused, then everything is gone", async ({
    page,
  }) => {
    test.slow();
    const stamp = String(Date.now());
    const email = await signUp(page, "Kemal", uniqueEmail("kemal"));
    const userId = await userIdOf(email);

    // Organised trip with others: Lena Berg (joined first) and Member 1.
    const lisbon = await seedTrip(`Lisbon ${stamp}`, { extraMembers: 1 });
    await addAccountToTrip(lisbon.tripId, email, "Kemal");
    await makeOrganizer(lisbon.tripId, email);
    // Member of another trip with own days and a vote.
    const jga = await seedTrip(`Stag ${stamp}`);
    await addAccountToTrip(jga.tripId, email, "Kemal");
    await setAvailability(jga.tripId, email, { [isoDay(40)]: "no", [isoDay(41)]: "maybe" });
    // Two trips only Kemal is in.
    const soloA = await createTripViaUi(page, `Solo A ${stamp}`);
    const soloB = await createTripViaUi(page, `Solo B ${stamp}`);

    await page.goto("/account");
    await page.getByRole("link", { name: en.account.privacy.delete }).click();
    await expect(page).toHaveURL(/\/account\/delete$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(d.title);
    await hydrated(page);

    // Pre-selection: hand over to the longest member.
    const lisbonBlock = page.locator(`[data-trip="${lisbon.publicId}"]`);
    await expect(lisbonBlock).toContainText(`Lisbon ${stamp} (3 members)`);
    await expect(lisbonBlock.getByRole("radio", { name: d.transfer })).toBeChecked();
    const select = lisbonBlock.getByLabel(d.newOrga);
    await expect(select.locator("option:checked")).toHaveText(/^Lena Berg/);
    await expect(page.getByRole("listitem").filter({ hasText: `Solo A ${stamp}` })).toBeVisible();
    await expect(page.getByRole("listitem").filter({ hasText: `Solo B ${stamp}` })).toBeVisible();

    // Not before confirming it's you.
    const submit = page.getByRole("button", { name: d.submit });
    await expect(submit).toHaveAttribute("aria-disabled", "true");
    await submit.click({ force: true }); // aria-disabled: the click must not open the dialog
    await expect(page.getByRole("dialog", { name: d.dialogTitle })).toBeHidden();
    await confirmItsMe(page, email);
    await expect(submit).not.toHaveAttribute("aria-disabled", "true");

    await select.selectOption({ index: 1 }); // Member 1

    // Meanwhile somebody joins «Solo B» → the plan is outdated, nothing is deleted.
    const soloBRow = await tripRow(soloB);
    await addTripMembers(soloBRow?.id ?? "", 1);
    let dialog = await openFinalDialog(page);
    await expect(dialog.getByRole("button", { name: en.common.cancel })).toBeFocused();
    await dialog.getByRole("button", { name: d.dialogConfirm }).click();
    await expect(page.getByText(d.planOutdated)).toBeVisible();
    expect((await accountTraces(email, userId))?.users).toBe(1);
    expect(await tripExists(soloA)).toBe(true);

    // The page now asks for «Solo B» too – delete it for everybody.
    const soloBBlock = page.locator(`[data-trip="${soloB}"]`);
    await expect(soloBBlock).toBeVisible();
    await soloBBlock.getByRole("radio", { name: d.deleteTrip }).check();
    await expect(lisbonBlock.getByLabel(d.newOrga).locator("option:checked")).toHaveText(
      /^Member 1/,
    );
    const seen = await mailIds(email);
    dialog = await openFinalDialog(page);
    await dialog.getByRole("button", { name: d.dialogConfirm }).click();

    await expect(page).toHaveURL(/\/goodbye$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(en.goodbye.title);
    await expect(page.getByRole("link", { name: en.goodbye.home })).toHaveAttribute("href", "/en");

    // Everything personal is gone; the organiser role went to Member 1; solo trips deleted.
    expect(await accountTraces(email, userId)).toEqual({
      users: 0,
      sessions: 0,
      accounts: 0,
      codes: 0,
      memberships: 0,
      days: 0,
      votes: 0,
    });
    expect(await organizerName(lisbon.publicId)).toBe("Member 1");
    expect(await memberNames(lisbon.publicId)).not.toContain("Kemal");
    expect(await tripExists(soloA)).toBe(false);
    expect(await tripExists(soloB)).toBe(false);
    expect(await tripExists(jga.publicId)).toBe(true);
    expect(await tripDayCount(jga.tripId)).toBe(0);

    // Confirmation mail names the trips deleted for everybody.
    const mail = await waitForCodeMail(email, { seen, subject: /account has been deleted/ });
    expect(mail.text).toContain(`Solo A ${stamp}`);
    expect(mail.text).toContain(`Solo B ${stamp}`);

    // The old session is dead.
    await page.goto("/trips");
    await expect(page).toHaveURL(/\/login/);
  });

  test("a confirmation older than 10 minutes is refused by the server", async ({ page }) => {
    const email = await signUp(page, "Rosa", uniqueEmail("rosa"));
    await page.goto("/account/delete");
    await hydrated(page);
    await confirmItsMe(page, email);
    await expireReauthentication(email);
    const dialog = await openFinalDialog(page);
    await dialog.getByRole("button", { name: d.dialogConfirm }).click();
    await expect(page.getByText(en.account.email.reauthExpired)).toBeVisible();
    await expect(page.getByRole("button", { name: en.account.email.sendCode })).toBeVisible();
    expect((await accountTraces(email))?.users).toBe(1);
  });
});

test.describe("download my data (Art. 15/20)", () => {
  test("the export holds only the own data – no names, days or votes of others", async ({
    page,
    browser,
  }) => {
    const email = await signUp(page, "Kemal", uniqueEmail("export"));
    const trip = await seedTrip(`Export ${String(Date.now())}`, { organizer: "Lena Secret" });
    await addAccountToTrip(trip.tripId, email, "Kemal K.");
    await setAvailability(trip.tripId, email, { [isoDay(35)]: "no" });
    await addMemberWithDays(trip.tripId, "Zora Hidden", { no: [isoDay(36)], maybe: [isoDay(37)] });
    const options = await seedPoll(trip.tripId, [[isoDay(40), isoDay(44)]]);
    await addVoter(trip.tripId, "Uli Hidden", options, ["yes"]);

    await page.goto("/account");
    await expect(page.getByRole("link", { name: en.account.privacy.export })).toHaveAttribute(
      "href",
      "/account/export",
    );
    const response = await page.request.get("/account/export");
    expect(response.status()).toBe(200);
    expect(response.headers()["content-disposition"]).toMatch(
      /^attachment; filename="when-do-we-go-data-\d{4}-\d{2}-\d{2}\.json"$/,
    );
    expect(response.headers()["cache-control"]).toContain("no-store");
    const body = await response.text();
    const data = JSON.parse(body) as {
      account: { email: string; name: string };
      trips: { myNameInTrip: string; myDays: { day: string; state: string }[]; myRole: string }[];
    };
    expect(data.account).toMatchObject({ email, name: "Kemal" });
    expect(data.trips).toHaveLength(1);
    expect(data.trips[0]).toMatchObject({ myNameInTrip: "Kemal K.", myRole: "member" });
    expect(data.trips[0]?.myDays).toEqual([{ day: isoDay(35), state: "no" }]);
    for (const other of ["Lena Secret", "Zora Hidden", "Uli Hidden", isoDay(36), "seed-"]) {
      expect(body).not.toContain(other);
    }

    // Signed out: no data, back to the login.
    const stranger = await browser.newContext();
    const anonymous = await stranger.request.get("/account/export", { maxRedirects: 0 });
    expect(anonymous.status()).toBe(303);
    expect(anonymous.headers().location).toContain("/login");
    await stranger.close();
  });
});

test.describe("retention job (F-013, F-043)", () => {
  test("old trips: banner + notice 14 days before, deleted afterwards; job needs its token", async ({
    page,
    request,
  }) => {
    const denied = await request.post("/api/internal/retention", {
      headers: { authorization: "Bearer wrong-token-wrong-token-wrong-token-00" },
    });
    expect(denied.status()).toBe(404);
    const run = async () => {
      const response = await request.post("/api/internal/retention", {
        headers: { authorization: `Bearer ${RETENTION_TOKEN}` },
      });
      expect(response.status()).toBe(200);
    };

    const email = await signUp(page, "Kemal", uniqueEmail("retention"));
    const name = `Old trip ${String(Date.now())}`;
    const trip = await seedTrip(name);
    await addAccountToTrip(trip.tripId, email, "Kemal");
    await makeOrganizer(trip.tripId, email);
    // Other projects run the job in parallel – remember the mails BEFORE the trip is due.
    const seen = await mailIds(email);
    // Ended 88 days ago → due in 2 days → inside the 14-day notice window.
    await setTripRetention(trip.tripId, { fixedStart: isoDay(-95), fixedEnd: isoDay(-88) });

    await page.goto("/trips");
    await expect(
      page.getByText(/Will be deleted on .* \(90 days after the trip\)\./),
    ).toBeVisible();

    await run();
    await expect.poll(() => tripNoticeSent(trip.publicId)).toBe(true);
    const notice = await waitForCodeMail(email, { seen, subject: /will be deleted soon/ });
    expect(notice.text).toContain(name);
    expect(notice.text).toContain(`/trips/${trip.publicId}`);

    // Notice 15 days old and due → deleted on the next run.
    await setTripRetention(trip.tripId, {
      fixedStart: isoDay(-98),
      fixedEnd: isoDay(-91),
      noticeDaysAgo: 15,
    });
    await run();
    await expect.poll(() => tripExists(trip.publicId)).toBe(false);
  });

  test("inactive accounts: notice 30 days before, then deleted with the role handed over", async ({
    page,
    request,
  }) => {
    const run = () =>
      request.post("/api/internal/retention", {
        headers: { authorization: `Bearer ${RETENTION_TOKEN}` },
      });
    const email = await signUp(page, "Ines", uniqueEmail("inactive"));
    const trip = await seedTrip(`Inactive ${String(Date.now())}`, { extraMembers: 1 });
    await addAccountToTrip(trip.tripId, email, "Ines");
    await makeOrganizer(trip.tripId, email);
    await page.context().clearCookies(); // no more visits from this account

    // 23 months and 10 days without use → inside the 30-day window.
    const seen = await mailIds(email);
    await setAccountInactivity(email, { monthsAgo: 23, plusDays: 10 });
    expect((await run()).status()).toBe(200);
    await expect.poll(() => inactivityNoticeSent(email)).toBe(true);
    await waitForCodeMail(email, { seen, subject: /account will be deleted soon/ });

    // Notice 31 days old, 24 months over → deleted; Lena Berg (longest member) is Orga now.
    await setAccountInactivity(email, { monthsAgo: 24, plusDays: 2, noticeDaysAgo: 31 });
    expect((await run()).status()).toBe(200);
    await expect.poll(async () => (await accountTraces(email))?.users).toBe(0);
    expect(await organizerName(trip.publicId)).toBe("Lena Berg");
  });
});
