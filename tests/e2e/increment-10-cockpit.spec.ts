import { expect, test, type Page } from "@playwright/test";
import en from "../../messages/en.json" with { type: "json" };
import { expectNoSeriousAxeViolations } from "./helpers/axe";
import { signUp } from "./helpers/auth";
import { addExpense, costRows, setPayInfo } from "./helpers/costs";
import {
  addAccountToTrip,
  addPlaceholder,
  makeOrganizer,
  placeholderToken,
  seedTrip,
  setFixedDates,
  tripRow,
} from "./helpers/db";
import { uniqueEmail } from "./helpers/mailpit";

// Increment 10 – cockpit (W16 v2.15, features.md R.8 I10-09; v2.17 since 11a): A1 at the
// threshold, the tile, «+ Ausgabe» in the cost bar while travelling (back to the cockpit), D1 per
// role in «Danach» (remind «settle»,
// organiser closes), the retention job (soft-deleted expenses after 24 h, deployment.md §0.10)
// and the data export (I10-10). Accounts: en-GB; only visible elements, `expect.poll`.

test.use({ locale: "en-GB" });

const r = en.route;
const fill = (text: string, values: Record<string, string | number>) =>
  Object.entries(values).reduce(
    (out, [key, value]) => out.replaceAll(`{${key}}`, String(value)),
    text,
  );
const hydrated = (page: Page) => page.waitForLoadState("networkidle");
const main = (page: Page) => page.locator("main");
const RETENTION_TOKEN = "e2e-only-retention-token-0123456789abcdef";

/** Kai in Lena Berg's trip with «Member 1», dates as day offsets. */
async function cockpitTrip(
  page: Page,
  days: [number, number],
  role: "member" | "organizer" = "member",
) {
  const name = `Cockpit costs ${String(Date.now())}`;
  const trip = await seedTrip(name, { extraMembers: 1 });
  const email = await signUp(page, "Kai", uniqueEmail("kai"));
  await addAccountToTrip(trip.tripId, email, "Kai");
  if (role === "organizer") await makeOrganizer(trip.tripId, email);
  await setFixedDates(trip.tripId, days[0], days[1]);
  return { ...trip, email, name };
}

/** Lena paid `cents` for Kai only → Kai owes Lena `cents`. */
const kaiOwesLena = (tripId: string, cents: number) =>
  addExpense(tripId, {
    title: "Ferry deposit",
    amount: cents,
    payer: "Lena Berg",
    shares: { Kai: cents },
  });

test.describe("W16 v2.15 – costs in the cockpit", () => {
  test("Vorbereitung: tile «No expenses yet»; A1 from €50.00, not at €49.99", async ({ page }) => {
    const trip = await cockpitTrip(page, [41, 48]);
    await page.goto(`/trips/${trip.publicId}`);
    await hydrated(page);
    await expect(
      main(page).getByRole("link", {
        name: new RegExp(`${r.tiles.costs}\\. ${r.tiles.costsEmpty}`),
      }),
    ).toBeVisible();
    const id = await kaiOwesLena(trip.tripId, 4999);
    await page.reload();
    await hydrated(page);
    await expect(main(page).getByText(/You owe Lena Berg/)).toHaveCount(0);
    // W19 E.9: the tile shows the own result only – no group total.
    await expect(
      main(page).getByRole("link", { name: /^Expenses\. You owe €49\.99$/ }),
    ).toBeVisible();
    await addExpense(trip.tripId, {
      title: "Cent",
      amount: 1,
      payer: "Lena Berg",
      shares: { Kai: 1 },
    });
    await page.reload();
    await hydrated(page);
    const card = main(page).getByText(
      fill(r.costs.debtTitleOne, { name: "Lena Berg", amount: "€50.00" }),
    );
    await expect(card.first()).toBeVisible();
    await expect(main(page).getByText(r.costs.debtStatusNoInfo).first()).toBeVisible();
    await main(page).getByRole("link", { name: r.costs.toSettle }).click();
    await expect(page).toHaveURL(new RegExp(`/trips/${trip.publicId}/costs/balances`));
    expect(id).toBeTruthy();
  });

  test("Unterwegs: bar «+ Expense» → save → back in the cockpit with «View»", async ({ page }) => {
    const trip = await cockpitTrip(page, [-1, 5]);
    // Phones: the bar only shows while the tile «Expenses» is below the fold (W16 v2.17) – a
    // short window keeps the tile out of the first screen.
    const width = page.viewportSize()?.width ?? 1280;
    if (width < 960) await page.setViewportSize({ width, height: 600 });
    await page.goto(`/trips/${trip.publicId}`);
    await hydrated(page);
    await page.getByRole("link", { name: r.dock.addName }).click();
    await expect(page).toHaveURL(/\/costs\/new\?date=today&from=cockpit$/);
    await hydrated(page);
    await page.getByLabel(en.costForm.amount, { exact: false }).first().fill("45");
    await page.getByLabel(en.costForm.what).fill("Groceries");
    await page.getByRole("button", { name: en.costForm.save }).click();
    await expect(page).toHaveURL(new RegExp(`/trips/${trip.publicId}(\\?.*)?$`));
    // W19 E.7: the snackbar names the new result.
    const toast = page
      .getByRole("status")
      .filter({ hasText: fill(en.costForm.savedOwed, { amount: "€30.00" }) });
    await expect(toast).toBeVisible();
    await expect(toast.getByRole("button", { name: en.costForm.view })).toBeVisible();
    await expect(page.getByRole("link", { name: r.dock.addName })).toBeFocused();
    await expect(
      main(page).getByRole("link", {
        name: `Expenses. You get €30.00 back. ${r.tiles.costsAll}`,
      }),
    ).toBeAttached();
    // The bar has settled (shown for the focus, UM-26) before axe measures its text.
    await expect(page.locator("[data-cost-dock]")).toHaveAttribute("data-cost-dock", "shown");
    await expectNoSeriousAxeViolations(page, "cockpit travelling with costs");
  });

  test("Danach, member owed: D1 waits, «Remind Member 1» text without payment details", async ({
    page,
  }) => {
    const trip = await cockpitTrip(page, [-10, -3]);
    await addExpense(trip.tripId, {
      title: "Dinner",
      amount: 2000,
      payer: "Kai",
      shares: { "Member 1": 2000 },
    });
    await setPayInfo(trip.tripId, "Kai", "DE89370400440532013000", "PayPal: kai");
    await page.goto(`/trips/${trip.publicId}`);
    await hydrated(page);
    await expect(page.getByText(r.phase.afterSettle).first()).toBeVisible();
    // W16 v2.17: «Ausgleichen» sits in the cost bar (the head button is gone).
    await expect(page.locator('[data-dock-action="settle"]')).toBeVisible();
    await expect(page.locator("[data-head-action]")).toHaveCount(0);
    await expect(
      main(page).getByText(fill(r.costs.owedOne, { amount: "€20.00", name: "Member 1" })),
    ).toBeVisible();
    await main(page)
      .getByRole("button", { name: fill(r.costs.remindOne, { name: "Member 1" }) })
      .first()
      .click();
    const sheet = page.getByRole("dialog");
    await expect(sheet.getByText(/according to the app you still owe me €20\.00/)).toBeVisible();
    await expect(sheet.getByText(/DE89/)).toHaveCount(0);
    await expect(sheet.getByText(/PayPal/)).toHaveCount(0);
  });

  test("R-082: member owed by a placeholder → «Let Lena Berg know», never an invite link", async ({
    page,
  }) => {
    const trip = await cockpitTrip(page, [-10, -3]);
    await addPlaceholder(trip.tripId, "Lotte");
    await addExpense(trip.tripId, {
      title: "Dinner",
      amount: 3000,
      payer: "Kai",
      shares: { Lotte: 3000 },
    });
    await setPayInfo(trip.tripId, "Kai", "DE89370400440532013000", "PayPal: kai");
    const personal = await placeholderToken(trip.publicId, "Lotte");
    const general = (await tripRow(trip.publicId))?.invite_token;
    if (!personal || !general) throw new Error("no invite tokens");
    // Neither the personal nor the general invite link reaches the member (HTML, RSC).
    const leak = new RegExp(`/i/|${personal}|${general}`);
    for (const path of [`/trips/${trip.publicId}`, `/trips/${trip.publicId}/costs/balances`]) {
      expect(await (await page.request.get(path)).text()).not.toMatch(leak);
      expect(await (await page.request.get(path, { headers: { RSC: "1" } })).text()).not.toMatch(
        leak,
      );
    }

    const nudge = en.share.remind.nudgePlaceholder;
    const message = fill(nudge.split(" {link}")[0] ?? nudge, {
      orga: "Lena Berg",
      name: "Lotte",
      trip: trip.name,
    });
    const expectNudgeSheet = async () => {
      const sheet = page.getByRole("dialog", {
        name: fill(en.remind.placeholderTitle, { name: "Lotte" }),
      });
      await expect(
        sheet.getByText(fill(en.remind.placeholderText, { name: "Lotte", orga: "Lena Berg" })),
      ).toBeVisible();
      const area = sheet.getByRole("textbox", { name: en.remind.messageLabel });
      await expect.poll(() => area.inputValue()).toContain(message);
      const body = await area.inputValue();
      expect(body).not.toMatch(/\/i\/|€|DE89|PayPal/);
      expect(body).toContain(`/trips/${trip.publicId}`);
      await page.keyboard.press("Escape");
      await expect(sheet).toBeHidden();
    };

    // Cockpit D1: the single debtor is a placeholder → the organiser is told.
    await page.goto(`/trips/${trip.publicId}`);
    await hydrated(page);
    await main(page)
      .getByRole("button", {
        name: fill(r.costs.nudgeOrgaName, { orga: "Lena Berg", name: "Lotte" }),
      })
      .first()
      .click();
    await expectNudgeSheet();

    // Balances: no «Remind Lotte», but «Let Lena Berg know» in the row.
    await page.goto(`/trips/${trip.publicId}/costs/balances`);
    await hydrated(page);
    await expect(
      main(page).getByRole("button", { name: fill(en.balances.remind, { name: "Lotte" }) }),
    ).toHaveCount(0);
    const button = main(page).getByRole("button", {
      name: fill(en.balances.nudgeOrgaName, { orga: "Lena Berg", name: "Lotte" }),
    });
    await expect(button).toHaveText(fill(en.remind.orgaTitle, { orga: "Lena Berg" }));
    await button.click();
    await expectNudgeSheet();
  });

  test("R-082: organiser reminds a placeholder with the personal link", async ({ page }) => {
    const trip = await cockpitTrip(page, [-10, -3], "organizer");
    await addPlaceholder(trip.tripId, "Lotte");
    await addExpense(trip.tripId, {
      title: "Dinner",
      amount: 3000,
      payer: "Kai",
      shares: { Lotte: 3000 },
    });
    const personal = await placeholderToken(trip.publicId, "Lotte");
    const general = (await tripRow(trip.publicId))?.invite_token;
    if (!personal || !general) throw new Error("no invite tokens");
    await page.goto(`/trips/${trip.publicId}`);
    await hydrated(page);
    await main(page)
      .getByRole("button", { name: fill(r.costs.remindOne, { name: "Lotte" }) })
      .first()
      .click();
    const sheet = page.getByRole("dialog");
    const area = sheet.getByRole("textbox", { name: en.remind.messageLabel });
    await expect
      .poll(() => area.inputValue())
      .toMatch(/according to the app you still owe me €30\.00/);
    const body = await area.inputValue();
    expect(body).toContain(`/i/${personal}`);
    expect(body).not.toContain(general);
  });

  test("Danach, organiser, all square: «close the expenses?» (secondary) → done, H-5", async ({
    page,
  }) => {
    const trip = await cockpitTrip(page, [-10, -3], "organizer");
    await addExpense(trip.tripId, {
      title: "Snacks",
      amount: 900,
      payer: "Kai",
      shares: { Kai: 900 },
    });
    await page.goto(`/trips/${trip.publicId}`);
    await hydrated(page);
    await expect(main(page).getByText(r.costs.d1CloseTitle)).toBeVisible();
    await main(page).getByRole("button", { name: r.costs.close, exact: true }).click();
    const dialog = page.getByRole("dialog", { name: en.closeCosts.title });
    await expect(dialog.getByText(en.closeCosts.text)).toBeVisible();
    await dialog.locator("[data-close-costs]").click();
    await expect.poll(async () => (await costRows(trip.tripId)).trip?.closed).toBe(true);
    await expect(main(page).getByText(r.sentence.h5)).toBeVisible();
    await expect(page.getByText(r.phase.afterSquare).first()).toBeVisible();
  });
});

test.describe("retention and export (R.8 I10-10)", () => {
  test("soft-deleted expenses go after 24 h (23 h stays); the export holds only own cost data", async ({
    page,
    request,
  }) => {
    const trip = await cockpitTrip(page, [41, 48]);
    await addExpense(trip.tripId, {
      title: "Recent delete",
      amount: 100,
      payer: "Kai",
      shares: { Kai: 100 },
      deletedHoursAgo: 23,
    });
    await addExpense(trip.tripId, {
      title: "Old delete",
      amount: 100,
      payer: "Kai",
      shares: { Kai: 100 },
      deletedHoursAgo: 25,
    });
    await addExpense(trip.tripId, {
      title: "Hotel",
      amount: 9000,
      payer: "Lena Berg",
      shares: { "Lena Berg": 3000, "Member 1": 3000, Kai: 3000 },
    });
    await setPayInfo(trip.tripId, "Kai", "DE89370400440532013000", null);
    const response = await request.post("/api/internal/retention", {
      headers: { authorization: `Bearer ${RETENTION_TOKEN}` },
    });
    expect(response.status()).toBe(200);
    const titles = (await costRows(trip.tripId)).expenses.map((e) => e.title);
    expect(titles).toContain("Recent delete");
    expect(titles).not.toContain("Old delete");

    const exported = await page.request.get("/account/export");
    const data = (await exported.json()) as {
      trips: {
        name: string;
        costs: {
          myBalance: number;
          myPaymentDetails: { iban: string } | null;
          myShares: { title: string; myShare: number }[];
        } | null;
      }[];
    };
    const costs = data.trips.find((t) => t.name === trip.name)?.costs;
    expect(costs?.myBalance).toBe(-30);
    expect(costs?.myPaymentDetails?.iban).toBe("DE89370400440532013000");
    expect(costs?.myShares.map((share) => [share.title, share.myShare])).toEqual([["Hotel", 30]]);
    const text = JSON.stringify(data);
    expect(text).not.toContain("Lena Berg");
    expect(text).not.toContain("Member 1");
  });
});
