import { expect, type Browser, type BrowserContext, type Page } from "@playwright/test";
import en from "../../../messages/en.json" with { type: "json" };
import { signUp } from "./auth";
import { uniqueEmail } from "./mailpit";

/** Creates a trip through the form (W05) and returns its public id (on the invite page). */
export async function createTripViaUi(page: Page, name: string): Promise<string> {
  await page.goto("/trips/new");
  await page.getByLabel(en.tripForm.nameLabel).fill(name);
  await page.getByRole("button", { name: en.tripForm.presetNext3 }).click();
  await page.getByRole("button", { name: en.tripForm.submit }).click();
  await expect(page).toHaveURL(/\/trips\/[a-z0-9]{10}\/invite\?created=1$/);
  return /\/trips\/([a-z0-9]{10})\//.exec(page.url())?.[1] ?? "";
}

export interface Person {
  context: BrowserContext;
  page: Page;
  email: string;
  name: string;
}

/** A second (third, …) person in their own browser context, signed up and on /trips. */
export async function newPerson(browser: Browser, name: string): Promise<Person> {
  const context = await browser.newContext({ locale: "en-GB" });
  const page = await context.newPage();
  const email = await signUp(page, name, uniqueEmail(name.toLowerCase().replace(/\W/g, "")));
  return { context, page, email, name };
}

/** Joins via invite link while signed in (one tap, Flow A.3). */
export async function joinSignedIn(page: Page, token: string): Promise<void> {
  await page.goto(`/i/${token}`);
  await page.getByRole("button", { name: en.invite.joinCta, exact: true }).click();
  await expect(page).toHaveURL(/\/trips\/[a-z0-9]{10}(\/days)?(\?welcome=1)?$/);
}

/** Opens the «⋯» trip menu in the cockpit. */
export async function openTripMenu(page: Page): Promise<void> {
  await page.getByRole("button", { name: en.trip.menu }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
}
