import { expect, test } from "@playwright/test";
import de from "../../messages/de.json" with { type: "json" };
import en from "../../messages/en.json" with { type: "json" };
import { openAccountMenu, signUp } from "./helpers/auth";
import { expectNoSeriousAxeViolations } from "./helpers/axe";
import { uniqueEmail } from "./helpers/mailpit";

// Increment 1 – help page W15 (F-051), footer (R-018), axe for the new pages.

test.describe("help page (F-051)", () => {
  test("German and English pages with hreflang, anchors open and focus the question", async ({
    page,
  }) => {
    await page.goto("/de/hilfe#bewegung");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(de.help.title);
    await expect(page).toHaveTitle(`${de.help.title} · Wir wollen weg`);
    const motion = page.locator("details#bewegung");
    await expect(motion).toHaveAttribute("open", "");
    await expect(motion.locator("summary")).toBeFocused();
    await expect(motion.getByText(de.help.topics.motion.a)).toBeVisible();
    await expect(motion.getByRole("link", { name: de.help.topics.motion.action })).toHaveAttribute(
      "href",
      "/account",
    );
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute(
      "href",
      /\/en\/help$/,
    );

    // Hash change on the page opens the next question.
    await page.evaluate(() => {
      window.location.hash = "code";
    });
    await expect(page.locator("details#code")).toHaveAttribute("open", "");
    await expect(page.locator("details#code summary")).toBeFocused();

    // Language switch goes to the counterpart; wrong-language paths redirect.
    await page.getByRole("contentinfo").getByRole("link", { name: "English" }).click();
    await expect(page).toHaveURL(/\/en\/help$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(en.help.title);
    await page.goto("/en/hilfe");
    await expect(page).toHaveURL(/\/en\/help$/);
    await expect(page.getByText(en.help.contactTitle)).toBeVisible();
    await expect(page.getByRole("link", { name: "hallo@example.org" })).toHaveAttribute(
      "href",
      "mailto:hallo@example.org",
    );
  });

  test("every question opens with ≥ 44 px targets and no horizontal scrolling", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto("/en/help");
    const summaries = page.locator("details summary");
    expect(await summaries.count()).toBeGreaterThanOrEqual(9);
    for (const summary of await summaries.all()) {
      const box = await summary.boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
    }
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow).toBe(false);
  });

  test("help is linked from the footer, the code step and the avatar menu", async ({ page }) => {
    await page.goto("/login");
    await expect(
      page.getByRole("contentinfo").getByRole("link", { name: en.common.help }),
    ).toHaveAttribute("href", "/en/help");
    await page.getByLabel(en.auth.emailLabel).fill(uniqueEmail("helplink"));
    await page.getByRole("button", { name: en.auth.sendCode }).click();
    await page.getByText(en.auth.noMail.title).click();
    await expect(page.getByRole("link", { name: en.auth.noMail.help })).toHaveAttribute(
      "href",
      "/en/help#code",
    );

    // A fresh flow (the pending code step above would otherwise be restored, A.4).
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await signUp(page, "Ida");
    await openAccountMenu(page, "Ida");
    const menuHelp = page.getByRole("banner").getByRole("link", { name: en.menu.help });
    await expect(menuHelp).toHaveAttribute("href", "/en/help");
    await menuHelp.click();
    await expect(page).toHaveURL(/\/en\/help$/);
  });
});

test.describe("footer (R-018)", () => {
  test("help link and language segment on every page frame", async ({ page }) => {
    for (const path of ["/login", "/en", "/i/does-not-exist", "/login/reset", "/en/help"]) {
      await page.goto(path);
      const footer = page.getByRole("contentinfo");
      await expect(footer.getByRole("link", { name: en.common.help }), path).toBeVisible();
      await expect(
        footer.getByRole("group", { name: en.common.languageLabel }),
        path,
      ).toBeVisible();
      await expect(footer.locator('[aria-current="true"]'), path).toHaveText("English");
    }
    // App route: the segment switches via cookie and keeps the page.
    await page.goto("/login");
    await page.getByRole("contentinfo").getByRole("button", { name: "Deutsch" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(de.auth.loginTitle);
    await expect(page.getByRole("contentinfo").locator('[aria-current="true"]')).toHaveText(
      "Deutsch",
    );
    // Focus stays on the switch (Flow F.3).
    await expect(
      page.getByRole("contentinfo").getByRole("button", { name: "Deutsch" }),
    ).toBeFocused();
  });
});

for (const colorScheme of ["light", "dark"] as const) {
  test.describe(`axe – increment 1 pages – ${colorScheme}`, () => {
    test.use({ colorScheme, reducedMotion: "reduce" });

    test("public pages and sign-in states", async ({ page }) => {
      for (const path of ["/de/hilfe", "/en/help", "/login/reset"]) {
        await page.goto(path);
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
        await expectNoSeriousAxeViolations(page, `${colorScheme} ${path}`);
      }
      await page.goto("/de/hilfe#code");
      await expect(page.locator("details#code")).toHaveAttribute("open", "");
      await expectNoSeriousAxeViolations(page, `${colorScheme} help open`);

      await page.goto("/login");
      await page.getByRole("button", { name: en.auth.withPassword }).click();
      await expectNoSeriousAxeViolations(page, `${colorScheme} login password`);
    });

    test("account pages", async ({ page }) => {
      await signUp(page, "Axe");
      for (const path of ["/account", "/account/email", "/account/password", "/trips"]) {
        await page.goto(path);
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
        await expectNoSeriousAxeViolations(page, `${colorScheme} ${path}`);
      }
      await openAccountMenu(page, "Axe");
      await expectNoSeriousAxeViolations(page, `${colorScheme} avatar menu`);
    });
  });
}
