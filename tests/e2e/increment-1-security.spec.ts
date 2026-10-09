import { expect, test, type APIRequestContext, type Page } from "@playwright/test";
import en from "../../messages/en.json" with { type: "json" };
import { openAccountMenu, signOutViaMenu, signUp } from "./helpers/auth";
import { expectNoSeriousAxeViolations } from "./helpers/axe";
import { expireReauthentication } from "./helpers/db";
import { mailIds, uniqueEmail, waitForAccessMail, waitForCodeMail } from "./helpers/mailpit";

// Security fixes after the increment-1 review: R-021 (lockout DoS), R-022 (atomic limits),
// R-023 (re-authentication for password changes), R-027 (mailbox budget), R-031 (menu).

const ORIGIN = { origin: "http://localhost:3000" };

function requestCode(request: APIRequestContext, email: string) {
  return request.post("/api/auth/email-access/request", {
    data: { email, callbackURL: "/trips" },
    headers: ORIGIN,
  });
}

function verifyCode(request: APIRequestContext, email: string, otp: string) {
  return request.post("/api/auth/sign-in/email-otp", { data: { email, otp }, headers: ORIGIN });
}

function signInWithPassword(request: APIRequestContext, email: string, password: string) {
  return request.post("/api/auth/sign-in/email", {
    data: { email, password },
    headers: ORIGIN,
  });
}

const wrongCodeFor = (code: string) => (code === "000000" ? "111111" : "000000");

/** Opens the magic link from a mail and confirms – lands signed in on /trips. */
async function useMagicLink(page: Page, link: string) {
  await page.goto(link);
  await page.getByRole("button", { name: en.magic.continue }).click();
  // Generous: under parallel load (Argon2 in other tests) the sign-in can take a few seconds.
  await expect(page).toHaveURL(/\/trips$/, { timeout: 15_000 });
}

test.describe("R-021: nobody can lock someone else out", () => {
  test("wrong codes without a pending code never lock the address", async ({ request }) => {
    const email = uniqueEmail("victim");
    // The attack from the review: 10+ guesses for an address that has no code pending.
    for (let i = 0; i < 12; i++) {
      const response = await verifyCode(request, email, "000000");
      expect(response.status(), `guess ${i + 1}`).toBe(400);
      expect(await response.json()).toMatchObject({ code: "INVALID_OTP" });
    }
    // The real person is not affected: code mail and code sign-in work.
    expect((await requestCode(request, email)).status()).toBe(200);
    const mail = await waitForAccessMail(email);
    expect((await verifyCode(request, email, mail.code)).status()).toBe(200);
  });

  test("a locked address still gets mails; the magic link signs in and lifts the lock", async ({
    page,
    browser,
    request,
  }) => {
    // Victim with an account and a password.
    const setup = await browser.newContext({ locale: "en-US" });
    const setupPage = await setup.newPage();
    const email = await signUp(setupPage, "Mara");
    await setupPage.goto("/account/password");
    await setupPage.getByLabel(en.account.password.label).fill("Harbour lights 2029");
    await setupPage.getByRole("button", { name: en.common.save }).click();
    await expect(setupPage.getByRole("status").getByText(en.account.password.saved)).toBeVisible();
    await setup.close();

    // Attacker: 10 real guesses (two pending codes – each code mail goes to the victim).
    for (let round = 0; round < 2; round++) {
      const seen = await mailIds(email);
      expect((await requestCode(request, email)).status()).toBe(200);
      const mail = await waitForCodeMail(email, { seen });
      const wrong = wrongCodeFor(mail.code);
      for (let attempt = 1; attempt <= 5; attempt++) {
        const response = await verifyCode(request, email, wrong);
        if (round === 1 && attempt === 5) {
          expect(response.status()).toBe(429);
          expect(await response.json()).toMatchObject({ code: "EMAIL_LOCKED" });
        } else expect(response.status()).toBe(attempt === 5 ? 403 : 400);
      }
    }
    // Locked: code entry and password are paused …
    expect((await signInWithPassword(request, email, "Harbour lights 2029")).status()).toBe(429);

    // … but the victim still gets a mail (UI: e-mail → code step).
    await page.goto("/login");
    const seen = await mailIds(email);
    await page.getByLabel(en.auth.emailLabel).fill(email);
    await page.getByRole("button", { name: en.auth.sendCode }).click();
    const mail = await waitForCodeMail(email, { seen });
    expect(mail.code).toMatch(/^\d{6}$/);
    await page.getByLabel(en.auth.codeLabel).fill(mail.code);
    await expect(page.getByText(en.auth.errors.lockedUseLink)).toBeVisible();

    // The link in that mail always works – and lifts the lock.
    const link = /^(https?:\/\/\S+\/auth\/magic\?\S+)$/m.exec(mail.text)?.[1];
    expect(link, "magic link in the mail").toBeDefined();
    await useMagicLink(page, link ?? "");
    expect((await signInWithPassword(request, email, "Harbour lights 2029")).status()).toBe(200);
  });

  test("password sign-in while locked points to the code link", async ({ page, request }) => {
    const email = uniqueEmail("pwlock");
    // Wrong passwords count for every address alike (no enumeration) – 10 lock it.
    for (let i = 0; i < 10; i++) await signInWithPassword(request, email, `wrong-${i}-password`);
    await page.goto("/login");
    await page.getByRole("button", { name: en.auth.withPassword }).click();
    await page.getByLabel(en.auth.emailLabel).fill(email);
    await page.getByLabel(en.auth.passwordLabel, { exact: true }).fill("whatever 12345");
    await page.getByRole("button", { name: en.auth.signInPassword }).click();
    await expect(
      page.getByText(/Too many failed attempts for this address\. Sign in with a code/),
    ).toBeVisible();
    // The code mail is still possible.
    expect((await requestCode(request, email)).status()).toBe(200);
  });
});

test.describe("R-022: limits hold under parallel requests", () => {
  test("20 parallel code requests send exactly 5 mails", async ({ request }) => {
    const email = uniqueEmail("parallel");
    const responses = await Promise.all(
      Array.from({ length: 20 }, () => requestCode(request, email)),
    );
    const statuses = responses.map((r) => r.status());
    expect(statuses.filter((s) => s === 200)).toHaveLength(5);
    expect(statuses.filter((s) => s === 429)).toHaveLength(15);
  });

  test("25 parallel wrong passwords: only 10 are checked, then locked", async ({ request }) => {
    const email = uniqueEmail("parallel-pw");
    const responses = await Promise.all(
      Array.from({ length: 25 }, (_, i) => signInWithPassword(request, email, `guess ${i} 12345`)),
    );
    const statuses = responses.map((r) => r.status());
    // 9 plain "wrong", the 10th check answers "locked", all others never reach the check.
    expect(statuses.filter((s) => s === 401)).toHaveLength(9);
    expect(statuses.filter((s) => s === 429)).toHaveLength(16);
    expect((await signInWithPassword(request, email, "one more 12345")).status()).toBe(429);
  });
});

test("R-027: plus addresses share one mailbox budget (10 per hour)", async ({ request }) => {
  const base = uniqueEmail("mailbox");
  const [local, domain] = base.split("@");
  const responses = await Promise.all(
    Array.from({ length: 12 }, (_, i) => requestCode(request, `${local}+${i}@${domain}`)),
  );
  const statuses = responses.map((r) => r.status());
  expect(statuses.filter((s) => s === 200)).toHaveLength(10);
  expect(statuses.filter((s) => s === 429)).toHaveLength(2);
  // The exact address shares the mailbox as well.
  expect((await requestCode(request, base)).status()).toBe(429);
});

test.describe("R-023: changing the password needs a fresh confirmation", () => {
  test("> 10 min after a code sign-in: confirm with a code first", async ({ page }) => {
    const email = await signUp(page, "Ida");
    await expireReauthentication(email);
    await page.goto("/account/password");
    await expect(page.getByRole("heading", { name: en.account.email.reauthTitle })).toBeVisible();
    await expect(page.getByLabel(en.account.password.label)).toHaveCount(0);

    const seen = await mailIds(email);
    await page.getByRole("button", { name: en.account.email.sendCode }).click();
    const mail = await waitForCodeMail(email, { seen, subject: /confirmation code/ });
    await page.getByLabel(en.auth.codeLabel).fill(mail.code);
    const field = page.getByLabel(en.account.password.label);
    await expect(field).toBeFocused();
    await field.fill("Northern lights 2030");
    await page.getByRole("button", { name: en.common.save }).click();
    await expect(page.getByRole("status").getByText(en.account.password.saved)).toBeVisible();
  });

  test("the server refuses when the confirmation ran out while the form was open", async ({
    page,
  }) => {
    const email = await signUp(page, "Noor");
    await page.goto("/account/password");
    const field = page.getByLabel(en.account.password.label);
    await field.fill("Desert roads 2031");
    await expireReauthentication(email);
    await page.getByRole("button", { name: en.common.save }).click();
    await expect(page.getByText(en.account.email.reauthExpired)).toBeVisible();
    await expect(page.getByRole("heading", { name: en.account.email.reauthTitle })).toBeVisible();
    await expect(page.getByLabel(en.account.password.label)).toHaveCount(0);
  });

  test("a password sign-in is no confirmation – the current password is", async ({ page }) => {
    const email = await signUp(page, "Tom");
    await page.goto("/account/password");
    await page.getByLabel(en.account.password.label).fill("Mountain air 2032");
    await page.getByRole("button", { name: en.common.save }).click();
    await expect(page.getByRole("status").getByText(en.account.password.saved)).toBeVisible();
    // Wait for the redirect to /account: the header re-mounts there and would close a menu
    // opened during the navigation (flaky with --repeat-each).
    await expect(page).toHaveURL(/\/account$/);
    await signOutViaMenu(page, "Tom");

    await page.goto("/login");
    await page.getByRole("button", { name: en.auth.withPassword }).click();
    await page.getByLabel(en.auth.emailLabel).fill(email);
    await page.getByLabel(en.auth.passwordLabel, { exact: true }).fill("Mountain air 2032");
    await page.getByRole("button", { name: en.auth.signInPassword }).click();
    await expect(page).toHaveURL(/\/trips$/);

    // Dark mode: the «confirm with password» text button had the native grey button look.
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/account/password");
    await expect(page.getByRole("heading", { name: en.account.email.reauthTitle })).toBeVisible();
    await expectNoSeriousAxeViolations(page, "re-auth step (dark, with password)");
    await page.getByRole("button", { name: en.account.email.usePassword }).click();
    await page.getByLabel(en.auth.passwordLabel, { exact: true }).fill("wrong password 999");
    await page.getByRole("button", { name: en.account.email.confirm, exact: true }).click();
    await expect(page.getByText(en.auth.errors.passwordWrong)).toBeVisible();
    await page.getByLabel(en.auth.passwordLabel, { exact: true }).fill("Mountain air 2032");
    await page.getByRole("button", { name: en.account.email.confirm, exact: true }).click();
    await expect(page.getByLabel(en.account.password.label)).toBeVisible();
    await page.getByRole("button", { name: en.account.password.remove }).click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: en.account.password.remove })
      .click();
    await expect(page.getByRole("status").getByText(en.account.password.removed)).toBeVisible();
  });
});

test("R-031: the avatar menu closes when keyboard focus leaves it", async ({ page }) => {
  await signUp(page, "Lio");
  await openAccountMenu(page, "Lio");
  const trigger = page.getByRole("button", { name: en.menu.open.replace("{name}", "Lio") });
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await trigger.focus();
  // Five entries in the panel, the sixth Tab leaves it.
  for (let i = 0; i < 6; i++) await page.keyboard.press("Tab");
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  const panelId = await trigger.getAttribute("aria-controls");
  await expect(page.locator(`[id="${panelId}"]`)).toBeHidden();
  // Focus stays where the user moved it (not pulled back to the button).
  await expect(trigger).not.toBeFocused();
});
