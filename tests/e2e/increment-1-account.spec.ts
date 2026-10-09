import { expect, test } from "@playwright/test";
import de from "../../messages/de.json" with { type: "json" };
import en from "../../messages/en.json" with { type: "json" };
import { openAccountMenu, signInWithCode, signUp } from "./helpers/auth";
import { mailIds, uniqueEmail, waitForCodeMail } from "./helpers/mailpit";

// Increment 1 – account settings W13 (F-043, F-046, F-052, F-042 e-mail change).

test.describe("W13 'Reduce motion' (Q17 a, ux-spec §7.5)", () => {
  test.use({ reducedMotion: "no-preference" });

  test("the account switch sets data-motion at once, persists and follows the account", async ({
    page,
    browser,
  }) => {
    const email = await signUp(page, "Kemal");
    await page.goto("/account");
    const html = page.locator("html");
    await expect(html).not.toHaveAttribute("data-motion", "reduce");
    const toggle = page.getByRole("switch", { name: en.settings.motion.label });
    await expect(toggle).toHaveAttribute("aria-checked", "false");
    await expect(page.getByText(en.settings.motion.off, { exact: false })).toBeVisible();

    await toggle.press("Space");
    await expect(html).toHaveAttribute("data-motion", "reduce");
    await expect(toggle).toHaveAttribute("aria-checked", "true");
    await expect(toggle).toBeFocused();
    await expect(page.getByRole("status").getByText(en.common.saved)).toBeVisible();
    const cookies = await page.context().cookies();
    expect(cookies.find((c) => c.name === "ww-motion")?.value).toBe("reduce");

    // Saved in the account: a reload and another device (no cookie) start reduced.
    await page.reload();
    await expect(html).toHaveAttribute("data-motion", "reduce");
    const other = await browser.newContext({ locale: "en-GB", reducedMotion: "no-preference" });
    const otherPage = await other.newPage();
    await signInWithCode(otherPage, email);
    await expect(otherPage.locator("html")).toHaveAttribute("data-motion", "reduce");
    await other.close();

    // Off again: follows the device (no reduction here).
    await page.getByRole("switch", { name: en.settings.motion.label }).click();
    await expect(html).not.toHaveAttribute("data-motion", "reduce");
  });

  test.describe("device reduces motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("switch shows 'on', is not operable and says why", async ({ page }) => {
      await signUp(page, "Ana");
      await page.goto("/account");
      const toggle = page.getByRole("switch", { name: en.settings.motion.label });
      await expect(toggle).toHaveAttribute("aria-checked", "true");
      await expect(toggle).toHaveAttribute("aria-disabled", "true");
      await expect(page.getByText(en.settings.motion.device)).toBeVisible();
      // aria-disabled: Playwright would wait for "enabled" – dispatch the tap directly.
      await toggle.dispatchEvent("click");
      await expect(toggle).toHaveAttribute("aria-checked", "true");
    });
  });
});

test.describe("W13 language & region (F-046)", () => {
  test("language radio switches the UI and is kept; region drives the date preview", async ({
    page,
  }) => {
    await signUp(page, "Lea"); // browser en-US → region guessed as US at sign-up
    await page.goto("/account");
    await expect(page.getByLabel(en.account.language.countryLabel)).toHaveValue("US");

    // Region separate from the language: United Kingdom → UK format, Monday start.
    await page.getByLabel(en.account.language.countryLabel).selectOption("GB");
    await expect(page.getByText(/^Dates look like this: Fri,? 2 July 2027$/)).toBeVisible();
    await expect(page.getByLabel("Automatic (Monday)")).toBeChecked();
    await page.getByLabel(en.account.language.countryLabel).selectOption("US");
    await expect(page.getByText("Dates look like this: Fri, July 2, 2027")).toBeVisible();
    await expect(page.getByLabel("Automatic (Sunday)")).toBeChecked();
    await expect(page.getByRole("status").getByText(en.common.saved)).toBeVisible();
    await page.getByLabel(en.account.language.weekStartMon).check();

    // German UI, US region stays.
    await page.getByRole("radio", { name: "Deutsch" }).check();
    await expect(page.locator("html")).toHaveAttribute("lang", "de");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(de.account.title);
    await expect(page.getByText("So sehen Daten aus: Fr., 2. Juli 2027")).toBeVisible();
    await expect(page.getByLabel(de.account.language.countryLabel)).toHaveValue("US");
    await expect(page.getByLabel(de.account.language.weekStartMon)).toBeChecked();

    // Holiday region for Germany: states appear, saved immediately.
    await page.getByLabel(de.account.language.countryLabel).selectOption("DE");
    await page.getByLabel(de.account.language.subdivisionLabel).selectOption("DE-BY");
    await expect(page.getByRole("status").getByText(de.common.saved)).toBeVisible();
    await page.reload();
    await expect(page.getByLabel(de.account.language.subdivisionLabel)).toHaveValue("DE-BY");
    await expect(page.getByText("So sehen Daten aus: Fr., 2. Juli 2027")).toBeVisible();
  });
});

test.describe("W13 profile", () => {
  test("display name is saved", async ({ page }) => {
    await signUp(page, "Tom");
    await page.goto("/account");
    await page.getByLabel(en.account.profile.nameLabel).fill("Tom B.");
    await page.getByRole("button", { name: en.common.save }).click();
    await expect(page.getByRole("status").getByText(en.account.profile.saved)).toBeVisible();
    await openAccountMenu(page, "Tom B.");
  });
});

test.describe("e-mail change (Flow I.2, F-042)", () => {
  test("confirm with a code, code to the new address, info mail to the old one", async ({
    page,
  }) => {
    const oldEmail = await signUp(page, "Kim");
    const newEmail = uniqueEmail("kim-new");
    await page.goto("/account");
    await page.getByRole("link", { name: en.account.signInMethods.changeEmail }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(en.account.email.title);

    const seen = await mailIds(oldEmail);
    await page.getByRole("button", { name: en.account.email.sendCode }).click();
    const reauth = await waitForCodeMail(oldEmail, { seen, subject: /confirmation code/ });
    await page.getByLabel(en.auth.codeLabel).fill(reauth.code);

    const newField = page.getByLabel(en.account.email.newLabel);
    await expect(newField).toBeFocused();
    await newField.fill(oldEmail);
    await page.getByRole("button", { name: en.account.email.sendNew }).click();
    await expect(page.getByText(en.account.email.sameEmail)).toBeVisible();
    await newField.fill(newEmail);
    await page.getByRole("button", { name: en.account.email.sendNew }).click();
    const confirm = await waitForCodeMail(newEmail, { subject: /new email address/ });
    await page.getByLabel(en.auth.codeLabel).fill(confirm.code);
    await expect(page.getByText(en.account.email.done.replace("{email}", newEmail))).toBeVisible();

    const notice = await waitForCodeMail(oldEmail, { subject: /was changed/ });
    expect(notice.text).toContain(`${newEmail.slice(0, 1)}•••@example.org`);
    await page.goto("/account");
    await expect(page.getByText(newEmail)).toBeVisible();
  });
});
