import { expect, test, type Page } from "@playwright/test";
import de from "../../messages/de.json" with { type: "json" };
import en from "../../messages/en.json" with { type: "json" };
import { expectNoSeriousAxeViolations } from "./helpers/axe";
import { signUp } from "./helpers/auth";
import { addExpense } from "./helpers/costs";
import {
  addAccountToTrip,
  seedTrip,
  setAccountCountry,
  setAccountLocale,
  setFixedDates,
} from "./helpers/db";
import { mailIds, uniqueEmail, waitForCodeMail } from "./helpers/mailpit";

// Increment 11a: costs v2 (W19 E – «Dein Stand» as one sentence + «So rechnen wir», the group
// list, «Ausgleichen» on its own page, glossary), the cost shortcut bar in the cockpit (W16 v2.17
// «Fassung 2» – hides once the tile «Kosten» is visible), the app start opening the running trip
// (W16 v2.18 – only `/`, from the arrival day, `/trips` never redirects, deep links first), one
// money formatter in the app language (W19 E.0 #7) and M-P4 («alle können» green in light mode).
// Accounts: en-GB unless stated; only visible elements and `expect.poll` (WebKit in CI).

test.use({ locale: "en-GB" });

const fill = (text: string, values: Record<string, string | number>) =>
  Object.entries(values).reduce(
    (out, [key, value]) => out.replaceAll(`{${key}}`, String(value)),
    text,
  );
const hydrated = (page: Page) => page.waitForLoadState("networkidle");
const main = (page: Page) => page.locator("main");
const isMobile = (page: Page) => (page.viewportSize()?.width ?? 1280) < 960;

/** Kai in Lena Berg's fixed trip with «Member 1»; dates as day offsets from today. */
async function trip(page: Page, days: [number, number], email = uniqueEmail("kai")) {
  const name = `Run ${String(Date.now())}-${String(Math.random()).slice(2, 6)}`;
  const seeded = await seedTrip(name, { extraMembers: 1 });
  await addAccountToTrip(seeded.tripId, email, "Kai");
  await setFixedDates(seeded.tripId, days[0], days[1]);
  return { ...seeded, name, email };
}

/** Lena paid 60 for all three (20 each) and Kai 150 for all three (50 each). */
async function twoExpenses(tripId: string) {
  await addExpense(tripId, {
    title: "Lunch",
    amount: 6000,
    payer: "Lena Berg",
    shares: { "Lena Berg": 2000, "Member 1": 2000, Kai: 2000 },
  });
  await addExpense(tripId, {
    title: "Boat",
    amount: 15000,
    payer: "Kai",
    shares: { "Lena Berg": 5000, "Member 1": 5000, Kai: 5000 },
  });
}

test.describe("W16 v2.18 – the app opens the running trip", () => {
  test("`/` opens the one running trip once with a hint; `/trips` never redirects", async ({
    page,
  }) => {
    const email = await signUp(page, "Kai", uniqueEmail("kai"));
    const running = await trip(page, [0, 5], email);
    await page.goto("/");
    await expect(page).toHaveURL(new RegExp(`/trips/${running.publicId}$`));
    await hydrated(page);
    const hint = page.getByRole("status").filter({ hasText: en.start.hint });
    await expect(hint).toBeVisible();
    await expect(hint.getByRole("button", { name: en.start.action })).toBeVisible();
    // ← is «My trips» and leads to /trips.
    await expect(page.getByRole("link", { name: en.trip.back })).toHaveAttribute("href", "/trips");
    // Second start: straight in, no hint any more.
    await page.goto("/");
    await expect(page).toHaveURL(new RegExp(`/trips/${running.publicId}$`));
    await hydrated(page);
    await expect(page.getByRole("status").filter({ hasText: en.start.hint })).toHaveCount(0);
    // «Meine Reisen» stays reachable.
    await page.goto("/trips");
    await hydrated(page);
    await expect(page).toHaveURL(/\/trips$/);
    await expect(page.getByRole("heading", { level: 1, name: en.trips.title })).toBeVisible();
  });

  test("the day before and the days after do not count; two running trips → «Happening now»", async ({
    page,
  }) => {
    const email = await signUp(page, "Kai", uniqueEmail("kai"));
    const tomorrow = await trip(page, [1, 6], email);
    await trip(page, [-8, -1], email);
    await page.goto("/");
    await expect(page).toHaveURL(/\/trips$/);
    await expect(page.getByRole("heading", { name: en.trips.runningNow })).toHaveCount(0);

    const first = await trip(page, [-2, 5], email);
    const second = await trip(page, [0, 1], email);
    await page.goto("/");
    await expect(page).toHaveURL(/\/trips$/);
    await hydrated(page);
    const now = page.getByRole("region", { name: en.trips.runningNow });
    await expect(now).toBeVisible();
    await expect(now.locator("[data-running-now]")).toHaveCount(2);
    await expect(now.getByRole("link", { name: new RegExp(first.name) })).toContainText(
      fill(en.trips.runningDay, { day: 3, total: 8 }),
    );
    await expect(now.getByRole("link", { name: new RegExp(second.name) })).toBeVisible();
    await expect(now.getByRole("link", { name: new RegExp(tomorrow.name) })).toHaveCount(0);
  });

  test("login without `next` → running trip; deep links (`next`) win", async ({ browser }) => {
    const context = await browser.newContext({ locale: "en-GB" });
    const page = await context.newPage();
    const email = await signUp(page, "Kai", uniqueEmail("kai"));
    const running = await trip(page, [0, 3], email);
    await context.clearCookies();

    const signIn = async (path: string) => {
      const seen = await mailIds(email);
      await page.goto(path);
      await page.getByLabel(en.auth.emailLabel).fill(email);
      await page.getByRole("button", { name: en.auth.sendCode }).click();
      const mail = await waitForCodeMail(email, { seen });
      await page.getByLabel(en.auth.codeLabel).fill(mail.code);
    };
    await signIn("/login");
    // A full page load after the code (fresh root layout) – allow for it.
    await expect(page).toHaveURL(new RegExp(`/trips/${running.publicId}$`), { timeout: 15_000 });
    await context.clearCookies();
    await signIn(`/login?next=${encodeURIComponent(`/trips/${running.publicId}/costs`)}`);
    await expect(page).toHaveURL(new RegExp(`/trips/${running.publicId}/costs$`), {
      timeout: 15_000,
    });
    await context.close();
  });
});

test.describe("W16 v2.17 – cost shortcut bar (Fassung 2)", () => {
  test("phone: bar under the thumb, hides once the tile «Expenses» shows, back when scrolling up", async ({
    page,
  }) => {
    test.skip(!isMobile(page), "fixed bar only below 960 px");
    const email = await signUp(page, "Kai", uniqueEmail("kai"));
    const t = await trip(page, [-2, 5], email);
    await twoExpenses(t.tripId);
    await page.setViewportSize({ width: 390, height: 700 });
    await page.goto(`/trips/${t.publicId}`);
    await hydrated(page);
    const dock = page.locator("[data-cost-dock]");
    await expect(dock).toHaveAttribute("data-cost-dock", "shown");
    expect(await dock.evaluate((el) => getComputedStyle(el).position)).toBe("fixed");
    // Left half = its own target to all expenses; the button names the action.
    const costs = dock.getByRole("link", {
      name: fill(en.route.dock.name, { status: "You get €80.00 back" }),
    });
    await expect(costs).toBeVisible();
    await expect(dock.getByRole("link", { name: en.route.dock.addName })).toBeVisible();
    await expect(page.getByRole("complementary", { name: en.route.dock.label })).toBeVisible();
    await expectNoSeriousAxeViolations(page, "cockpit with cost bar");

    // Scroll the tile «Expenses» into view → the bar slides away (inert, not focusable).
    const tile = main(page).locator('[data-return-key="tile:costs"]');
    await expect(tile).toContainText(en.route.tiles.costsAll);
    await tile.scrollIntoViewIfNeeded();
    await page.evaluate(() => {
      window.scrollBy(0, 200);
    });
    await expect(dock).toHaveAttribute("data-cost-dock", "hidden");
    await expect(dock).toHaveAttribute("inert", "");
    await expect(dock).toBeHidden();
    // Scroll back up → the bar is there again.
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await expect(dock).toHaveAttribute("data-cost-dock", "shown");
    await expect(dock).toBeVisible();

    // Focus protection: while the keyboard focus is in the bar, it never hides.
    await dock.getByRole("link", { name: en.route.dock.addName }).focus();
    await page.evaluate(() => {
      window.scrollTo(0, document.documentElement.scrollHeight);
    });
    await page.waitForTimeout(300);
    await expect(dock).toHaveAttribute("data-cost-dock", "shown");
    await page.evaluate(() => {
      (document.activeElement as HTMLElement | null)?.blur();
    });
    await expect(dock).toHaveAttribute("data-cost-dock", "hidden");

    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await expect(dock).toHaveAttribute("data-cost-dock", "shown");
    await costs.click();
    await expect(page).toHaveURL(new RegExp(`/trips/${t.publicId}/costs$`));
  });

  test("desktop: static card under the head (never hides); Danach «Settle up» → back to the cockpit", async ({
    page,
  }) => {
    const email = await signUp(page, "Kai", uniqueEmail("kai"));
    const t = await trip(page, [-10, -3], email);
    // Lena paid 60 for all three → Kai pays back 20.
    await addExpense(t.tripId, {
      title: "Lunch",
      amount: 6000,
      payer: "Lena Berg",
      shares: { "Lena Berg": 2000, "Member 1": 2000, Kai: 2000 },
    });
    await page.goto(`/trips/${t.publicId}`);
    await hydrated(page);
    const dock = page.locator("[data-cost-dock]");
    await expect(dock).toHaveAttribute("data-dock-kind", "settle");
    await expect(dock).toContainText("You owe €20.00");
    if (!isMobile(page)) {
      expect(await dock.evaluate((el) => getComputedStyle(el).position)).not.toBe("fixed");
      await page.evaluate(() => {
        window.scrollTo(0, document.documentElement.scrollHeight);
      });
      await expect(dock).toHaveAttribute("data-cost-dock", "shown");
      await page.evaluate(() => {
        window.scrollTo(0, 0);
      });
    }
    // The bar's button is the page's only primary – D1 has no own button.
    await expect(
      main(page).locator("ol").getByRole("link", { name: en.route.costs.toSettle }),
    ).toHaveCount(0);
    await dock.locator('[data-dock-action="settle"]').click();
    await expect(page).toHaveURL(new RegExp(`/trips/${t.publicId}/costs/balances\\?from=cockpit$`));
    await hydrated(page);
    await expect(page.getByRole("link", { name: en.trip.backToTrip })).toHaveAttribute(
      "href",
      `/trips/${t.publicId}`,
    );
    // Without `from=cockpit` ← leads to the expenses.
    await page.goto(`/trips/${t.publicId}/costs/balances`);
    await hydrated(page);
    await expect(page.getByRole("link", { name: en.trip.backToCosts })).toHaveAttribute(
      "href",
      `/trips/${t.publicId}/costs`,
    );
  });

  test("Vorbereitung: no bar, tile without «See all expenses»", async ({ page }) => {
    const email = await signUp(page, "Kai", uniqueEmail("kai"));
    const t = await trip(page, [20, 27], email);
    await twoExpenses(t.tripId);
    await page.goto(`/trips/${t.publicId}`);
    await hydrated(page);
    await expect(page.locator("[data-cost-dock]")).toHaveCount(0);
    const tile = main(page).locator('[data-return-key="tile:costs"]');
    await expect(tile).toContainText("You get €80.00 back");
    await expect(tile).not.toContainText(en.route.tiles.costsAll);
  });
});

test.describe("W19 E – costs v2", () => {
  test("/costs: one sentence, «How we work it out», group list with its own total", async ({
    page,
  }) => {
    const email = await signUp(page, "Kai", uniqueEmail("kai"));
    const t = await trip(page, [20, 27], email);
    await twoExpenses(t.tripId);
    await page.goto(`/trips/${t.publicId}/costs`);
    await hydrated(page);
    const c = en.costs;
    const stand = main(page).getByRole("region", { name: c.mine.label });
    await expect(stand.locator("[data-balance-sentence]")).toHaveText(
      fill(c.mine.owed, { amount: "€80.00" }),
    );
    await expect(
      stand.getByText(fill(c.mine.from, { names: "Member 1 and Lena Berg" })),
    ).toBeVisible();
    // Exactly one way to «Settle up» (no segment any more).
    await expect(main(page).getByRole("link", { name: c.mine.settle })).toHaveCount(1);
    await expect(main(page).getByRole("navigation")).toHaveCount(0);
    // The way of working it out only on demand.
    const toggle = stand.getByRole("button", { name: c.calc.toggle });
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(stand.getByText(c.calc.paid)).toBeHidden();
    await toggle.click();
    await expect(stand.getByText(c.calc.paid)).toBeVisible();
    await expect(stand.locator("dl")).toContainText("€150.00");
    await expect(stand.locator("dl")).toContainText("€70.00");
    await expect(stand.locator("dl")).toContainText(c.calc.owed);
    // Group level: own heading, its own total, no day sums.
    await expect(main(page).getByRole("heading", { level: 2, name: c.group.title })).toBeVisible();
    await expect(main(page).getByText(fill(c.group.total, { total: "€210.00" }))).toBeVisible();
    await expect(main(page).getByText(en.costs.row.paidMe).first()).toBeVisible();
    await expect(main(page).getByText(fill(c.row.share, { amount: "€50.00" }))).toBeVisible();
    // «Share» moved from the head to «Settle up».
    await expect(page.getByRole("button", { name: en.balances.shareName })).toHaveCount(0);
    await expectNoSeriousAxeViolations(page, "costs v2");

    await main(page).getByRole("link", { name: c.mine.settle }).click();
    await expect(page).toHaveURL(new RegExp(`/trips/${t.publicId}/costs/balances$`));
    await hydrated(page);
    await main(page).getByRole("button", { name: en.balances.shareName }).click();
    await expect(page.getByRole("dialog", { name: c.shareTitle })).toBeVisible();
  });

  test("glossary: no «bezahlt», «Salden», «Ausgaben gesamt», «schuldest» in German", async ({
    page,
  }) => {
    const email = await signUp(page, "Kai", uniqueEmail("kai"));
    const t = await trip(page, [-1, 5], email);
    await twoExpenses(t.tripId);
    await addExpense(t.tripId, {
      title: "Taxi",
      amount: 900,
      payer: "Member 1",
      shares: { "Member 1": 300, "Lena Berg": 300, Kai: 300 },
    });
    await setAccountLocale(email, "de");
    for (const path of ["", "/costs", "/costs/balances"]) {
      await page.goto(`/trips/${t.publicId}${path}`);
      await hydrated(page);
      const toggle = main(page).getByRole("button", { name: /Ausgleiche der anderen/ });
      if (path === "/costs/balances" && (await toggle.count()) > 0) await toggle.click();
      const text = await page.locator("body").innerText();
      expect(text, path).not.toMatch(/bezahlt|Salden|Saldo|Ausgaben gesamt|schuldest|schuldet/);
    }
    await page.goto(`/trips/${t.publicId}/costs`);
    await hydrated(page);
    await expect(main(page).getByText(de.costs.group.title)).toBeVisible();
  });
});

test.describe("W19 E.0 #7 – money in the app language, not the account region", () => {
  test("Swiss account in German: «630,00 €» / «1.200,00 €», never «EUR 630.00» / «1'200.00»", async ({
    page,
  }) => {
    const email = await signUp(page, "Kai", uniqueEmail("kai"));
    const t = await trip(page, [-1, 5], email);
    await addExpense(t.tripId, {
      title: "Ferienwohnung",
      amount: 120000,
      payer: "Kai",
      shares: { "Lena Berg": 40000, "Member 1": 40000, Kai: 40000 },
    });
    await addExpense(t.tripId, {
      title: "Mietwagen",
      amount: 63000,
      payer: "Lena Berg",
      shares: { "Lena Berg": 21000, "Member 1": 21000, Kai: 21000 },
    });
    await setAccountLocale(email, "de");
    await setAccountCountry(email, "CH");
    for (const path of ["/costs", "/costs/balances", ""]) {
      await page.goto(`/trips/${t.publicId}${path}`);
      await hydrated(page);
      const text = await page.locator("body").innerText();
      expect(text, path).not.toMatch(/EUR\s?\d|\d'\d{3}|\d’\d{3}/);
      if (path === "/costs") {
        expect(text).toMatch(/1\.200,00\s€/);
        expect(text).toMatch(/630,00\s€/);
      }
    }
    // Kai: paid 1.200,00 − own parts 400,00 − 210,00 = gets 590,00 back.
    await page.goto(`/trips/${t.publicId}/costs`);
    await hydrated(page);
    await expect(main(page).locator("[data-balance-sentence]")).toHaveText(
      /Du bekommst noch 590,00\s€ zurück\./,
    );
  });

  test("US account in English: «€1,200.00»", async ({ page }) => {
    const email = await signUp(page, "Kai", uniqueEmail("kai"));
    const t = await trip(page, [20, 27], email);
    await addExpense(t.tripId, {
      title: "Flat",
      amount: 120000,
      payer: "Kai",
      shares: { Kai: 120000 },
    });
    await setAccountCountry(email, "US");
    await page.goto(`/trips/${t.publicId}/costs`);
    await hydrated(page);
    await expect(
      main(page).getByText(fill(en.costs.group.total, { total: "€1,200.00" })),
    ).toBeVisible();
  });
});

test.describe("M-P4 – «alle können» green in light mode", () => {
  test("the legend's «all» swatch is mint with an indigo number in light mode", async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: "light" });
    const email = await signUp(page, "Kai", uniqueEmail("kai"));
    const seeded = await seedTrip(`Heat ${String(Date.now())}`, { extraMembers: 1 });
    await addAccountToTrip(seeded.tripId, email, "Kai");
    await page.goto(`/trips/${seeded.publicId}/group`);
    await hydrated(page);
    const swatch = page.locator('[data-level="all"]').first();
    await expect(swatch).toBeAttached();
    const colours = await swatch.evaluate((el) => {
      const style = getComputedStyle(el);
      return { bg: style.backgroundColor, fg: style.color };
    });
    expect(colours).toEqual({ bg: "rgb(82, 229, 184)", fg: "rgb(43, 34, 102)" });
  });
});
