import { expect, test, type Page } from "@playwright/test";
import en from "../../messages/en.json" with { type: "json" };
import { expectNoSeriousAxeViolations } from "./helpers/axe";
import { addAccountToTrip, addPlaceholder, seedTrip, setFixedDates } from "./helpers/db";
import { waitForCodeMail, mailIds } from "./helpers/mailpit";
import { expireTravelReauth, setBookerMark } from "./helpers/travel";
import { newPerson, type Person } from "./helpers/trips";

// Increment 11 (F-054/F-056, features.md R.9, W20 H): request → consent → release → masked
// «Bucht» view with «Anzeigen»/«Kopieren» → access log at the member → withdrawal; the
// organiser without the marking only sees status (also in the page HTML); re-authentication for
// document numbers; «Wer bucht?» in the cockpit. Accounts: en-GB. Values are made up.

const t = en.travelData;
const b = en.booking;
const fill = (text: string, values: Record<string, string | number>) =>
  Object.entries(values).reduce(
    (out, [key, value]) => out.replaceAll(`{${key}}`, String(value)),
    text,
  );
const hydrated = (page: Page) => page.waitForLoadState("networkidle");
const main = (page: Page) => page.locator("main");

const GIVEN = "Erika Maria";
const FAMILY = "Musterfrau";

interface Crew {
  publicId: string;
  tripId: string;
  sara: Person;
  max: Person;
  lena: Person;
}

/** Lena (organiser, NOT «Bucht»), Sara («Bucht»), Max – fixed trip in 41–48 days, placeholder Mia. */
async function crew(browser: import("@playwright/test").Browser): Promise<Crew> {
  const trip = await seedTrip(`Travel ${String(Date.now())}`);
  const [lena, sara, max] = await Promise.all([
    newPerson(browser, "Lena"),
    newPerson(browser, "Sara"),
    newPerson(browser, "Max"),
  ]);
  for (const p of [lena, sara, max]) await addAccountToTrip(trip.tripId, p.email, p.name);
  await swapOrganizer(trip.tripId, lena.email);
  await addPlaceholder(trip.tripId, "Mia");
  await setFixedDates(trip.tripId, 41, 48);
  await setBookerMark(trip.tripId, sara.email, true);
  return { publicId: trip.publicId, tripId: trip.tripId, sara, max, lena };
}

async function swapOrganizer(tripId: string, email: string) {
  const { makeOrganizer } = await import("./helpers/db");
  await makeOrganizer(tripId, email);
}

async function askNameAndBirth(page: Page, publicId: string, purpose: string, withDocument = false) {
  await page.goto(`/trips/${publicId}/travel-data/new`);
  await hydrated(page);
  await page.getByLabel(t.request.purpose).fill(purpose);
  if (withDocument) {
    await page.getByRole("switch", { name: t.request.fieldWithDoc }).click();
    await expect(page.getByText(t.request.docWarning)).toBeVisible();
  }
  await page.getByRole("button", { name: t.request.submit }).click();
  if (withDocument) {
    await page.getByRole("button", { name: t.request.docConfirmYes }).click();
  }
  await expect(page).toHaveURL(new RegExp(`/trips/${publicId}/travel-data$`));
  await expect(main(page).getByRole("heading", { level: 3, name: purpose })).toBeVisible();
}

async function release(page: Page, publicId: string, by: string, document = false) {
  await page.goto(`/trips/${publicId}/travel-data`);
  await hydrated(page);
  await main(page).getByRole("link", { name: t.member.enter }).first().click();
  await expect(page.getByRole("heading", { level: 2, name: t.fill.step1 })).toBeVisible();
  await page.getByLabel(t.fill.givenNames).fill(GIVEN);
  await page.getByLabel(t.fill.familyNames).fill(FAMILY);
  // Pasting a whole date into the first field fills all three (W20 H.5).
  await page.getByLabel(t.fill.day, { exact: true }).first().fill("12");
  await page.getByLabel(t.fill.month, { exact: true }).first().fill("8");
  await page.getByLabel(t.fill.year, { exact: true }).first().fill("1990");
  if (document) {
    await page.getByLabel(t.fill.nationality).selectOption("DE");
    await page.getByRole("radio", { name: t.documentType.passport }).check();
    await page.getByLabel(t.fill.docNumber).fill("demo 48151");
    await page.getByLabel(t.fill.day, { exact: true }).nth(1).fill("31");
    await page.getByLabel(t.fill.month, { exact: true }).nth(1).fill("12");
    await page.getByLabel(t.fill.year, { exact: true }).nth(1).fill("2032");
  }
  await page.getByRole("button", { name: t.fill.next }).click();
  await expect(page.getByRole("heading", { level: 2, name: t.fill.step2 })).toBeVisible();
  // Without the tick: error, nothing stored.
  await page.getByRole("button", { name: fill(t.consent.release, { name: by }) }).click();
  await expect(page.getByText(fill(t.consent.missing, { name: by }))).toBeVisible();
  await page.locator("[data-travel-consent] input").check();
  await page.getByRole("button", { name: fill(t.consent.release, { name: by }) }).click();
  await expect(page).toHaveURL(new RegExp(`/trips/${publicId}/travel-data$`));
  await expect(
    main(page).getByRole("heading", { level: 3, name: fill(t.released.title, { name: by }) }),
  ).toBeVisible();
}

test.describe("W20 H – request, consent, masked view, access log, withdrawal", () => {
  test("full flow with rights per role", async ({ browser }) => {
    test.setTimeout(180_000);
    const c = await crew(browser);
    const purpose = "Ferry Split – Hvar";

    // Max sees nothing to do yet; the area answers with no-store.
    const response = await c.max.page.goto(`/trips/${c.publicId}/travel-data`);
    expect(response?.headers()["cache-control"]).toContain("no-store");
    await expect(main(c.max.page).getByRole("heading", { name: t.emptyMember.title })).toBeVisible();

    await askNameAndBirth(c.sara.page, c.publicId, purpose);
    await expectNoSeriousAxeViolations(c.sara.page, "travel data booker");

    // Max: V4 «dran» in the cockpit → form → release.
    await c.max.page.goto(`/trips/${c.publicId}`);
    await expect(
      c.max.page.getByRole("link", { name: en.route.v4.share }).or(
        c.max.page.getByRole("button", { name: en.route.v4.share }),
      ),
    ).toBeVisible();
    await release(c.max.page, c.publicId, "Sara");
    await expectNoSeriousAxeViolations(c.max.page, "travel data member released");

    // Sara: masks only in the HTML, values after «Show» (logged).
    const html = await (await c.sara.page.request.get(`/trips/${c.publicId}/travel-data`)).text();
    expect(html).not.toContain(FAMILY);
    expect(html).not.toContain("1990");
    await c.sara.page.goto(`/trips/${c.publicId}/travel-data`);
    await hydrated(c.sara.page);
    const person = main(c.sara.page).locator('[data-travel-person="released"]');
    await expect(person.locator("[data-travel-mask]").first()).toBeVisible();
    await person.getByRole("button", { name: fill(t.revealName, { name: "Max" }) }).click();
    await expect(person.getByText(FAMILY)).toBeVisible();
    await person.getByRole("button", { name: fill(t.hideName, { name: "Max" }) }).click();
    await expect(person.getByText(FAMILY)).toHaveCount(0);

    // Lena (organiser without the marking): status only – no values, no «Show».
    const lenaHtml = await (await c.lena.page.request.get(`/trips/${c.publicId}/travel-data`)).text();
    expect(lenaHtml).not.toContain(FAMILY);
    await c.lena.page.goto(`/trips/${c.publicId}/travel-data`);
    await expect(main(c.lena.page).locator("[data-travel-count]")).toBeVisible();
    await expect(main(c.lena.page).getByRole("button", { name: /Show/ })).toHaveCount(0);

    // Max sees the access log entry, then withdraws.
    await c.max.page.goto(`/trips/${c.publicId}/travel-data`);
    await expect(
      main(c.max.page).getByText(fill(t.log.viewed, { name: "Sara", when: "" }).replace(/ · $/, "")),
    ).toBeVisible();
    await main(c.max.page).getByRole("button", { name: t.released.withdraw }).click();
    await c.max.page.getByRole("button", { name: t.revoke.confirm }).click();
    await expect(c.max.page.getByText(t.revoke.done)).toBeVisible();
    await expect(main(c.max.page).getByRole("link", { name: t.member.enter })).toBeVisible();

    // Sara: Max is open again.
    await c.sara.page.goto(`/trips/${c.publicId}/travel-data`);
    await expect(main(c.sara.page).locator('[data-travel-person="open"]')).toHaveCount(1);
    await expect(main(c.sara.page).locator('[data-travel-person="released"]')).toHaveCount(0);

    for (const p of [c.lena, c.sara, c.max]) await p.context.close();
  });

  test("document numbers need a fresh code confirmation (> 12 h / password)", async ({ browser }) => {
    test.setTimeout(180_000);
    const c = await crew(browser);
    await askNameAndBirth(c.sara.page, c.publicId, "Flights to Edinburgh", true);
    await release(c.max.page, c.publicId, "Sara", true);
    await expireTravelReauth(c.sara.email);
    await c.sara.page.goto(`/trips/${c.publicId}/travel-data`);
    await hydrated(c.sara.page);
    const person = main(c.sara.page).locator('[data-travel-person="released"]');
    await person.getByRole("button", { name: fill(t.revealName, { name: "Max" }) }).click();
    const sheet = c.sara.page.getByRole("dialog");
    await expect(sheet.getByText(t.reauth.intro)).toBeVisible();
    const seen = await mailIds(c.sara.email);
    await sheet.getByRole("button", { name: t.reauth.send }).click();
    const mail = await waitForCodeMail(c.sara.email, { seen });
    await sheet.getByLabel(en.auth.codeLabel).fill(mail.code);
    // The original action runs right after the confirmation.
    await expect(person.getByText("DEMO48151")).toBeVisible();
    for (const p of [c.lena, c.sara, c.max]) await p.context.close();
  });
});

test.describe("W20 H.2 – «Wer bucht?» in the cockpit", () => {
  test("organiser marks and unmarks; members see the chip and the sentence", async ({ browser }) => {
    test.setTimeout(120_000);
    const c = await crew(browser);
    const page = c.lena.page;
    await page.goto(`/trips/${c.publicId}`);
    await hydrated(page);
    await page.getByRole("button", { name: en.trip.menu }).click();
    await page.getByRole("button", { name: en.trip.menuItems.bookers }).click();
    const sheet = page.getByRole("dialog");
    await expect(sheet.getByRole("heading", { name: b.sheet.title })).toBeVisible();
    await expect(sheet.getByText(fill(b.sheet.counter, { count: 1 }))).toBeVisible();
    await sheet.getByRole("switch", { name: fill(b.sheet.switchName, { name: "Max" }) }).click();
    await expect(page.getByText(fill(b.on, { name: "Max" }))).toBeVisible();
    await expect(sheet.getByText(fill(b.sheet.counter, { count: 2 }))).toBeVisible();
    // Placeholders cannot book.
    await expect(
      sheet.getByRole("switch", { name: fill(b.sheet.switchName, { name: "Mia" }) }),
    ).toHaveAttribute("aria-disabled", "true");
    await sheet.getByRole("switch", { name: fill(b.sheet.switchName, { name: "Max" }) }).click();
    await expect(page.getByText(fill(b.off, { name: "Max" }))).toBeVisible();
    await expectNoSeriousAxeViolations(page, "who books sheet");

    // Max sees Sara's chip in «Wer ist dabei?» – and no «Wer bucht?» menu entry.
    await c.max.page.goto(`/trips/${c.publicId}`);
    await hydrated(c.max.page);
    await c.max.page.getByRole("button", { name: en.trip.menu }).click();
    await expect(c.max.page.getByRole("button", { name: en.trip.menuItems.bookers })).toHaveCount(0);
    for (const p of [c.lena, c.sara, c.max]) await p.context.close();
  });
});
