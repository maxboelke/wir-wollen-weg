import { expect, test } from "@playwright/test";
import en from "../../messages/en.json" with { type: "json" };
import { createTrip } from "./helpers/db";
import { uniqueEmail, waitForAccessMail } from "./helpers/mailpit";

// Findings fixed in increment 1: R-016, R-017, R-019 (R-018: increment-1-help.spec.ts).

test("R-016: a full code field keeps a visible focus indicator", async ({ page }) => {
  await page.goto("/login");
  const email = uniqueEmail("r016");
  await page.getByLabel(en.auth.emailLabel).fill(email);
  await page.getByRole("button", { name: en.auth.sendCode }).click();
  const mail = await waitForAccessMail(email);
  const field = page.getByLabel(en.auth.codeLabel);
  await field.fill(mail.code === "000000" ? "111111" : "000000");
  await expect(field).toHaveAttribute("aria-invalid", "true");
  await expect(field).toBeFocused();
  // Ring around the whole group (no active box with 6 digits).
  const ring = await field.evaluate((input) => {
    const group = input.parentElement;
    return group ? getComputedStyle(group, "::after").boxShadow : "none";
  });
  expect(ring).not.toBe("none");
  // Focus leaves → no ring.
  await page.keyboard.press("Tab");
  const after = await field.evaluate((input) =>
    input.parentElement ? getComputedStyle(input.parentElement, "::after").content : "",
  );
  expect(after === "none" || after === "normal").toBe(true);
});

test.describe("R-017: server-rendered content never blinks away", () => {
  test.use({ reducedMotion: "no-preference" });

  test("invite card stays visible from the first paint (CPU ×6)", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "CPU throttling via CDP");
    const token = await createTrip(`Blink ${Date.now()}`);
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 6 });
    await page.addInitScript(() => {
      const samples: number[] = [];
      (window as unknown as { __opacity: number[] }).__opacity = samples;
      const sample = () => {
        const heading = document.querySelector("h1");
        if (heading) {
          let opacity = 1;
          for (let el: Element | null = heading; el; el = el.parentElement) {
            opacity *= Number(getComputedStyle(el).opacity);
          }
          samples.push(opacity);
        }
        if (samples.length < 120) requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    });
    await page.goto(`/i/${token}`);
    await page.waitForFunction(
      () => (window as unknown as { __opacity: number[] }).__opacity.length >= 60,
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

  test("client-side steps still animate (e-mail → code)", async ({ page }) => {
    await page.goto("/login");
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
    await page.getByLabel(en.auth.emailLabel).fill(uniqueEmail("r017"));
    await page.getByRole("button", { name: en.auth.sendCode }).click();
    await expect(page.getByLabel(en.auth.codeLabel)).toBeFocused();
    const frames = await page.evaluate(() => (window as unknown as { __seen: string[] }).__seen);
    expect(frames.some((f) => f.includes("translateX(8px)"))).toBe(true);
  });
});

test("R-019: closing the bottom sheet returns focus at once and leaves the page usable", async ({
  page,
}) => {
  await page.goto("/dev/ui");
  const trigger = page.getByRole("button", { name: "Bottom-Sheet öffnen" }).first();
  await trigger.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  // The exit animation takes 220 ms – focus must be back well before it ends.
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused({ timeout: 100 });
  // The page is interactive right away: not modal any more, and a tap on the trigger reaches
  // it even while the sheet is still sliding out.
  const state = await trigger.evaluate((button) => {
    const box = button.getBoundingClientRect();
    const hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
    return {
      modal: document.querySelector("dialog")?.matches(":modal") ?? false,
      reachable: hit !== null && button.contains(hit),
    };
  });
  expect(state).toEqual({ modal: false, reachable: true });
});
