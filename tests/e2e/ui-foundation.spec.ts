import { expect, test, type Page } from "@playwright/test";
import de from "../../messages/de.json" with { type: "json" };
import en from "../../messages/en.json" with { type: "json" };
import { expectNoSeriousAxeViolations } from "./helpers/axe";
import { createTrip } from "./helpers/db";
import { uniqueEmail, waitForAccessMail } from "./helpers/mailpit";

// Step 0a "UI foundation": look & feel 2.0 (direction B), motion basics (F-052),
// findings R-007, R-013. Browser locale en-US → English UI on language-neutral routes.

for (const colorScheme of ["light", "dark"] as const) {
  test.describe(`axe – ${colorScheme}`, () => {
    test.use({ colorScheme, reducedMotion: "reduce" });

    test("restyled pages have no serious or critical violations", async ({ page }) => {
      const token = await createTrip(`Axe ${Date.now()}`);
      for (const path of [
        "/de",
        "/en",
        "/login",
        `/i/${token}`,
        "/i/does-not-exist",
        "/auth/magic?token=x",
        "/dev/ui",
      ]) {
        await page.goto(path);
        await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
        await expectNoSeriousAxeViolations(page, `${colorScheme} ${path}`);
      }
    });

    test("code step has no serious or critical violations", async ({ page }) => {
      await page.goto("/login");
      await page.getByLabel(en.auth.emailLabel).fill(uniqueEmail("axe"));
      await page.getByRole("button", { name: en.auth.sendCode }).click();
      await expect(page.getByLabel(en.auth.codeLabel)).toBeFocused();
      await page.keyboard.type("123");
      await expectNoSeriousAxeViolations(page, `${colorScheme} code step`);
    });
  });
}

test("R-007: an invalid invite has a level-1 heading", async ({ page }) => {
  await page.goto("/i/does-not-exist");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(en.invite.invalidTitle);
  await expect(page.getByText(en.invite.invalid)).toBeVisible();
});

test("invite card shows only the organiser's first name, no initials", async ({ page }) => {
  const token = await createTrip(`Card ${Date.now()}`);
  await page.goto(`/i/${token}`);
  const card = page.locator("article", { has: page.getByRole("heading", { level: 1 }) });
  await expect(card.getByText(en.invite.groupTrip)).toBeVisible();
  // Only the organiser's first name, the count – no other names (F-003).
  await expect(card.getByText("by Lena")).toBeVisible();
  await expect(card.getByText("Lena is already in")).toBeVisible();
});

test("R-013: a network failure on the magic-link page shows inline above the button", async ({
  page,
}) => {
  const email = uniqueEmail("offline");
  await page.goto("/login");
  await page.getByLabel(en.auth.emailLabel).fill(email);
  await page.getByRole("button", { name: en.auth.sendCode }).click();
  const mail = await waitForAccessMail(email);

  await page.goto(mail.magicLink);
  await page.route("**/auth/magic**", (route) =>
    route.request().method() === "POST" ? route.abort("internetdisconnected") : route.continue(),
  );
  await page.getByRole("button", { name: en.magic.continue }).click();
  await expect(page.getByText(en.magic.failed)).toBeVisible();
  // Still the same card (no error page), heading and a retry button.
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(en.magic.heading);
  const retry = page.getByRole("button", { name: en.magic.retry });
  await expect(retry).toBeVisible();

  // Back online: the retry signs in.
  await page.unroute("**/auth/magic**");
  await retry.click();
  await expect(page.getByRole("heading", { name: en.auth.nameTitle })).toBeVisible();
});

test.describe("fonts", () => {
  test("self-hosted fonts load from our origin with tabular digits", async ({ page }) => {
    const external: string[] = [];
    page.on("request", (request) => {
      const url = new URL(request.url());
      if (url.hostname !== "localhost" && url.hostname !== "127.0.0.1") external.push(url.href);
    });
    await page.goto("/dev/ui");
    await page.evaluate(() => document.fonts.ready);
    const loaded = await page.evaluate(() => ({
      figtree: document.fonts.check('700 16px "Figtree"'),
      jakarta: document.fonts.check('800 16px "Plus Jakarta Sans"'),
    }));
    expect(loaded).toEqual({ figtree: true, jakarta: true });
    expect(external).toEqual([]);

    // design-system §5.1: "1111" and "0000" in Plus Jakarta Sans 800 must be equally wide.
    const probe = page.getByTestId("tnum-probe").first();
    const ones = await probe
      .locator('[data-digits="1111"]')
      .evaluate((el) => el.getBoundingClientRect().width);
    const zeros = await probe
      .locator('[data-digits="0000"]')
      .evaluate((el) => el.getBoundingClientRect().width);
    expect(Math.abs(ones - zeros)).toBeLessThan(0.5);
  });
});

test.describe("brand assets", () => {
  test("favicon, icon sprite and per-language manifest are served", async ({ request }) => {
    for (const path of ["/favicon.ico", "/favicon.svg", "/icons.svg", "/apple-touch-icon.png"]) {
      expect((await request.get(path)).status(), path).toBe(200);
    }
    const manifest = (await (await request.get("/manifest-en.webmanifest")).json()) as {
      short_name: string;
      theme_color: string;
      background_color: string;
    };
    expect(manifest).toMatchObject({
      short_name: "When do we go?",
      theme_color: "#2B2266",
      background_color: "#F4F2FB",
    });
    const manifestDe = (await (await request.get("/manifest-de.webmanifest")).json()) as {
      short_name: string;
    };
    expect(manifestDe.short_name).toBe(de.app.name);
  });

  test("/de links the German manifest", async ({ page }) => {
    await page.goto("/de");
    await expect(page.locator('link[rel="manifest"]')).toHaveAttribute(
      "href",
      "/manifest-de.webmanifest",
    );
  });
});

/** Records the keyframes of every WAAPI animation started on the page. */
async function recordAnimations(page: Page) {
  await page.evaluate(() => {
    const seen: string[] = [];
    (window as unknown as { __seen: string[] }).__seen = seen;
    // eslint-disable-next-line @typescript-eslint/unbound-method -- re-invoked with the element as `this`
    const original = Element.prototype.animate;
    Element.prototype.animate = function (keyframes, options) {
      seen.push(JSON.stringify(keyframes));
      return original.call(this, keyframes, options);
    };
  });
  return () => page.evaluate(() => (window as unknown as { __seen: string[] }).__seen);
}

test.describe("reduced motion (F-052)", () => {
  test.describe("system setting", () => {
    test.use({ reducedMotion: "reduce" });

    test("sets data-motion; the code field neither shakes nor scales", async ({ page }) => {
      await page.goto("/dev/ui");
      await expect(page.locator("html")).toHaveAttribute("data-motion", "reduce");
      const seen = await recordAnimations(page);
      const field = page.getByLabel(en.auth.codeLabel, { exact: true }).first();
      await field.fill("111111"); // wrong code in the showcase demo (right: 123456)
      await expect(field).toHaveAttribute("aria-invalid", "true");
      const moving = (await seen()).filter((f) => f.includes("translate") || f.includes("scale"));
      expect(moving).toEqual([]);
    });
  });

  test.describe("full motion", () => {
    test.use({ reducedMotion: "no-preference" });

    test("digits pop in and a wrong code shakes the boxes once", async ({ page }) => {
      await page.goto("/dev/ui");
      await expect(page.locator("html")).not.toHaveAttribute("data-motion", "reduce");
      const seen = await recordAnimations(page);
      const field = page.getByLabel(en.auth.codeLabel, { exact: true }).first();
      await field.fill("111111");
      await expect(field).toHaveAttribute("aria-invalid", "true");
      const frames = await seen();
      expect(frames.some((f) => f.includes("scale(0.8)"))).toBe(true);
      expect(frames.filter((f) => f.includes("translateX(-4px)"))).toHaveLength(1);
    });

    test("the account choice (cookie) reduces motion without a system setting", async ({
      page,
      context,
    }) => {
      await context.addCookies([{ name: "ww-motion", value: "reduce", url: "http://localhost" }]);
      await page.goto("/de");
      await expect(page.locator("html")).toHaveAttribute("data-motion", "reduce");
    });
  });
});
