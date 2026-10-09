import { expect, test } from "@playwright/test";
import de from "../../messages/de.json" with { type: "json" };
import en from "../../messages/en.json" with { type: "json" };
import { expectNoSeriousAxeViolations } from "./helpers/axe";

test.describe("landing page", () => {
  test("German landing uses the German product name", async ({ page }) => {
    await page.goto("/de");
    await expect(page).toHaveTitle("Wir wollen weg");
    await expect(page.locator("html")).toHaveAttribute("lang", "de");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      `${de.landing.titleLead} ${de.landing.titleHighlight}`,
    );
  });

  test("English landing uses the English product name", async ({ page }) => {
    await page.goto("/en");
    await expect(page).toHaveTitle("When do we go?");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      `${en.landing.titleLead} ${en.landing.titleHighlight}`,
    );
  });

  test("language switch links to the other locale", async ({ page }) => {
    await page.goto("/de");
    await page.getByRole("banner").getByRole("link", { name: de.common.switchLanguage }).click();
    await expect(page).toHaveURL(/\/en$/);
  });

  test("no serious or critical axe violations", async ({ page }) => {
    for (const path of ["/de", "/en", "/login"]) {
      await page.goto(path);
      await expectNoSeriousAxeViolations(page, path);
    }
  });
});

test.describe("root redirect by Accept-Language", () => {
  test.use({ locale: "de-DE" });
  test("/ → /de for German browsers", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/de$/);
  });
});
