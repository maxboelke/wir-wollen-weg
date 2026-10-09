import { expect, type Page } from "@playwright/test";
import en from "../../../messages/en.json" with { type: "json" };
import { mailIds, uniqueEmail, waitForAccessMail, waitForCodeMail } from "./mailpit";

/** Signs up a new account on /login (English UI) and lands on /trips. */
export async function signUp(
  page: Page,
  name = "Kemal",
  email = uniqueEmail("user"),
): Promise<string> {
  await page.goto("/login");
  await page.getByLabel(en.auth.emailLabel).fill(email);
  await page.getByRole("button", { name: en.auth.sendCode }).click();
  const mail = await waitForAccessMail(email);
  await page.getByLabel(en.auth.codeLabel).fill(mail.code);
  await page.getByLabel(en.auth.nameLabel).fill(name);
  await page.getByRole("button", { name: en.auth.saveName }).click();
  await expect(page).toHaveURL(/\/trips$/);
  return email;
}

/** Signs an existing account in with a code (no name step). */
export async function signInWithCode(page: Page, email: string): Promise<void> {
  const seen = await mailIds(email);
  await page.goto("/login");
  await page.getByLabel(en.auth.emailLabel).fill(email);
  await page.getByRole("button", { name: en.auth.sendCode }).click();
  const mail = await waitForCodeMail(email, { seen });
  await page.getByLabel(en.auth.codeLabel).fill(mail.code);
  await expect(page).toHaveURL(/\/trips$/);
}

/** Opens the avatar menu (signed in). */
export async function openAccountMenu(page: Page, name: string): Promise<void> {
  await page.getByRole("button", { name: en.menu.open.replace("{name}", name) }).click();
}

/** Signs out via the avatar menu and waits for the landing page (Flow H.2). */
export async function signOutViaMenu(page: Page, name: string): Promise<void> {
  await openAccountMenu(page, name);
  await page.getByRole("banner").getByRole("button", { name: en.menu.signOut }).click();
  await expect(page).toHaveURL(/\/(en|de)$/);
}

/** W03 on phones: the e-mail form opens after «Join» (from 600 px it is visible at once). */
export async function openJoinForm(page: Page): Promise<void> {
  const cta = page.getByRole("button", { name: en.invite.joinCta, exact: true });
  if (await cta.isVisible()) await cta.click();
}
