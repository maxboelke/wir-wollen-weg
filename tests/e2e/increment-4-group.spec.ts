import { expect, test, type Page } from "@playwright/test";
import en from "../../messages/en.json" with { type: "json" };
import { expectNoSeriousAxeViolations, waitForAnimations } from "./helpers/axe";
import { signUp } from "./helpers/auth";
import {
  addAccountToTrip,
  addMemberWithDays,
  addPlaceholder,
  isoDay,
  seedTrip,
} from "./helpers/db";
import { uniqueEmail } from "./helpers/mailpit";
import { newPerson } from "./helpers/trips";

// Increment 4: F-008 group calendar (heatmap), F-009 suggestions (W09, Flow C, ux-spec
// §4.9–§4.11, §7.3), Q20 placeholders in the progress, R-049. Accounts: en-GB.

test.use({ locale: "en-GB" });

const g = en.group;
const S = 30; // seeded search range: isoDay(30) … isoDay(90)
const day = (offset: number) => isoDay(S + offset);
const range = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => day(from + i));
const cell = (page: Page, date: string) => page.locator(`button[data-date="${date}"]`);
/** Interactions need the hydrated client component (dev server compiles lazily). */
const hydrated = (page: Page) => page.waitForLoadState("networkidle");
const fill = (text: string, values: Record<string, string | number>) =>
  Object.entries(values).reduce(
    (out, [key, value]) => out.replace(`{${key}}`, String(value)),
    text,
  );

/**
 * Lena (organiser, not submitted), Jonas (can't on days 0–9), Tim («if needed» on day 12,
 * can't from day 20), Dora (draft: can't on every day – must not count), the viewer Kemal (not
 * submitted) and the placeholder Mia. → 2 of 6 submitted; «Everyone's in»: days 10–19.
 */
async function setUp(page: Page) {
  const trip = await seedTrip(`Group ${String(Date.now())}`);
  await addMemberWithDays(trip.tripId, "Jonas", { no: range(0, 9) });
  await addMemberWithDays(trip.tripId, "Tim", { no: range(20, 60), maybe: [day(12)] });
  await addMemberWithDays(trip.tripId, "Dora", { no: range(0, 60) }, false);
  const email = await signUp(page, "Kemal", uniqueEmail("kemal"));
  await addAccountToTrip(trip.tripId, email, "Kemal");
  await addPlaceholder(trip.tripId, "Mia");
  return { ...trip, email };
}

test.describe("F-008/F-009 group tab", () => {
  test("suggestions: counting rule, two groups in order, Q20 progress with placeholders", async ({
    page,
  }) => {
    const { publicId } = await setUp(page);
    await page.goto(`/trips/${publicId}/group`);
    await hydrated(page);
    // Q20: placeholders count in the denominator and in «still open».
    await expect(page.getByText(fill(en.trip.kpiSubmitted, { done: 2, total: 6 }))).toBeVisible();
    await expect(page.getByText(/Still open: .*Lena Berg.*Dora.*Kemal.*Mia/)).toBeVisible();

    await expect(
      page.getByRole("heading", { name: fill(g.groups.all, { count: 1 }) }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: fill(g.groups.almost, { count: 2 }) }),
    ).toBeVisible();
    const cards = page.locator("article[data-card]");
    await expect(cards).toHaveCount(3);
    // «Everyone's in» first: 9 nights, Tim's «if needed» day counted once.
    await expect(cards.nth(0)).toContainText("up to 9 nights");
    await expect(cards.nth(0)).toContainText("1× if needed");
    // «Almost everyone's in»: fewer «if needed» first → without Tim, then without Jonas.
    await expect(cards.nth(1)).toContainText("without Tim");
    await expect(cards.nth(1)).toContainText("1 can");
    await expect(cards.nth(2)).toContainText("without Jonas");

    // Local filter: nobody may miss out → only «Everyone's in», «just for you» hint.
    await page.getByLabel(g.filters.tolerance).selectOption("0");
    await expect(cards).toHaveCount(1);
    await expect(page.getByText(g.filters.onlyYou)).toBeVisible();
    await page.getByRole("button", { name: g.filters.reset }).click();
    await expect(cards).toHaveCount(3);
  });

  test("heatmap: cell names, band of suggestion 1, day detail with names, drafts never count", async ({
    page,
  }) => {
    const { publicId } = await setUp(page);
    await page.goto(`/trips/${publicId}/group?view=calendar`);
    await hydrated(page);
    await expect(cell(page, day(0))).toHaveAttribute("aria-label", /1 of 2 works, can't: Jonas$/);
    await expect(cell(page, day(12))).toHaveAttribute(
      "aria-label",
      /1 of 2 works, 1 if needed, part of suggestion 1$/,
    );
    await expect(cell(page, day(15))).toHaveAttribute(
      "aria-label",
      /2 of 2 works – everyone, part of suggestion 1$/,
    );
    await expect(cell(page, day(15))).toHaveAttribute("data-level", "all");
    await expect(cell(page, day(12))).toHaveAttribute("data-level", "many");
    await expect(cell(page, day(30))).toHaveAttribute("data-level", "some");
    await expect(page.locator("td[data-band]")).toHaveCount(10);

    await cell(page, day(0)).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(fill(g.detail.count, { x: 1, n: 2 }))).toBeVisible();
    await expect(dialog.getByText(fill(g.detail.no, { names: "Jonas" }))).toBeVisible();
    await expect(dialog.getByText(fill(g.detail.open, { count: 4 }))).toBeVisible();
    await expect(dialog.getByText(/Mia · not joined yet/)).toBeVisible();
    // Dora's draft is not in «Can't»: she is still open.
    await expect(dialog.getByText(fill(g.detail.noGroup, { count: 1 }))).toBeVisible();
  });

  test("keyboard: arrows move in the grid, Enter opens the detail, ←/→ page, Esc returns focus", async ({
    page,
  }) => {
    const { publicId } = await setUp(page);
    await page.goto(`/trips/${publicId}/group?view=calendar`);
    await hydrated(page);
    // One tab stop for the whole calendar (roving tabindex).
    await expect(page.locator("button[data-date][tabindex='0']")).toHaveCount(1);
    await cell(page, day(0)).focus();
    await page.keyboard.press("ArrowRight");
    await expect(cell(page, day(1))).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(cell(page, day(8))).toBeFocused();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await page.keyboard.press("ArrowRight");
    await expect(dialog.getByText(fill(g.detail.count, { x: 1, n: 2 }))).toBeVisible();
    await page.keyboard.press("ArrowRight"); // day 10: everybody
    await expect(dialog.getByText(g.detail.all, { exact: true })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(cell(page, day(10))).toBeFocused();
  });

  test("«Show in calendar» picks the suggestion: band moves, highlight announced", async ({
    page,
  }) => {
    const { publicId } = await setUp(page);
    await page.goto(`/trips/${publicId}/group`);
    await hydrated(page);
    await page
      .locator("article[data-card]")
      .nth(1)
      .getByRole("button", { name: g.card.show })
      .click();
    if ((page.viewportSize()?.width ?? 0) < 960) {
      await expect(page).toHaveURL(/view=calendar$/);
    }
    // «without Tim»: days 10–60 → 51 days in the band.
    await expect(page.locator("td[data-band]")).toHaveCount(51);
    await expect(page.locator("td[data-highlight]")).toHaveCount(51);
    await expect(cell(page, day(10))).toHaveAttribute("aria-label", /part of suggestion 2$/);
  });

  test("suggestion bar (phones): ‹ › page through suggestions, no wrap at the ends", async ({
    page,
  }) => {
    test.skip((page.viewportSize()?.width ?? 0) >= 960, "bar only below 960 px");
    const { publicId } = await setUp(page);
    await page.goto(`/trips/${publicId}/group?view=calendar`);
    await hydrated(page);
    const bar = page.getByRole("group", { name: g.bar.label });
    await expect(bar).toBeVisible();
    await expect(bar.getByRole("button", { name: g.bar.prev })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    await bar.getByRole("button", { name: g.bar.next }).click();
    await bar.getByRole("button", { name: g.bar.next }).click();
    await expect(bar.getByRole("button", { name: g.bar.next })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    await expect(bar).toContainText(
      fill(g.bar.position, { group: g.groups.almostName, rank: 3, total: 3 }),
    );
    // The middle goes to the list and focuses that card.
    await bar.getByRole("button", { name: /show in the list$/ }).click();
    await expect(page).toHaveURL(/view=suggestions$/);
    await expect(page.locator("#suggestion-2")).toBeFocused();
  });

  test("empty states: nobody submitted, and no match with concrete ways out", async ({ page }) => {
    const trip = await seedTrip(`Empty ${String(Date.now())}`);
    const email = await signUp(page, "Ana", uniqueEmail("ana"));
    await addAccountToTrip(trip.tripId, email, "Ana");
    await page.goto(`/trips/${trip.publicId}/group`);
    await expect(page.getByText(g.empty.nobody)).toBeVisible();
    await expect(page.getByRole("link", { name: g.empty.addDates })).toBeVisible();

    // Everybody blocks every 4th day → no 4 nights in a row; 2 nights would work.
    const blocked = Array.from({ length: 16 }, (_, i) => day(i * 4));
    await addMemberWithDays(trip.tripId, "Ole", { no: blocked });
    await addMemberWithDays(trip.tripId, "Pia", { no: blocked });
    await page.reload();
    await expect(page.getByText(/^Sadly there are no 4 nights/)).toBeVisible();
    await expect(page.getByText(g.empty.tips)).toBeVisible();
    await page.getByRole("button", { name: g.empty.show }).first().click();
    await expect(page.locator("article[data-card]").first()).toBeVisible();
  });
});

test.describe("security", () => {
  test("IDOR: a signed-in non-member gets «Trip not found» – no heatmap, no names", async ({
    page,
    browser,
  }) => {
    const { publicId } = await setUp(page);
    const stranger = await newPerson(browser, "Stranger");
    const response = await stranger.page.goto(`/trips/${publicId}/group?view=calendar`);
    expect(response?.status()).toBe(404);
    await expect(stranger.page.getByRole("heading", { name: en.trip.notFoundTitle })).toBeVisible();
    const html = await stranger.page.content();
    expect(html).not.toContain("Jonas");
    expect(html).not.toContain("data-date");
    await stranger.context.close();
  });

  test("drafts never reach the browser", async ({ page }) => {
    const { publicId } = await setUp(page);
    const response = await page.goto(`/trips/${publicId}/group`);
    const html = ((await response?.text()) ?? "").replaceAll('\\"', '"');
    // Dora (draft) is only listed as «still open» – never as a participant with days.
    expect(html).toContain('"name":"Dora","placeholder":false');
    expect(html).not.toMatch(/"name":"Dora","me"/);
    await page.goto(`/trips/${publicId}/group?view=calendar`);
    await hydrated(page);
    await expect(cell(page, day(45))).toHaveAttribute("aria-label", /1 of 2 works, can't: Tim$/);
  });
});

test.describe("accessibility", () => {
  for (const scheme of ["light", "dark"] as const) {
    test(`axe ${scheme}: suggestions, calendar and day detail`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      const { publicId } = await setUp(page);
      await page.goto(`/trips/${publicId}/group`);
      await hydrated(page);
      await expectNoSeriousAxeViolations(page, `group suggestions ${scheme}`);
      await page.goto(`/trips/${publicId}/group?view=calendar`);
      await hydrated(page);
      await expectNoSeriousAxeViolations(page, `group calendar ${scheme}`);
      await cell(page, day(12)).click();
      await expect(page.getByRole("dialog")).toBeVisible();
      await expectNoSeriousAxeViolations(page, `day detail ${scheme}`);
    });
  }

  test("360 px: no horizontal scrolling, bar does not cover the focused day", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    const { publicId } = await setUp(page);
    await page.goto(`/trips/${publicId}/group?view=calendar`);
    await hydrated(page);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
    const pad = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--ww-sticky-bar-h"),
    );
    expect(Number.parseFloat(pad)).toBeGreaterThan(40);
  });
});

/** Parts of each heatmap cell (text boxes of date/count, ◐, ✓) that overlap or leave the cell. */
async function cellCollisions(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const issues: string[] = [];
    const textBox = (el: Element) => {
      const range = document.createRange();
      range.selectNodeContents(el);
      return range.getBoundingClientRect();
    };
    const shown = (el: Element | null | undefined): el is Element =>
      !!el && getComputedStyle(el).display !== "none" && el.getClientRects().length > 0;
    for (const button of document.querySelectorAll<HTMLElement>("button[data-date]")) {
      const box = button.getBoundingClientRect();
      const parts: [string, DOMRect][] = [];
      const [num, count] = [button.children[0], button.children[1]];
      if (num) parts.push(["date", textBox(num)]);
      if (shown(count)) {
        for (const child of count.children) if (shown(child)) parts.push(["count", textBox(child)]);
      }
      for (const name of ["maybe", "seal"]) {
        const el = button.querySelector(`[data-anim='${name}']`);
        if (shown(el)) parts.push([name, el.getBoundingClientRect()]);
      }
      for (const [name, r] of parts) {
        if (r.left < box.left - 0.5 || r.right > box.right + 0.5 || r.bottom > box.bottom + 0.5) {
          issues.push(`${button.dataset.date ?? ""} ${name} outside`);
        }
      }
      for (let i = 0; i < parts.length; i++) {
        for (let j = i + 1; j < parts.length; j++) {
          const [a, ra] = parts[i] ?? ["", box];
          const [b, rb] = parts[j] ?? ["", box];
          const w = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left);
          const h = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
          if (w > 0.5 && h > 0.5) issues.push(`${button.dataset.date ?? ""} ${a}×${b}`);
        }
      }
    }
    return issues;
  });
}

test.describe("R-050/R-052: cell anatomy without overlaps", () => {
  test("200 % text at 360 px: date + level + ✓/◐, count only in the name; nothing collides", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    const { publicId } = await setUp(page);
    await page.goto(`/trips/${publicId}/group?view=calendar`);
    await hydrated(page);
    await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
    await expect(cell(page, day(15)).locator("[data-anim='seal']")).toBeVisible();
    expect(await cellCollisions(page)).toEqual([]);
    // The count is not shown in the cell but stays in the accessible name.
    await expect(cell(page, day(15))).toHaveAttribute("aria-label", /2 of 2 works – everyone/);
    // The suggestion bar keeps its content inside its surface (scrolls instead of spilling).
    const bar = page.getByRole("group", { name: g.bar.label });
    const spill = await bar.evaluate((el) => {
      const box = el.getBoundingClientRect();
      return [...el.querySelectorAll("*")].some((child) => {
        const r = child.getBoundingClientRect();
        return (
          r.height > 0 && r.top < box.top - 0.5 && getComputedStyle(el).overflowY === "visible"
        );
      });
    });
    expect(spill).toBe(false);
  });

  test("desktop: one month per row, cells wide enough for «x/n» next to ✓ and the gauge", async ({
    page,
  }) => {
    test.skip((page.viewportSize()?.width ?? 0) < 960, "desktop layout only");
    const { publicId } = await setUp(page);
    await page.goto(`/trips/${publicId}/group?view=calendar`);
    await hydrated(page);
    const width = await cell(page, day(15)).evaluate((el) => el.getBoundingClientRect().width);
    expect(width).toBeGreaterThanOrEqual(56);
    expect(await cellCollisions(page)).toEqual([]);
  });
});

test.describe("flow and Q20 elsewhere", () => {
  test("«My trips» and the overview count placeholders (Q20)", async ({ page }) => {
    const { publicId } = await setUp(page);
    await page.goto("/trips");
    await expect(
      page.getByText(fill(en.trips.progressSubmitted, { done: 2, total: 6 })),
    ).toBeVisible();
    await page.goto(`/trips/${publicId}`);
    await expect(page.getByText(fill(en.trip.kpiSubmitted, { done: 2, total: 6 }))).toBeVisible();
    await expect(page.getByText(/Still missing: .*Mia/)).toBeVisible();
  });

  test("R-049: «My dates» at 360 × 640 shows the first calendar week without scrolling", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    const { publicId } = await setUp(page);
    await page.goto(`/trips/${publicId}/days`);
    const firstRow = page.locator("table[role='grid'] tbody tr").first();
    await expect(firstRow).toBeVisible();
    const row = await firstRow.boundingBox();
    const bar = await page.getByRole("button", { name: en.days.submit }).boundingBox();
    expect(row && bar).toBeTruthy();
    if (row && bar) expect(row.y + row.height).toBeLessThanOrEqual(bar.y);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
  });
});

test.describe("motion (F-052, W09-05)", () => {
  test.use({ reducedMotion: "no-preference" });

  test("server-painted heatmap never animates (R-017); the first open via the segment waves", async ({
    page,
  }) => {
    const { publicId } = await setUp(page);
    await page.goto(`/trips/${publicId}/group?view=calendar`);
    await hydrated(page);
    await waitForAnimations(page);
    const direct = await page.evaluate(
      () =>
        document
          .getAnimations()
          .filter((a) => (a.effect as KeyframeEffect | null)?.target?.matches("button[data-date]"))
          .length,
    );
    expect(direct).toBe(0);

    test.skip((page.viewportSize()?.width ?? 0) >= 960, "segment only below 960 px");
    // The wave only plays over cells in the viewport. On short phones (iPhone 15: 659 px) the
    // first calendar row starts below the fold after switching, so give the page room.
    await page.setViewportSize({ width: page.viewportSize()?.width ?? 393, height: 900 });
    await page.evaluate(() => {
      sessionStorage.clear();
    });
    // Legend folded (remembered per device, U-6) so the first month is in the viewport.
    await page.context().addCookies([{ name: "ww-hm-legend", value: "closed", url: page.url() }]);
    await page.goto(`/trips/${publicId}/group`);
    await hydrated(page);
    await page.getByRole("link", { name: g.segment.calendar, exact: true }).click();
    await expect(page).toHaveURL(/view=calendar$/);
    // The URL is pushed in the click handler, before React renders the calendar and runs the
    // wave (WebKit commits a task later than Chromium) – poll instead of reading once.
    await expect
      .poll(
        () =>
          page.evaluate(
            () =>
              document
                .getAnimations()
                .filter((a) =>
                  (a.effect as KeyframeEffect | null)?.target?.matches("button[data-date]"),
                ).length,
          ),
        { timeout: 2000, intervals: [50] },
      )
      .toBeGreaterThan(0);
  });
});
