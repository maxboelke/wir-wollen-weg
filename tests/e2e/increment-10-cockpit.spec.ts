import { expect, test, type Page } from "@playwright/test";
import en from "../../messages/en.json" with { type: "json" };
import { expectNoSeriousAxeViolations } from "./helpers/axe";
import { signUp } from "./helpers/auth";
import { addExpense, costRows, setPayInfo } from "./helpers/costs";
import { addAccountToTrip, makeOrganizer, seedTrip, setFixedDates } from "./helpers/db";
import { uniqueEmail } from "./helpers/mailpit";

// Increment 10 – cockpit (W16 v2.15, features.md R.8 I10-09): A1 at the threshold, the tile,
// «+ Ausgabe» while travelling (back to the cockpit), D1 per role in «Danach» (remind «settle»,
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
    await expect(
      main(page).getByRole("link", { name: /Expenses\. €49\.99 in total · you owe €49\.99/ }),
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

  test("Unterwegs: «+ Expense» → save → back in the cockpit with «View»", async ({ page }) => {
    const trip = await cockpitTrip(page, [-1, 5]);
    await page.goto(`/trips/${trip.publicId}`);
    await hydrated(page);
    await page.getByRole("link", { name: r.addExpenseName }).click();
    await expect(page).toHaveURL(/\/costs\/new\?date=today&from=cockpit$/);
    await hydrated(page);
    await page.getByLabel(en.costForm.amount, { exact: false }).first().fill("45");
    await page.getByLabel(en.costForm.what).fill("Groceries");
    await page.getByRole("button", { name: en.costForm.save }).click();
    await expect(page).toHaveURL(new RegExp(`/trips/${trip.publicId}(\\?.*)?$`));
    const toast = page
      .getByRole("status")
      .filter({ hasText: fill(en.costForm.saved, { amount: "€45.00" }) });
    await expect(toast).toBeVisible();
    await expect(toast.getByRole("button", { name: en.costForm.view })).toBeVisible();
    await expect(page.getByRole("link", { name: r.addExpenseName })).toBeFocused();
    await expect(
      main(page).getByRole("link", { name: /Expenses\. €45 in total · you’re owed €30/ }),
    ).toBeVisible();
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
    await expect(page.locator('[data-head-action="settle"]')).toBeVisible();
    await expect(
      main(page).getByText(fill(r.costs.owedOne, { amount: "€20.00", name: "Member 1" })),
    ).toBeVisible();
    await main(page)
      .getByRole("button", { name: fill(r.costs.remindOne, { name: "Member 1" }) })
      .first()
      .click();
    const sheet = page.getByRole("dialog");
    await expect(
      sheet.getByText(/according to the .* expenses you still owe me €20\.00/),
    ).toBeVisible();
    await expect(sheet.getByText(/DE89/)).toHaveCount(0);
    await expect(sheet.getByText(/PayPal/)).toHaveCount(0);
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
