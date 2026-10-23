import { expect, test, type Page } from "@playwright/test";
import en from "../../messages/en.json" with { type: "json" };
import { expectNoSeriousAxeViolations } from "./helpers/axe";
import { openJoinForm, signUp } from "./helpers/auth";
import { addExpense, costRows, setPayInfo } from "./helpers/costs";
import {
  addAccountToTrip,
  addPlaceholder,
  makeOrganizer,
  placeholderToken,
  seedTrip,
  setFixedDates,
} from "./helpers/db";
import { uniqueEmail, waitForAccessMail } from "./helpers/mailpit";

// Increment 10 (F-036 «Salden & Ausgleich», features.md R.8 I10-04 – I10-08, W19 D.7 – D.10):
// marking (row stays, double booking refused), rights per side (CEO a), IBAN masked/shown,
// payment details, closing with open balances, leaving with a debt, placeholder lock and
// take-over. Accounts: en-GB; only visible elements and `expect.poll` (WebKit in CI).

test.use({ locale: "en-GB" });

const b = en.balances;
const c = en.costs;
const p = en.payInfo;
const fill = (text: string, values: Record<string, string | number>) =>
  Object.entries(values).reduce(
    (out, [key, value]) => out.replaceAll(`{${key}}`, String(value)),
    text,
  );
const plural = (text: string, count: number) =>
  text.replace(
    /\{(\w+), plural, one \{([^}]*)\} other \{([^}]*)\}\}/g,
    (_m, _k, one: string, other: string) =>
      (count === 1 ? one : other).replaceAll("#", String(count)),
  );
const hydrated = (page: Page) => page.waitForLoadState("networkidle");
const main = (page: Page) => page.locator("main");

/** Kai in Lena Berg's fixed trip with «Member 1»; Lena paid €60 for all three (€20 each). */
async function balanceTrip(
  page: Page,
  options: { role?: "member" | "organizer"; days?: [number, number] } = {},
) {
  const name = `Balances ${String(Date.now())}`;
  const trip = await seedTrip(name, { extraMembers: 1 });
  const email = await signUp(page, "Kai", uniqueEmail("kai"));
  await addAccountToTrip(trip.tripId, email, "Kai");
  if (options.role === "organizer") await makeOrganizer(trip.tripId, email);
  const [start, end] = options.days ?? [41, 48];
  await setFixedDates(trip.tripId, start, end);
  return { ...trip, email, name };
}

const lunch = (tripId: string) =>
  addExpense(tripId, {
    title: "Lunch",
    amount: 6000,
    payer: "Lena Berg",
    shares: { "Lena Berg": 2000, "Member 1": 2000, Kai: 2000 },
  });

test.describe("W19 D.7/D.8 – settling up", () => {
  test("mark as paid: the row stays with «Take back», balance square, «Already paid (1)»", async ({
    page,
  }) => {
    const trip = await balanceTrip(page);
    await lunch(trip.tripId);
    await setPayInfo(trip.tripId, "Lena Berg", "DE89370400440532013000", "PayPal: lena.demo");
    await page.goto(`/trips/${trip.publicId}/costs/balances`);
    await hydrated(page);
    await expect(page).toHaveTitle(new RegExp(fill(c.pageTitleBalances, { trip: trip.name })));
    await expect(
      main(page).getByText(fill(c.mine.owe, { amount: "€20.00" }), { exact: true }),
    ).toBeVisible();
    // Never «minimal» – the count sentence only.
    await expect(main(page).getByText(plural(b.count, 2))).toBeVisible();
    // Others' row: no button for an uninvolved member.
    await expect(
      main(page).getByText(fill(b.whoBoth, { a: "Member 1", b: "Lena Berg" })),
    ).toBeVisible();
    // IBAN masked by default; the full IBAN is not in the visible text.
    await expect(main(page).getByText(/DE89/).first()).toBeVisible();
    expect(await main(page).innerText()).not.toContain("0532 0130 00");
    await main(page)
      .getByRole("button", { name: fill(p.showName, { name: "Lena Berg" }) })
      .first()
      .click();
    await expect(main(page).getByText("0532").first()).toBeVisible();
    // «Anderer Weg» is plain text, never a link.
    await expect(main(page).getByText("PayPal: lena.demo").first()).toBeVisible();
    await expect(main(page).getByRole("link", { name: /lena\.demo/ })).toHaveCount(0);
    await expectNoSeriousAxeViolations(page, "balances");

    await main(page).getByRole("button", { name: b.markPaid }).click();
    const undo = main(page)
      .getByRole("button", { name: fill(b.undoPayName, { from: "You", to: "Lena Berg" }) })
      .first();
    await expect(undo).toBeVisible();
    await expect(undo).toBeFocused();
    await expect(main(page).getByText(c.mine.square, { exact: true })).toBeVisible();
    await expect(
      page.getByRole("status").getByText(/Marked as paid: You → Lena Berg, €20\.00\./),
    ).toBeVisible();
    await expect.poll(async () => (await costRows(trip.tripId)).settlements.length).toBe(1);
    // After the refresh the row is still at its place (W19-A recentlyPaid) …
    await expect(undo).toBeVisible();
    await expect(
      main(page).getByRole("button", { name: fill(b.done, { count: 1 }) }),
    ).toBeVisible();
    // … and after a reload it is only under «Already paid».
    await page.reload();
    await hydrated(page);
    await expect(main(page).getByRole("button", { name: b.markPaid })).toHaveCount(0);
    await main(page)
      .getByRole("button", { name: fill(b.done, { count: 1 }) })
      .click();
    await expect(main(page).getByText(/You → Lena Berg: €20\.00/)).toBeVisible();
  });

  test("double tap on two devices books once; the second sees «just changed»", async ({
    page,
    context,
  }) => {
    const trip = await balanceTrip(page);
    await lunch(trip.tripId);
    const second = await context.newPage();
    for (const view of [page, second]) {
      await view.goto(`/trips/${trip.publicId}/costs/balances`);
      await hydrated(view);
    }
    await page.locator("main").getByRole("button", { name: b.markPaid }).click();
    await expect.poll(async () => (await costRows(trip.tripId)).settlements.length).toBe(1);
    await second.locator("main").getByRole("button", { name: b.markPaid }).click();
    await expect(second.locator("main").getByRole("alert").getByText(c.changed)).toBeVisible();
    expect((await costRows(trip.tripId)).settlements).toHaveLength(1);
  });

  test("organiser: no button between two members with accounts; marks placeholder → former", async ({
    page,
  }) => {
    const trip = await balanceTrip(page, { role: "organizer" });
    await addPlaceholder(trip.tripId, "Mia");
    await lunch(trip.tripId);
    await addExpense(trip.tripId, {
      title: "Ferry",
      amount: 1000,
      payer: "former:1",
      by: "Kai",
      shares: { Mia: 1000 },
    });
    await page.goto(`/trips/${trip.publicId}/costs/balances`);
    await hydrated(page);
    // Member 1 → Lena Berg: only the two of them (CEO a).
    await expect(
      main(page).getByText(fill(b.whoBoth, { a: "Member 1", b: "Lena Berg" })),
    ).toBeVisible();
    // Mia (placeholder) → former member: the organiser marks.
    const row = main(page)
      .locator("[data-transfer]", { hasText: "Mia" })
      .filter({ hasText: /former member/i })
      .first();
    await row.getByRole("button", { name: b.markPaid }).click();
    await expect.poll(async () => (await costRows(trip.tripId)).settlements.length).toBe(1);
    await page.reload();
    await hydrated(page);
    await main(page)
      .getByRole("button", { name: fill(b.done, { count: 1 }) })
      .click();
    await expect(main(page).getByText(/marked by Kai \(organizer\)/)).toBeVisible();
  });

  test("close with open balances (warning) → read-only → reopen", async ({ page }) => {
    const trip = await balanceTrip(page, { role: "organizer" });
    await lunch(trip.tripId);
    await page.goto(`/trips/${trip.publicId}/costs/balances`);
    await hydrated(page);
    await main(page).getByRole("button", { name: en.closeCosts.action }).click();
    const dialog = page.getByRole("dialog", { name: en.closeCosts.title });
    await expect(dialog.getByText(plural(en.closeCosts.warning, 2))).toBeVisible();
    await dialog.getByRole("button", { name: en.closeCosts.confirmAnyway }).click();
    await expect(main(page).getByText(/closed the expenses on/)).toBeVisible();
    await expect.poll(async () => (await costRows(trip.tripId)).trip?.closed).toBe(true);
    await expect(main(page).getByRole("button", { name: b.markPaid })).toHaveCount(0);
    await main(page).getByRole("button", { name: c.closed.reopen }).click();
    await expect.poll(async () => (await costRows(trip.tripId)).trip?.closed).toBe(false);
    await expect(main(page).getByRole("button", { name: b.markPaid }).first()).toBeVisible();
  });
});

test.describe("W19 D.8.4 – payment details", () => {
  test("invalid IBAN is refused, a valid one is stored normalised and shown masked", async ({
    page,
  }) => {
    const trip = await balanceTrip(page);
    await lunch(trip.tripId);
    await page.goto(`/trips/${trip.publicId}/costs/balances`);
    await hydrated(page);
    await main(page).getByRole("button", { name: p.add }).click();
    const sheet = page.getByRole("dialog", { name: p.sheetTitle });
    await expect(sheet.getByText(p.visible)).toBeVisible();
    await sheet.getByLabel(p.iban).fill("DE89 3704 0044 0532 0130 01");
    await sheet.getByRole("button", { name: p.save }).click();
    await expect(sheet.getByText(p.error.iban)).toBeVisible();
    await sheet.getByLabel(p.iban).fill("de89 3704 0044 0532 0130 00");
    await sheet.getByLabel(p.note).fill("PayPal: kai.demo");
    await sheet.getByRole("button", { name: p.save }).click();
    await expect
      .poll(
        async () =>
          (await costRows(trip.tripId)).pay.find((m) => m.display_name === "Kai")?.payment_iban,
      )
      .toBe("DE89370400440532013000");
    await expect(main(page).getByText(fill(p.ibanMineSr, { last4: "3000" }))).toBeAttached();
    expect(await main(page).innerText()).not.toContain("0532 0130 00");
  });
});

test.describe("W19 D.10 – leaving, placeholders", () => {
  test("leaving with a debt warns; the party stays as «former member», payment details go", async ({
    page,
  }) => {
    const trip = await balanceTrip(page);
    await lunch(trip.tripId);
    await setPayInfo(trip.tripId, "Kai", null, "PayPal: kai");
    await page.goto(`/trips/${trip.publicId}`);
    await hydrated(page);
    await page.getByRole("button", { name: en.trip.menu }).click();
    await page.getByRole("button", { name: en.trip.menuItems.leave }).click();
    await expect(page.getByText(fill(en.costsLeave.owe, { amount: "€20.00" }))).toBeVisible();
    await expect(page.getByText(en.costsLeave.payInfo)).toBeVisible();
    await page.getByRole("button", { name: en.costsLeave.anyway }).click();
    await expect
      .poll(
        async () =>
          (await costRows(trip.tripId)).parties.filter((x) => x.former_no !== null).length,
      )
      .toBe(1);
    const rows = await costRows(trip.tripId);
    // The sum of all balances stays 0: the expense with its shares is untouched.
    expect(rows.shares.reduce((sum, s) => sum + s.share_cents, 0)).toBe(6000);
    expect(rows.pay.some((m) => m.display_name === "Kai")).toBe(false);
  });

  test("a placeholder in the costs cannot be deleted; joining via its link takes the balance over", async ({
    page,
    browser,
  }) => {
    const trip = await balanceTrip(page, { role: "organizer" });
    await addPlaceholder(trip.tripId, "Mia");
    await addExpense(trip.tripId, {
      title: "Tickets",
      amount: 3000,
      payer: "Kai",
      shares: { Kai: 1500, Mia: 1500 },
    });
    await page.goto(`/trips/${trip.publicId}/invite`);
    await hydrated(page);
    await page
      .getByRole("button", { name: fill(en.placeholders.actions, { name: "Mia" }) })
      .click();
    await page.getByRole("button", { name: en.placeholders.remove }).click();
    const dialog = page.getByRole("dialog", {
      name: fill(en.placeholders.blockedTitle, { name: "Mia" }),
    });
    await expect(
      dialog.getByText(/Mia is in one expense – remove them there first\./),
    ).toBeVisible();
    await expect(dialog.getByRole("link", { name: en.placeholders.blockedToCosts })).toBeVisible();

    const token = await placeholderToken(trip.publicId, "Mia");
    if (!token) throw new Error("no placeholder token");
    const context = await browser.newContext({ locale: "en-GB" });
    const guest = await context.newPage();
    await guest.goto(`/i/${token}`);
    await openJoinForm(guest);
    const email = uniqueEmail("mia");
    await guest.getByLabel(en.auth.emailLabel).fill(email);
    await guest.getByRole("button", { name: en.auth.sendCode }).click();
    const mail = await waitForAccessMail(email);
    await guest.getByLabel(en.auth.codeLabel).fill(mail.code);
    await guest.getByRole("button", { name: en.invite.confirmJoin }).click();
    await expect(guest).toHaveURL(new RegExp(`/trips/${trip.publicId}`));
    await guest.goto(`/trips/${trip.publicId}/costs/balances`);
    await hydrated(guest);
    await expect(
      guest.locator("main").getByText(fill(c.mine.owe, { amount: "€15.00" }), { exact: true }),
    ).toBeVisible();
    await context.close();
  });

  test("the organiser can delete a trip with expenses and settlements (cascade, F-013)", async ({
    page,
  }) => {
    const trip = await balanceTrip(page, { role: "organizer" });
    await addPlaceholder(trip.tripId, "Mia");
    await lunch(trip.tripId);
    await addExpense(trip.tripId, {
      title: "Ferry",
      amount: 1000,
      payer: "former:1",
      by: "Kai",
      shares: { Mia: 1000 },
    });
    await page.goto(`/trips/${trip.publicId}`);
    await hydrated(page);
    await page.getByRole("button", { name: en.trip.menu }).click();
    await page.getByRole("button", { name: en.trip.menuItems.delete }).click();
    await page.getByLabel(fill(en.trip.dialogs.deleteLabel, { trip: trip.name })).fill(trip.name);
    await page
      .getByRole("dialog")
      .getByRole("button", { name: en.trip.dialogs.deleteConfirm })
      .click();
    await expect(page).toHaveURL(/\/trips$/);
    await expect.poll(async () => (await costRows(trip.tripId)).expenses.length).toBe(0);
    expect((await costRows(trip.tripId)).parties).toHaveLength(0);
  });
});
