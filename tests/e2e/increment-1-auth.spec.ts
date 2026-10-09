import { expect, test, type APIRequestContext } from "@playwright/test";
import de from "../../messages/de.json" with { type: "json" };
import en from "../../messages/en.json" with { type: "json" };
import { openAccountMenu, signInWithCode, signOutViaMenu, signUp } from "./helpers/auth";
import { createTrip } from "./helpers/db";
import { mailIds, uniqueEmail, waitForAccessMail, waitForCodeMail } from "./helpers/mailpit";

// Increment 1 – sign-in flows complete (F-040, F-041, F-042; Flows A, H; spike-auth §4).
// Browser locale en-US → English UI.

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

const wrongCodeFor = (code: string) => (code === "000000" ? "111111" : "000000");

test.describe("code step (Flow A.1/A.2, ux-spec §4.4)", () => {
  test("switches to the code step at once, focuses the field and records a history step", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.getByLabel(en.auth.emailLabel).fill(uniqueEmail("optimistic"));
    await page.getByRole("button", { name: en.auth.sendCode }).click();
    // Optimistic (M-U5): code step and focus immediately, status line until the server answers.
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(en.auth.codeTitle);
    await expect(page.getByLabel(en.auth.codeLabel)).toBeFocused();
    await expect(
      page.getByRole("status").filter({ hasText: /Code sent to|Sending code/ }),
    ).toBeAttached();
    await expect(page).toHaveURL(/\?step=code$/);
    // Back button returns to the e-mail step, the address is still there.
    await page.goBack();
    await expect(page.getByLabel(en.auth.emailLabel)).toHaveValue(/optimistic-/);
  });

  test("resend countdown, 'nothing there yet?' help after 60 s", async ({ page }) => {
    await page.clock.install();
    await page.goto("/login");
    const email = uniqueEmail("countdown");
    await page.getByLabel(en.auth.emailLabel).fill(email);
    await page.getByRole("button", { name: en.auth.sendCode }).click();
    await waitForAccessMail(email);
    // The countdown button comes first; the help box has a second one once it opens.
    const resend = page.getByRole("button", { name: en.auth.resend, exact: true }).first();
    await expect(resend).toHaveAttribute("aria-disabled", "true");
    await expect(page.getByText(/New code in 0:\d\d/)).toBeVisible();

    await page.clock.fastForward("00:31");
    await expect(resend).not.toHaveAttribute("aria-disabled", "true");
    const help = page.locator("details", { hasText: en.auth.noMail.title });
    await expect(help).not.toHaveAttribute("open", "");
    await page.clock.fastForward("00:30");
    await expect(help).toHaveAttribute("open", "");
    await expect(help.getByRole("link", { name: en.auth.noMail.help })).toHaveAttribute(
      "href",
      "/en/help#code",
    );

    const seen = await mailIds(email);
    await resend.click();
    await expect(page.getByText(en.auth.resent)).toBeVisible();
    const second = await waitForCodeMail(email, { seen });
    await page.getByLabel(en.auth.codeLabel).fill(second.code);
    await expect(page.getByRole("heading", { name: en.auth.nameTitle })).toBeVisible();
  });

  test("remaining attempts from the 2nd wrong code, locked after the 5th", async ({ page }) => {
    await page.goto("/login");
    const email = uniqueEmail("locked");
    await page.getByLabel(en.auth.emailLabel).fill(email);
    await page.getByRole("button", { name: en.auth.sendCode }).click();
    const mail = await waitForAccessMail(email);
    const field = page.getByLabel(en.auth.codeLabel);
    const wrong = wrongCodeFor(mail.code);

    await field.fill(wrong);
    await expect(page.getByText(en.auth.errors.wrongCode, { exact: true })).toBeVisible();
    // Typing over the selected value (fill() alone would not change an identical value).
    const retype = async () => {
      await field.fill("");
      await field.fill(wrong);
    };
    await retype();
    await expect(page.getByText("That code isn’t right. 3 attempts left.")).toBeVisible();
    await retype();
    await expect(page.getByText("2 attempts left.", { exact: false })).toBeVisible();
    await retype();
    await expect(page.getByText("1 attempt left.", { exact: false })).toBeVisible();
    await retype();
    await expect(page.getByText(en.auth.errors.tooManyAttempts)).toBeVisible();
    await expect(field).toBeDisabled();
    await expect(page.getByRole("button", { name: en.auth.requestNewCode }).first()).toBeFocused();
    // «Neuen Code senden» is now the primary action – and the old (right) code is gone.
    const seen = await mailIds(email);
    await page.getByRole("button", { name: en.auth.requestNewCode }).first().click();
    const fresh = await waitForCodeMail(email, { seen });
    await expect(field).toBeEnabled();
    await field.fill(fresh.code);
    await expect(page.getByRole("heading", { name: en.auth.nameTitle })).toBeVisible();
  });
});

test.describe("rate limits per e-mail address (F-041, R-005 follow-up)", () => {
  test("6th code request within an hour is refused with a wait time – UI included", async ({
    page,
    request,
  }) => {
    const email = uniqueEmail("ratelimit");
    for (let i = 0; i < 5; i++) expect((await requestCode(request, email)).status()).toBe(200);
    const sixth = await requestCode(request, email);
    expect(sixth.status()).toBe(429);
    expect(await sixth.json()).toMatchObject({ code: "EMAIL_RATE_LIMITED" });
    expect(Number(sixth.headers()["retry-after"])).toBeGreaterThan(3000);

    // Another address is not affected (per address, not global).
    expect((await requestCode(request, uniqueEmail("other"))).status()).toBe(200);

    // UI: back to the e-mail step, message at the field, focus in the field.
    await page.goto("/login");
    await page.getByLabel(en.auth.emailLabel).fill(email);
    await page.getByRole("button", { name: en.auth.sendCode }).click();
    await expect(page.getByText(/Please wait a moment \(\d+ min\)/)).toBeVisible();
    await expect(page.getByLabel(en.auth.emailLabel)).toBeFocused();
    await expect(page).not.toHaveURL(/step=code/);
  });

  test("10 wrong codes lock the address for verification and new codes", async ({ request }) => {
    const email = uniqueEmail("bruteforce");
    for (let round = 0; round < 2; round++) {
      expect((await requestCode(request, email)).status()).toBe(200);
      // A random 6-digit code is "000000" with p = 1e-6 – good enough for a wrong code.
      const wrong = "000000";
      for (let attempt = 1; attempt <= 5; attempt++) {
        const response = await verifyCode(request, email, wrong);
        const failures = round * 5 + attempt;
        if (failures === 10) {
          expect(response.status()).toBe(429);
          expect(await response.json()).toMatchObject({ code: "EMAIL_LOCKED" });
        } else {
          expect(response.status()).toBe(attempt === 5 ? 403 : 400);
        }
      }
    }
    // While locked: no new code, no verification – for any code.
    const blocked = await requestCode(request, email);
    expect(blocked.status()).toBe(429);
    expect(await blocked.json()).toMatchObject({ code: "EMAIL_LOCKED" });
    expect((await verifyCode(request, email, "123456")).status()).toBe(429);
  });

  test("closed endpoints stay closed over HTTP", async ({ request }) => {
    for (const path of [
      "/sign-up/email",
      "/email-otp/send-verification-otp",
      "/forget-password/email-otp",
      "/request-password-reset",
      "/change-password",
      "/email-otp/request-email-change",
      "/update-user",
    ]) {
      const response = await request.post(`/api/auth${path}`, {
        data: { email: uniqueEmail("closed"), password: "correct horse battery" },
        headers: ORIGIN,
      });
      expect(response.status(), path).toBe(404);
    }
  });
});

test.describe("pendingAuth (Flow A.4)", () => {
  test("a reload on the invite returns to the code step; other pages offer the way back", async ({
    page,
  }) => {
    const tripName = `Porto ${Date.now()}`;
    const token = await createTrip(tripName);
    const email = uniqueEmail("pending");
    await page.goto(`/i/${token}`);
    await page.getByLabel(en.auth.emailLabel).fill(email);
    await page.getByRole("button", { name: en.auth.sendCode }).click();
    const mail = await waitForAccessMail(email);

    // In-app browser drops the tab and lands somewhere else …
    await page.goto("/en");
    const banner = page
      .getByRole("status")
      .filter({ hasText: `You were just joining “${tripName}”.` });
    await expect(banner).toBeVisible();
    await banner.getByRole("link", { name: en.pending.continue }).click();

    // … and continues with the code – no new mail needed.
    await expect(page.getByText(en.auth.welcomeBack)).toBeVisible();
    await expect(page.getByLabel(en.auth.codeLabel)).toBeFocused();
    await page.reload();
    await expect(page.getByText(en.auth.welcomeBack)).toBeVisible();
    await page.getByLabel(en.auth.codeLabel).fill(mail.code);
    await page.getByLabel(en.auth.nameLabel).fill("Pia");
    await page.getByRole("button", { name: en.invite.confirmJoin }).click();
    await expect(page).toHaveURL(/\/trips$/);

    // Done: the flow data is gone (never the code).
    const stored = await page.evaluate(() => localStorage.getItem("ww.pendingAuth"));
    expect(stored).toBeNull();
  });
});

test.describe("password (F-040 optional, F-041, F-042)", () => {
  test("set a password, sign out, sign in with it; wrong and leaked passwords", async ({
    page,
  }) => {
    const email = await signUp(page, "Jonas");
    await openAccountMenu(page, "Jonas");
    await page.getByRole("link", { name: en.menu.account }).click();
    await page.getByRole("link", { name: en.account.signInMethods.setPassword }).click();

    const field = page.getByLabel(en.account.password.label);
    await field.fill("password123");
    await page.getByRole("button", { name: en.common.save }).click();
    await expect(page.getByText(en.auth.errors.passwordCommon)).toBeVisible();
    await field.fill("short");
    await page.getByRole("button", { name: en.common.save }).click();
    await expect(
      page.getByRole("alert").filter({ hasText: en.auth.errors.passwordTooShort }),
    ).toBeVisible();
    await field.fill("Lisbon by night 2027");
    await page.getByRole("button", { name: en.common.save }).click();
    await expect(page.getByRole("status").getByText(en.account.password.saved)).toBeVisible();
    await expect(
      page.getByText(en.account.signInMethods.passwordSet, { exact: true }),
    ).toBeVisible();

    // Sign out (avatar menu) → landing with snackbar (Flow H.2).
    await signOutViaMenu(page, "Jonas");
    await expect(page.getByText(en.common.signedOut)).toBeVisible();

    await page.goto("/login");
    await page.getByRole("button", { name: en.auth.withPassword }).click();
    await page.getByLabel(en.auth.emailLabel).fill(email);
    await page.getByLabel(en.auth.passwordLabel, { exact: true }).fill("wrong password 123");
    await page.getByRole("button", { name: en.auth.signInPassword }).click();
    await expect(page.getByText(en.auth.errors.passwordWrong)).toBeVisible();
    await page.getByLabel(en.auth.passwordLabel, { exact: true }).fill("Lisbon by night 2027");
    await page.getByRole("button", { name: en.auth.signInPassword }).click();
    await expect(page).toHaveURL(/\/trips$/);
  });

  test("forgot password: code + new password, other sessions end, signed in afterwards", async ({
    page,
    browser,
  }) => {
    const email = await signUp(page, "Lena");
    // A second device, signed in with a code.
    const other = await browser.newContext({ locale: "en-GB" });
    const otherPage = await other.newPage();
    await signInWithCode(otherPage, email);

    await signOutViaMenu(page, "Lena");
    await page.goto("/login");
    await page.getByRole("button", { name: en.auth.withPassword }).click();
    await page.getByLabel(en.auth.emailLabel).fill(email);
    await page.getByRole("link", { name: en.auth.forgotPassword }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(en.reset.title);
    await expect(page.getByLabel(en.auth.emailLabel)).toHaveValue(email);
    const seen = await mailIds(email);
    await page.getByRole("button", { name: en.reset.sendCode }).click();
    const mail = await waitForCodeMail(email, { seen, subject: /password reset/ });
    await page.getByLabel(en.auth.codeLabel).fill(mail.code);
    await expect(page.getByLabel(en.reset.newPasswordLabel)).toBeFocused();
    await page.getByLabel(en.reset.newPasswordLabel).fill("Porto in the rain 2028");
    await page.getByRole("button", { name: en.reset.save }).click();
    await expect(page).toHaveURL(/\/trips$/);
    await expect(page.getByText(en.reset.done)).toBeVisible();

    // The other device was signed out (F-042).
    await otherPage.goto("/trips");
    await expect(otherPage).toHaveURL(/\/login/);
    await other.close();
  });

  test("reset for an unknown address answers the same (no enumeration)", async ({ request }) => {
    const response = await request.post("/api/auth/email-otp/request-password-reset", {
      data: { email: uniqueEmail("nobody") },
      headers: ORIGIN,
    });
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ success: true });
  });
});

test.describe("sign out (Flow H.2)", () => {
  test("sign out everywhere ends the sessions of all devices", async ({ page, browser }) => {
    const email = await signUp(page, "Sara");
    const other = await browser.newContext({ locale: "en-GB" });
    const otherPage = await other.newPage();
    await signInWithCode(otherPage, email);

    await page.goto("/account");
    const trigger = page.getByRole("button", { name: en.account.sessions.signOutEverywhere });
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: en.account.sessions.confirmTitle });
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: en.account.sessions.confirm }).click();
    await expect(page).toHaveURL(/\/login$/);

    await otherPage.goto("/trips");
    await expect(otherPage).toHaveURL(/\/login/);
    await other.close();
  });
});

test.describe("language at sign-in (Flow F.3: the latest explicit choice wins)", () => {
  test("a language picked before signing in updates the account", async ({ page, browser }) => {
    const email = await signUp(page, "Mia"); // English account (browser en-US)
    await signOutViaMenu(page, "Mia");

    await page.goto("/login");
    // Footer segment: switch to German while signed out.
    await page.getByRole("contentinfo").getByRole("button", { name: "Deutsch" }).click();
    await expect(page.locator("html")).toHaveAttribute("lang", "de");
    const seen = await mailIds(email);
    await page.getByLabel(de.auth.emailLabel).fill(email);
    await page.getByRole("button", { name: de.auth.sendCode }).click();
    const mail = await waitForCodeMail(email, { seen });
    // Existing account: mail in the account language at the time of the request (en).
    expect(mail.subject).toBe(`${mail.code} is your code for When do we go?`);
    await page.getByLabel(de.auth.codeLabel).fill(mail.code);
    await expect(page).toHaveURL(/\/trips$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(de.trips.title);

    // Another device (English browser) now gets German from the account.
    const other = await browser.newContext({ locale: "en-US" });
    const otherPage = await other.newPage();
    const nextSeen = await mailIds(email);
    await otherPage.goto("/login");
    await otherPage.getByLabel(en.auth.emailLabel).fill(email);
    await otherPage.getByRole("button", { name: en.auth.sendCode }).click();
    const second = await waitForCodeMail(email, { seen: nextSeen });
    expect(second.subject).toBe(`${second.code} ist dein Code für Wir wollen weg`);
    await otherPage.getByLabel(en.auth.codeLabel).fill(second.code);
    await expect(otherPage).toHaveURL(/\/trips$/, { timeout: 15_000 });
    await expect(otherPage.getByRole("heading", { level: 1 })).toHaveText(de.trips.title);
    await other.close();
  });
});
