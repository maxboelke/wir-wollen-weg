import { expect, test, type BrowserContext } from "@playwright/test";
import en from "../../messages/en.json" with { type: "json" };
import { createTrip } from "./helpers/db";
import { uniqueEmail, waitForAccessMail } from "./helpers/mailpit";

// Spike P1-0a (docs/ops/spike-auth.md): combined code + magic-link mail,
// "keep me signed in" default, SameSite=Lax, invite token survives sign-up.
// Browser locale is en-US → English UI.

const SESSION_COOKIE = /^(__Secure-)?ww\.session_token$/;

async function sessionCookie(context: BrowserContext) {
  const cookies = await context.cookies();
  return cookies.find((c) => SESSION_COOKIE.test(c.name));
}

test("invite → code from mail → name → joined (token survives sign-up)", async ({ page }) => {
  const tripName = `Lisbon ${Date.now()}`;
  const token = await createTrip(tripName);
  const email = uniqueEmail("kemal");

  await page.goto(`/i/${token}`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(tripName);
  await page.getByLabel(en.auth.emailLabel).fill(email);
  await page.getByRole("button", { name: en.auth.sendCode }).click();

  const mail = await waitForAccessMail(email);
  expect(mail.subject).toBe(`${mail.code} is your code for When do we go?`);
  expect(mail.text).toContain(tripName); // invite context in the mail

  // Still on the invite URL – no page change during registration.
  await expect(page).toHaveURL(new RegExp(`/i/${token}$`));
  await page.getByLabel(en.auth.codeLabel).fill(mail.code); // auto-submits at 6 digits

  await expect(page.getByRole("heading", { name: en.auth.nameTitle })).toBeVisible();
  await page.getByLabel(en.auth.nameLabel).fill("Kemal");
  await page.getByRole("button", { name: en.invite.confirmJoin }).click();

  await expect(page).toHaveURL(/\/trips$/);
  await expect(page.getByRole("listitem").filter({ hasText: tripName })).toBeVisible();

  const cookie = await sessionCookie(page.context());
  expect(cookie, "session cookie").toBeDefined();
  expect(cookie?.sameSite).toBe("Lax");
  expect(cookie?.httpOnly).toBe(true);
  // "Keep me signed in" is on by default → persistent cookie (~90 days).
  const days = ((cookie?.expires ?? 0) * 1000 - Date.now()) / 86_400_000;
  expect(days).toBeGreaterThan(89);
});

test("magic link from the same mail works in another browser", async ({ page, browser }) => {
  const tripName = `Ski ${Date.now()}`;
  const token = await createTrip(tripName);
  const email = uniqueEmail("lena");

  // Browser A (e.g. WhatsApp in-app browser) requests the mail …
  await page.goto(`/i/${token}`);
  await page.getByLabel(en.auth.emailLabel).fill(email);
  await page.getByRole("button", { name: en.auth.sendCode }).click();
  const mail = await waitForAccessMail(email);

  // … browser B (default browser opened from the mail app) uses the link.
  const other = await browser.newContext({ locale: "en-GB" });
  const tab = await other.newPage();
  await tab.goto(mail.magicLink);
  await tab.getByRole("link", { name: en.magic.continue }).click();

  // Returned to the invite, signed in, new account → asked for a name, then joins.
  await expect(tab).toHaveURL(new RegExp(`/i/${token}$`));
  await tab.getByLabel(en.auth.nameLabel).fill("Lena");
  await tab.getByRole("button", { name: en.invite.confirmJoin }).click();
  await expect(tab).toHaveURL(/\/trips$/);
  await expect(tab.getByRole("listitem").filter({ hasText: tripName })).toBeVisible();

  // The link is single-use.
  await tab.goto(mail.magicLink);
  await tab.getByRole("link", { name: en.magic.continue }).click();
  await expect(tab.getByText(en.magic.invalid)).toBeVisible();
  await other.close();
});

test("login with 'keep me signed in' unticked gives a browser-session cookie", async ({ page }) => {
  const email = uniqueEmail("jonas");
  await page.goto("/login");
  await page.getByLabel(en.auth.emailLabel).fill(email);
  await page.getByLabel(en.auth.rememberMe).uncheck();
  await page.getByRole("button", { name: en.auth.sendCode }).click();

  const mail = await waitForAccessMail(email);
  await page.getByLabel(en.auth.codeLabel).fill(mail.code);
  await page.getByLabel(en.auth.nameLabel).fill("Jonas");
  await page.getByRole("button", { name: en.auth.saveName }).click();
  await expect(page).toHaveURL(/\/trips$/);

  const cookie = await sessionCookie(page.context());
  expect(cookie?.expires).toBe(-1); // no Max-Age → ends with the browser session
});

test("wrong code shows an error and keeps the user on the code step", async ({ page }) => {
  const email = uniqueEmail("wrong");
  await page.goto("/login");
  await page.getByLabel(en.auth.emailLabel).fill(email);
  await page.getByRole("button", { name: en.auth.sendCode }).click();
  const mail = await waitForAccessMail(email);
  const wrong = mail.code === "000000" ? "111111" : "000000";

  await page.getByLabel(en.auth.codeLabel).fill(wrong);
  await expect(page.getByText(en.auth.errors.wrongCode)).toBeVisible();
  await expect(page.getByLabel(en.auth.codeLabel)).toBeVisible();
});
