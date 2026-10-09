import { expect, test, type Page } from "@playwright/test";
import en from "../../messages/en.json" with { type: "json" };
import { expectNoSeriousAxeViolations } from "./helpers/axe";
import { signUp } from "./helpers/auth";
import { seedTrip, tripRow } from "./helpers/db";
import { createTripViaUi, openTripMenu } from "./helpers/trips";

// Increment 2: share fallback (F-002), accessibility (axe light/dark), motion (F-052,
// G-02/G-11/W04-01) and R-017 for the new server-rendered pages.

test.describe("F-002 share and copy", () => {
  test("without Web Share: «Copy text» is primary, direct links are offered", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "share", { value: undefined, configurable: true });
    });
    await signUp(page, "Sam");
    await createTripViaUi(page, `Copy ${String(Date.now())}`);
    await expect(page.getByRole("button", { name: en.share.share })).toHaveCount(0);
    await expect(page.getByRole("link", { name: en.share.whatsapp })).toHaveAttribute(
      "href",
      /^https:\/\/wa\.me\/\?text=When%20do%20we%20go%3F/,
    );
    await expect(page.getByRole("link", { name: en.share.telegram })).toBeVisible();
    await expect(page.getByRole("link", { name: en.share.email })).toHaveAttribute(
      "href",
      /^mailto:/,
    );
  });

  test("copy falls back to execCommand, then to selecting the text (no clipboard rights)", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      // Clipboard API refuses (no permission / insecure context in the demo) …
      Object.defineProperty(navigator, "clipboard", {
        value: { writeText: () => Promise.reject(new Error("denied")) },
        configurable: true,
      });
      (window as unknown as { __copy: boolean }).__copy = true;
      // eslint-disable-next-line @typescript-eslint/no-deprecated -- the fallback under test
      document.execCommand = () => (window as unknown as { __copy: boolean }).__copy;
    });
    await signUp(page, "Tom");
    await createTripViaUi(page, `Fallback ${String(Date.now())}`);
    await page.getByRole("button", { name: en.share.copyText }).click();
    await expect(page.getByRole("button", { name: en.share.copied })).toBeVisible();
    await expect(page.getByText(en.share.copiedStatus)).toBeAttached();
    // Label returns after 2 s (G-11).
    await expect(page.getByRole("button", { name: en.share.copyText })).toBeVisible({
      timeout: 4000,
    });

    // … and also execCommand fails: the text is selected with a hint.
    await page.evaluate(() => {
      (window as unknown as { __copy: boolean }).__copy = false;
    });
    await page.getByRole("button", { name: en.share.copyLink }).click();
    // Visible hint (plus the same sentence in the status region for screen readers).
    await expect(page.getByText(en.share.copyFailed).first()).toBeVisible();
    const selected = await page.evaluate(() => {
      const active = document.activeElement as HTMLInputElement | null;
      return active ? active.value.slice(active.selectionStart ?? 0, active.selectionEnd ?? 0) : "";
    });
    expect(selected).toMatch(/\/i\/[\w-]{43}$/);
  });

  test("Web Share sends the edited text; switching the language asks first", async ({ page }) => {
    await page.addInitScript(() => {
      const shared: unknown[] = [];
      (window as unknown as { __shared: unknown[] }).__shared = shared;
      Object.defineProperty(navigator, "share", {
        value: (data: unknown) => {
          shared.push(data);
          return Promise.resolve();
        },
        configurable: true,
      });
      Object.defineProperty(navigator, "canShare", { value: () => true, configurable: true });
    });
    await signUp(page, "Uma");
    await createTripViaUi(page, `Share ${String(Date.now())}`);
    const text = page.getByLabel(en.share.messageLabel);
    await text.fill("Join us! http://example.org");
    // Edited text: the radio stays on English until the switch is confirmed.
    await page.getByRole("radio", { name: "Deutsch" }).click();
    await expect(page.getByRole("heading", { name: en.share.languageSwitchTitle })).toBeVisible();
    await page.getByRole("button", { name: en.common.cancel }).click();
    await expect(text).toHaveValue("Join us! http://example.org");
    await page.getByRole("button", { name: en.share.share }).click();
    const shared = await page.evaluate(
      () => (window as unknown as { __shared: unknown[] }).__shared,
    );
    expect(shared).toEqual([{ text: "Join us! http://example.org" }]);
  });

  test("Q13 b: members may share while joining is open, not when it is closed", async ({
    page,
    browser,
  }) => {
    await signUp(page, "Vic");
    const publicId = await createTripViaUi(page, `Members ${String(Date.now())}`);
    const token = (await tripRow(publicId))?.invite_token ?? "";
    const { newPerson, joinSignedIn } = await import("./helpers/trips");
    const wim = await newPerson(browser, "Wim");
    await joinSignedIn(wim.page, token);
    await wim.page.goto(`/trips/${publicId}/invite`);
    await expect(wim.page.getByLabel(en.share.messageLabel)).toBeVisible();

    await page.goto(`/trips/${publicId}/invite`);
    await page.getByRole("switch", { name: en.share.joinOpen }).click();
    await expect(page.getByText(en.share.closedOrga)).toBeVisible();
    // The organizer keeps the link (marked «locked»).
    await expect(page.getByLabel(new RegExp(en.share.linkTitle))).toBeVisible();

    await wim.page.reload();
    await expect(wim.page.getByText(en.share.closedMember)).toBeVisible();
    await expect(wim.page.getByLabel(en.share.messageLabel)).toHaveCount(0);
    await wim.page.goto(`/trips/${publicId}`);
    await expect(wim.page.getByText(en.trip.inviteClosed)).toBeVisible();
    await wim.context.close();
  });
});

for (const colorScheme of ["light", "dark"] as const) {
  test.describe(`axe – ${colorScheme}`, () => {
    test.use({ colorScheme, reducedMotion: "reduce" });

    test("increment 2 pages have no serious or critical violations", async ({ page }) => {
      const closed = await seedTrip(`Closed ${String(Date.now())}`, { joinOpen: false });
      const full = await seedTrip(`Full ${String(Date.now())}`, { extraMembers: 29 });
      const open = await seedTrip(`Open ${String(Date.now())}`, { description: "Hello" });
      for (const path of [
        `/i/${open.token}`,
        `/i/${closed.token}`,
        `/i/${full.token}`,
        "/trips/new",
      ]) {
        await page.goto(path);
        await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
        await expectNoSeriousAxeViolations(page, `${colorScheme} ${path}`);
      }
      await signUp(page, "Axel");
      await expectNoSeriousAxeViolations(page, `${colorScheme} /trips empty`);
      const publicId = await createTripViaUi(page, `Axe ${String(Date.now())}`);
      await expectNoSeriousAxeViolations(page, `${colorScheme} invite created`);
      for (const path of [
        "/trips",
        `/trips/${publicId}`,
        `/trips/${publicId}/settings`,
        `/trips/${publicId}/days`,
      ]) {
        await page.goto(path);
        await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
        await expectNoSeriousAxeViolations(page, `${colorScheme} ${path}`);
      }
      await page.goto(`/i/${open.token}`);
      await expectNoSeriousAxeViolations(page, `${colorScheme} invite signed in`);
      await page.goto(`/trips/${publicId}`);
      await openTripMenu(page);
      await expectNoSeriousAxeViolations(page, `${colorScheme} trip menu`);
    });
  });
}

/** Records keyframes (and pseudo-element) of every WAAPI animation. */
async function recordAnimations(page: Page) {
  await page.evaluate(() => {
    const seen: string[] = [];
    (window as unknown as { __seen: string[] }).__seen = seen;
    // eslint-disable-next-line @typescript-eslint/unbound-method -- re-invoked with the element as `this`
    const original = Element.prototype.animate;
    Element.prototype.animate = function (keyframes, options) {
      const pseudo = typeof options === "object" ? (options.pseudoElement ?? "") : "";
      seen.push(`${pseudo}${JSON.stringify(keyframes)}`);
      return original.call(this, keyframes, options);
    };
  });
  return () => page.evaluate(() => (window as unknown as { __seen: string[] }).__seen);
}

test.describe("motion (F-052)", () => {
  test.describe("full motion", () => {
    test.use({ reducedMotion: "no-preference" });

    test("G-02: the tab pill glides after a tap, content comes from the side", async ({ page }) => {
      await signUp(page, "Moe");
      const publicId = await createTripViaUi(page, `Glide ${String(Date.now())}`);
      await page.goto(`/trips/${publicId}`);
      const seen = await recordAnimations(page);
      await page.getByRole("link", { name: en.trip.tabs.group }).click();
      await expect(page).toHaveURL(new RegExp(`/trips/${publicId}/group$`));
      await expect(page.getByRole("link", { name: en.trip.tabs.group })).toHaveAttribute(
        "aria-current",
        "page",
      );
      await expect
        .poll(async () =>
          (await seen()).some((f) => f.startsWith("::before") && f.includes("scaleX")),
        )
        .toBe(true);
      expect((await seen()).some((f) => f.includes("translateX(24px)"))).toBe(true);
    });
  });

  test.describe("reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("tab change and copy feedback without moving parts", async ({ page }) => {
      await signUp(page, "Rae");
      const publicId = await createTripViaUi(page, `Calm ${String(Date.now())}`);
      const seen = await recordAnimations(page);
      await page.getByRole("button", { name: en.share.copyLink }).click();
      await page.goto(`/trips/${publicId}`);
      const seenAfter = await recordAnimations(page);
      await page.getByRole("link", { name: en.trip.tabs.poll }).click();
      await expect(page).toHaveURL(new RegExp(`/trips/${publicId}/poll$`));
      const moving = [...(await seen()), ...(await seenAfter())].filter(
        (f) => f.includes("translate") || f.includes("scale"),
      );
      expect(moving).toEqual([]);
    });
  });
});

test.describe("R-017: server-rendered trip pages never blink away", () => {
  test.use({ reducedMotion: "no-preference" });

  test("overview heading stays visible from the first paint (CPU ×6)", async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== "chromium", "CPU throttling via CDP");
    await signUp(page, "Bea");
    const publicId = await createTripViaUi(page, `Steady ${String(Date.now())}`);
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 6 });
    await page.addInitScript(() => {
      const samples: number[] = [];
      (window as unknown as { __opacity: number[] }).__opacity = samples;
      const sample = () => {
        const heading = document.querySelector("main h1");
        if (heading) {
          let opacity = 1;
          for (let el: Element | null = heading; el; el = el.parentElement) {
            opacity *= Number(getComputedStyle(el).opacity);
          }
          samples.push(opacity);
        }
        if (samples.length < 90) requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    });
    await page.goto(`/trips/${publicId}?welcome=1`);
    await page.waitForFunction(
      () => (window as unknown as { __opacity: number[] }).__opacity.length >= 45,
      undefined,
      { timeout: 20_000 },
    );
    const samples = await page.evaluate(
      () => (window as unknown as { __opacity: number[] }).__opacity,
    );
    const firstVisible = samples.findIndex((value) => value > 0.99);
    expect(firstVisible).toBeGreaterThanOrEqual(0);
    expect(Math.min(...samples.slice(firstVisible))).toBeGreaterThan(0.99);
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
  });
});
