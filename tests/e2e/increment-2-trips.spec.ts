import { expect, test } from "@playwright/test";
import en from "../../messages/en.json" with { type: "json" };
import { signUp } from "./helpers/auth";
import { isoDay, seedTrip, addAccountToTrip } from "./helpers/db";
import { uniqueEmail, waitForAccessMail } from "./helpers/mailpit";
import { createTripViaUi } from "./helpers/trips";

// Increment 2: F-001 create a trip (W05, Flow G), F-044 «My trips» (W04).
// Browser locale en-US → English UI.

const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

test.describe("F-044 my trips", () => {
  test("empty state with illustration and «Plan a new trip»", async ({ page }) => {
    await signUp(page, "Nora");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(en.trips.title);
    await expect(page.getByRole("heading", { name: en.trips.emptyTitle })).toBeVisible();
    await expect(page.locator('svg[data-illustration="empty-trips"]')).toBeVisible();
    await page.getByRole("link", { name: en.trips.newTrip }).click();
    await expect(page).toHaveURL(/\/trips\/new$/);
  });

  test("cards: phase chip, organizer chip, progress, to-do first, past folded away", async ({
    page,
  }) => {
    const email = await signUp(page, "Mia");
    const running = await seedTrip(`Running ${String(Date.now())}`, { extraMembers: 2 });
    const fixed = await seedTrip(`Fixed ${String(Date.now())}`, { phase: "fixed" });
    await addAccountToTrip(running.tripId, email, "Mia");
    await addAccountToTrip(fixed.tripId, email, "Mia");
    const own = await createTripViaUi(page, `Own ${String(Date.now())}`);
    expect(own).toMatch(/^[a-z0-9]{10}$/);

    await page.goto("/trips");
    const todo = page.getByRole("region", { name: /To do/ });
    await expect(todo.getByRole("listitem")).toHaveCount(2);
    const ownCard = todo.getByRole("listitem").filter({ hasText: "Own " });
    await expect(ownCard.getByText(en.trips.organizer)).toBeVisible();
    await expect(ownCard.getByText(en.trips.todo.addDates)).toBeVisible();
    await expect(ownCard.getByText(en.trips.phase.collect)).toBeVisible();
    await expect(ownCard.getByText("0 of 1 have added their dates")).toBeVisible();
    await expect(ownCard.getByRole("link", { name: en.trips.action.addDates })).toHaveAttribute(
      "href",
      /\/trips\/[a-z0-9]{10}\/days$/,
    );
    const runningCard = todo.getByRole("listitem").filter({ hasText: "Running " });
    await expect(runningCard.getByText("0 of 4 have added their dates")).toBeVisible();
    await expect(runningCard.getByText(en.trips.organizer)).toHaveCount(0);

    const current = page.getByRole("region", { name: en.trips.runningTitle });
    await expect(current.getByRole("listitem").filter({ hasText: "Fixed " })).toContainText(
      /It's on: /,
    );
    // The whole card is one link to the trip.
    await ownCard.getByRole("link", { name: /^Own / }).click();
    await expect(page).toHaveURL(new RegExp(`/trips/${own}$`));
  });
});

test.describe("F-001 create a trip", () => {
  test("signed in: form → invite page with share text in both languages", async ({ page }) => {
    await signUp(page, "Lena");
    const name = `Lisbon ${String(Date.now())}`;
    await page.goto("/trips/new");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(en.tripForm.titleNew);
    await page.getByLabel(en.tripForm.nameLabel).fill(name);
    const preset = page.getByRole("button", { name: en.tripForm.presetNext6 });
    await preset.click();
    await expect(preset).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByLabel(en.tripForm.startLabel, { exact: true })).toHaveValue(
      /\d{4}-\d{2}-\d{2}/,
    );
    await page.getByRole("button", { name: en.tripForm.increase }).first().click();
    await expect(page.getByLabel(en.tripForm.minNightsAria)).toHaveValue("5");
    await expect(page.getByText("= 6 days incl. arrival and departure")).toBeVisible();
    await page.getByText(en.tripForm.moreOptions).click();
    await page.getByLabel(en.tripForm.descriptionLabel).fill("Sun and surf");
    await page.getByLabel(en.tripForm.deadlineLabel).fill(isoDay(7));
    await page.getByRole("button", { name: en.tripForm.submit }).click();

    await expect(page).toHaveURL(/\/trips\/[a-z0-9]{10}\/invite\?created=1$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(en.share.createdTitle);
    const text = page.getByLabel(en.share.messageLabel);
    await expect(text).toHaveValue(
      new RegExp(
        `^When do we go\\? ${escape(name)} – add your dates by .+, takes 2 minutes: http.+/i/[\\w-]{43}$`,
      ),
    );
    await page.getByRole("radio", { name: "Deutsch" }).check();
    await expect(text).toHaveValue(new RegExp(`^Wir wollen weg: ${escape(name)}! Trag bis `));
    // «Next: add my dates» only right after creating.
    await expect(page.getByRole("link", { name: en.share.continue })).toBeVisible();
  });

  test("validation: error summary, focus on the first field, range too short", async ({ page }) => {
    await signUp(page, "Vera");
    await page.goto("/trips/new");
    await page.getByRole("button", { name: en.tripForm.submit }).click();
    await expect(
      page.getByRole("alert").filter({ hasText: en.tripForm.errorSummary }),
    ).toBeVisible();
    await expect(page.getByLabel(en.tripForm.nameLabel)).toBeFocused();
    await expect(page.getByText(en.tripForm.errors.nameRequired).first()).toBeVisible();

    await page.getByLabel(en.tripForm.nameLabel).fill("Short trip");
    await page.getByLabel(en.tripForm.startLabel, { exact: true }).fill(isoDay(10));
    await page.getByLabel(en.tripForm.endLabel, { exact: true }).fill(isoDay(12));
    await page.getByRole("button", { name: en.tripForm.submit }).click();
    await expect(
      page.getByText("For 4 nights the range needs at least 5 days.").first(),
    ).toBeVisible();
    await expect(page.getByLabel(en.tripForm.endLabel, { exact: true })).toBeFocused();
    // Errors disappear live once fixed (ux-spec §5.1).
    await page.getByLabel(en.tripForm.endLabel, { exact: true }).fill(isoDay(20));
    await expect(page.getByText("For 4 nights the range needs at least 5 days.")).toHaveCount(0);
    await expect(page).toHaveURL(/\/trips\/new$/);
  });

  test("signed out (Flow G): the form comes first, the account at the end, data survives a reload", async ({
    page,
  }) => {
    const name = `Porto ${String(Date.now())}`;
    const email = uniqueEmail("planner");
    await page.goto("/trips/new");
    await page.getByLabel(en.tripForm.nameLabel).fill(name);
    await page.getByRole("button", { name: en.tripForm.presetNext3 }).click();
    await page.getByRole("button", { name: en.tripForm.submit }).click();

    // Summary of the trip + sign-in steps below it.
    await expect(page.getByRole("region", { name: en.tripForm.summaryLabel })).toContainText(name);
    await expect(page.getByRole("heading", { name: en.tripForm.authTitle })).toBeVisible();
    await page.getByLabel(en.auth.emailLabel).fill(email);
    await page.getByRole("button", { name: en.auth.sendCode }).click();
    const mail = await waitForAccessMail(email);

    // In-app browser reloads the tab: summary and code step are back, no new mail needed.
    await page.reload();
    await expect(page.getByRole("region", { name: en.tripForm.summaryLabel })).toContainText(name);
    await expect(page.getByText(en.auth.welcomeBack)).toBeVisible();
    await page.getByLabel(en.auth.codeLabel).fill(mail.code);
    await page.getByLabel(en.auth.nameLabel).fill("Pia");
    await page.getByRole("button", { name: en.tripForm.submit }).click();

    await expect(page).toHaveURL(/\/trips\/[a-z0-9]{10}\/invite\?created=1$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(en.share.createdTitle);
    await page.goto("/trips");
    await expect(page.getByRole("listitem").filter({ hasText: name })).toContainText(
      en.trips.organizer,
    );
    const draft = await page.evaluate(() => localStorage.getItem("ww.tripDraft"));
    expect(draft).toBeNull();
  });
});
