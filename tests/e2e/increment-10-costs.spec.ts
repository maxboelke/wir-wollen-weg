import { expect, test, type Page } from "@playwright/test";
import en from "../../messages/en.json" with { type: "json" };
import { expectNoSeriousAxeViolations } from "./helpers/axe";
import { signUp } from "./helpers/auth";
import { addExpense, bumpExpense, closeCosts, costRows } from "./helpers/costs";
import {
  addAccountToTrip,
  addPlaceholder,
  makeOrganizer,
  seedTrip,
  setAccountLocale,
  setFixedDates,
} from "./helpers/db";
import { uniqueEmail } from "./helpers/mailpit";

// Increment 10 (F-035 «Kosten teilen», features.md R.8, W19 D; texts W19 E since 11a): area,
// empty state, currency,
// the expense form (equal with rest cent, by amounts, «12,50» on EN), list and detail, delete
// with undo, conflicts, rights per row, closed costs, a11y / 320 px / 200 % / reduced motion.
// Accounts: en-GB. Only visible elements and `expect.poll` (WebKit/iPhone in CI).

test.use({ locale: "en-GB" });

const c = en.costs;
const cf = en.costForm;
const fill = (text: string, values: Record<string, string | number>) =>
  Object.entries(values).reduce(
    (out, [key, value]) => out.replaceAll(`{${key}}`, String(value)),
    text,
  );
const hydrated = (page: Page) => page.waitForLoadState("networkidle");

/** Kai (signed in) in Lena Berg's fixed trip (Vorbereitung) with «Member 1». */
async function costTrip(
  page: Page,
  options: { role?: "member" | "organizer"; extraMembers?: number } = {},
) {
  const name = `Costs ${String(Date.now())}`;
  const trip = await seedTrip(name, { extraMembers: options.extraMembers ?? 1 });
  const email = await signUp(page, "Kai", uniqueEmail("kai"));
  await addAccountToTrip(trip.tripId, email, "Kai");
  if (options.role === "organizer") await makeOrganizer(trip.tripId, email);
  await setFixedDates(trip.tripId, 41, 48);
  return { ...trip, email, name };
}

const main = (page: Page) => page.locator("main");

/** 200 % text: nothing in `main` reaches beyond 360 px (WCAG 1.4.10, I10-11). */
async function expectNothingSticksOut(page: Page) {
  await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
  // Nothing in the area sticks out (1.4.10) – the footer's language switch is out of scope.
  await expect
    .poll(() =>
      page.evaluate(() =>
        [...document.querySelectorAll("main *")]
          // The fixed action bar spans the layout viewport (widened by the footer).
          .filter(
            (element) =>
              element.getBoundingClientRect().right > 361 &&
              getComputedStyle(element).position !== "fixed",
          )
          .map((element) => `${element.tagName}.${element.className}: ${element.textContent}`),
      ),
    )
    .toEqual([]);
}

test.describe("W19 D – expenses", () => {
  test("empty → add equally with a rest cent → list, «Dein Stand», detail", async ({ page }) => {
    const trip = await costTrip(page);
    await page.goto(`/trips/${trip.publicId}/costs`);
    await hydrated(page);
    await expect(page).toHaveTitle(new RegExp(fill(c.pageTitle, { trip: trip.name })));
    await expect(main(page).getByRole("heading", { level: 2, name: c.empty.title })).toBeVisible();
    // Members cannot change the currency (organiser only).
    await expect(main(page).getByRole("button", { name: c.currency.changeName })).toHaveCount(0);
    await expectNoSeriousAxeViolations(page, "costs empty");

    await main(page).getByRole("link", { name: c.add }).click();
    await expect(page).toHaveURL(/\/costs\/new$/);
    await hydrated(page);
    const amount = page.getByLabel(cf.amount, { exact: false }).first();
    await expect(amount).toBeFocused();
    await amount.fill("10");
    await page.getByLabel(cf.what).fill("Snacks");
    // Lena Berg (seq 1) pays the extra cent (R.8 rule 3).
    await expect(main(page).getByText(/€3\.33 each – Lena Berg pays 1 cent more\./)).toBeVisible();
    await expectNoSeriousAxeViolations(page, "expense form");
    await page.getByRole("button", { name: cf.save }).click();

    await expect(page).toHaveURL(new RegExp(`/trips/${trip.publicId}/costs`));
    // W19 E.7: the snackbar names the new result.
    await expect(
      page.getByRole("status").getByText(fill(cf.savedOwed, { amount: "€6.67" })),
    ).toBeVisible();
    await expect(
      main(page).getByText(fill(c.mine.owed, { amount: "€6.67" }), { exact: true }),
    ).toBeVisible();
    const rows = await costRows(trip.tripId);
    expect(rows.expenses).toHaveLength(1);
    expect(rows.shares.map((s) => s.share_cents)).toEqual([334, 333, 333]);

    await main(page)
      .getByRole("button", { name: /^Snacks, €10\.00\./ })
      .click();
    const sheet = page.getByRole("dialog", { name: "Snacks" });
    await expect(sheet.getByText("€3.34")).toBeVisible();
    await expect(sheet.getByText(c.detail.equal, { exact: false })).toBeVisible();
    await expect(sheet.getByRole("link", { name: c.detail.edit })).toBeVisible();
  });

  test("by amounts: wrong sum is blocked, «12,50» on EN, then saved", async ({ page }) => {
    const trip = await costTrip(page);
    await addPlaceholder(trip.tripId, "Mia");
    await page.goto(`/trips/${trip.publicId}/costs/new`);
    await hydrated(page);
    await page.getByLabel(cf.amount, { exact: false }).first().fill("60");
    await page.getByLabel(cf.what).fill("Dinner");
    // Placeholders count by default (Q35).
    await expect(
      main(page).getByText(fill(cf.count, { count: 4, total: 4 }), { exact: true }),
    ).toBeVisible();
    await main(page).getByText(cf.custom, { exact: true }).click();
    await page.getByLabel(fill(cf.customFor, { name: "Lena Berg" })).fill("20");
    await page.getByLabel(fill(cf.customFor, { name: "You" })).fill("12,50");
    await expect(main(page).getByText(fill(cf.remain, { amount: "€27.50" }))).toBeVisible();
    await page.getByRole("button", { name: cf.save }).click();
    await expect(main(page).getByText(cf.error.splitSum).first()).toBeVisible();
    // Focus on the first amount field of the split (me first, W19 D.5.6).
    await expect(page.getByLabel(fill(cf.customFor, { name: "You" }))).toBeFocused();
    await page.getByLabel(fill(cf.customFor, { name: "Mia" })).fill("27.50");
    await expect(main(page).getByText(cf.ok)).toBeVisible();
    await page.getByRole("button", { name: cf.save }).click();
    await expect(page).toHaveURL(new RegExp(`/trips/${trip.publicId}/costs`));
    await expect
      .poll(async () => (await costRows(trip.tripId)).expenses[0]?.split_mode)
      .toBe("amounts");
    const rows = await costRows(trip.tripId);
    // Member 1 has no amount → not included.
    expect(rows.shares.map((s) => s.share_cents)).toEqual([2000, 1250, 2750]);
    // W19 E.3: no chip «by amounts» in the row any more – the row shows my part.
    await expect(main(page).getByText(fill(c.row.share, { amount: "€12.50" }))).toBeVisible();
  });

  test("delete without a dialog, undo restores it (soft delete)", async ({ page }) => {
    const trip = await costTrip(page);
    await addExpense(trip.tripId, {
      title: "Ice cream",
      amount: 900,
      payer: "Kai",
      shares: { "Lena Berg": 300, "Member 1": 300, Kai: 300 },
    });
    await page.goto(`/trips/${trip.publicId}/costs`);
    await hydrated(page);
    await main(page)
      .getByRole("button", { name: /^Ice cream, / })
      .click();
    await page
      .getByRole("dialog", { name: "Ice cream" })
      .getByRole("button", { name: c.detail.delete })
      .click();
    await expect(main(page).getByRole("button", { name: /^Ice cream, / })).toHaveCount(0);
    const toast = page
      .getByRole("status")
      .filter({ hasText: fill(c.deleted, { title: "Ice cream" }) });
    await expect(toast).toBeVisible();
    await expect.poll(async () => (await costRows(trip.tripId)).expenses[0]?.deleted).toBe(true);
    await toast.getByRole("button", { name: c.undo }).click();
    await expect(main(page).getByRole("button", { name: /^Ice cream, / })).toBeVisible();
    await expect.poll(async () => (await costRows(trip.tripId)).expenses[0]?.deleted).toBe(false);
  });

  test("edit conflict: someone changed it meanwhile → banner, «Save mine anyway»", async ({
    page,
  }) => {
    const trip = await costTrip(page);
    const id = await addExpense(trip.tripId, {
      title: "Taxi",
      amount: 3000,
      payer: "Kai",
      shares: { "Lena Berg": 1000, "Member 1": 1000, Kai: 1000 },
    });
    await page.goto(`/trips/${trip.publicId}/costs/${id}/edit`);
    await hydrated(page);
    await expect(page.getByLabel(cf.what)).toHaveValue("Taxi");
    await bumpExpense(id, "Taxi to the port");
    await page.getByLabel(cf.what).fill("Taxi (night)");
    await page.getByRole("button", { name: cf.saveEdit }).click();
    const banner = main(page)
      .getByRole("alert")
      .filter({ hasText: /just changed this expense/ });
    await expect(banner).toBeVisible();
    await expect(banner.getByText(/Taxi to the port/)).toBeVisible();
    // Nothing was overwritten silently.
    expect((await costRows(trip.tripId)).expenses[0]?.title).toBe("Taxi to the port");
    await banner.getByRole("button", { name: cf.conflict.mine }).click();
    await expect(page).toHaveURL(new RegExp(`/trips/${trip.publicId}/costs`));
    await expect
      .poll(async () => (await costRows(trip.tripId)).expenses[0]?.title)
      .toBe("Taxi (night)");
    expect((await costRows(trip.tripId)).expenses[0]?.version).toBe(3);
  });

  test("rights: members cannot edit others' expenses (no button, edit URL 404)", async ({
    page,
  }) => {
    const trip = await costTrip(page);
    const id = await addExpense(trip.tripId, {
      title: "Boat",
      amount: 6000,
      payer: "Member 1",
      by: "Member 1",
      shares: { "Lena Berg": 2000, "Member 1": 2000, Kai: 2000 },
    });
    await page.goto(`/trips/${trip.publicId}/costs`);
    await hydrated(page);
    await main(page)
      .getByRole("button", { name: /^Boat, / })
      .click();
    const sheet = page.getByRole("dialog", { name: "Boat" });
    await expect(sheet.getByText(fill(c.detail.who, { names: "Member 1" }))).toBeVisible();
    await expect(sheet.getByRole("link", { name: c.detail.edit })).toHaveCount(0);
    await expect(sheet.getByRole("button", { name: c.detail.delete })).toHaveCount(0);
    const response = await page.goto(`/trips/${trip.publicId}/costs/${id}/edit`);
    expect(response?.status()).toBe(404);
  });

  test("closed costs: read-only, /new redirects with a notice", async ({ page }) => {
    const trip = await costTrip(page);
    await addExpense(trip.tripId, {
      title: "Museum",
      amount: 2400,
      payer: "Kai",
      shares: { "Lena Berg": 800, "Member 1": 800, Kai: 800 },
    });
    await closeCosts(trip.tripId);
    await page.goto(`/trips/${trip.publicId}/costs`);
    await hydrated(page);
    await expect(main(page).getByText(/closed the expenses on/)).toBeVisible();
    await expect(main(page).getByRole("link", { name: c.add })).toHaveCount(0);
    await page.goto(`/trips/${trip.publicId}/costs/new`);
    await expect(page).toHaveURL(new RegExp(`/trips/${trip.publicId}/costs$`));
    await expect(page.getByRole("status").getByText(c.closed.redirect)).toBeVisible();
  });

  test("organiser changes the currency while there are no expenses", async ({ page }) => {
    const trip = await costTrip(page, { role: "organizer" });
    await page.goto(`/trips/${trip.publicId}/costs`);
    await hydrated(page);
    await main(page).getByRole("button", { name: c.currency.changeName }).click();
    const sheet = page.getByRole("dialog", { name: c.currency.title });
    await sheet.getByText(/British [Pp]ound \(GBP\)/).click();
    await sheet.getByRole("button", { name: c.currency.save }).click();
    await expect.poll(async () => (await costRows(trip.tripId)).trip?.currency).toBe("GBP");
    await expect(main(page).getByText(/Currency: British [Pp]ound \(GBP\)/)).toBeVisible();
    await addExpense(trip.tripId, {
      title: "Pub",
      amount: 1200,
      payer: "Kai",
      shares: { Kai: 1200 },
    });
    await page.reload();
    await hydrated(page);
    await expect(main(page).getByRole("button", { name: c.currency.changeName })).toHaveCount(0);
    await expect(main(page).getByText("£12.00").first()).toBeVisible();
  });

  test("non-members get the shared 404", async ({ page, browser }) => {
    const trip = await costTrip(page);
    const other = await browser.newContext({ locale: "en-GB" });
    const stranger = await other.newPage();
    await signUp(stranger, "Zoe", uniqueEmail("zoe"));
    const response = await stranger.goto(`/trips/${trip.publicId}/costs/balances`);
    expect(response?.status()).toBe(404);
    await other.close();
  });
});

test.describe("W19 D.14 – a11y, 320 px, 200 %, reduced motion", () => {
  test("no horizontal scrolling; nothing animates on load with reduced motion", async ({
    page,
  }) => {
    const trip = await costTrip(page);
    await addExpense(trip.tripId, {
      title: "A very long title for a shared dinner at the harbour",
      amount: 123456,
      payer: "Lena Berg",
      shares: { "Lena Berg": 41152, "Member 1": 41152, Kai: 41152 },
    });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 320, height: 640 });
    for (const path of ["costs", "costs/balances", "costs/new"]) {
      await page.goto(`/trips/${trip.publicId}/${path}`);
      await hydrated(page);
      await expect
        .poll(() =>
          page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
        )
        .toBe(true);
      expect(
        await page.evaluate(
          () => document.getAnimations().filter((a) => a.playState === "running").length,
        ),
      ).toBe(0);
    }
    await page.setViewportSize({ width: 360, height: 640 });
    // R-081: the list («your share …», «Dein Stand») too, not only balances and the form.
    for (const path of ["costs", "costs/balances", "costs/new"]) {
      await page.goto(`/trips/${trip.publicId}/${path}`);
      await hydrated(page);
      await expectNothingSticksOut(page);
    }
    await page.goto(`/trips/${trip.publicId}/costs/balances`);
    await hydrated(page);
    await expectNoSeriousAxeViolations(page, "balances 200 %");
  });

  test("R-081: German list at 360 px / 200 % – «auf dich …» and «Du zahlst … zurück» wrap", async ({
    page,
  }) => {
    const trip = await costTrip(page, { extraMembers: 2 });
    await addExpense(trip.tripId, {
      title: "Ferienhaus",
      amount: 184050,
      payer: "Lena Berg",
      shares: { "Lena Berg": 46013, "Member 1": 46013, "Member 2": 46012, Kai: 46012 },
    });
    await setAccountLocale(trip.email, "de");
    await page.setViewportSize({ width: 360, height: 640 });
    await page.goto(`/trips/${trip.publicId}/costs`);
    await hydrated(page);
    await expect(main(page).getByText(/auf dich 460,12\s€/)).toBeVisible();
    await expect(main(page).locator("[data-balance-sentence]")).toHaveText(
      /Du zahlst noch 460,12\s€ zurück\./,
    );
    await expectNothingSticksOut(page);
  });
});
