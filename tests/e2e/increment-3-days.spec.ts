import { expect, test, type Page } from "@playwright/test";
import en from "../../messages/en.json" with { type: "json" };
import { expectNoSeriousAxeViolations, waitForAnimations } from "./helpers/axe";
import { signUp } from "./helpers/auth";
import {
  addAccountToTrip,
  availabilityOf,
  fixTripDates,
  isoDay,
  memberStatus,
  seedTrip,
  setAvailability,
} from "./helpers/db";
import { uniqueEmail } from "./helpers/mailpit";
import { createTripViaUi } from "./helpers/trips";

// Increment 3: F-005 «Meine Tage» (W08, Flow B, ux-spec §7.3), F-016 holidays/weekends,
// F-007 status. Region of the accounts: en-GB (Monday start, UK bank holidays).

test.use({ locale: "en-GB" });

const days = en.days;
const cells = (page: Page) => page.locator("button[data-date]");
const cell = (page: Page, date: string) => page.locator(`button[data-date="${date}"]`);
const pickBrush = (page: Page, label: string) =>
  page.getByRole("group", { name: days.tools }).getByText(label, { exact: true }).click();
/** The snackbar (the polite live region repeats the text for screen readers). */
const snackbar = (page: Page, text: RegExp | string) => page.locator("span", { hasText: text });

async function setUp(page: Page, name = "Jonas") {
  const email = await signUp(page, name, uniqueEmail(name.toLowerCase()));
  const publicId = await createTripViaUi(page, `Days ${String(Date.now())}`);
  await page.goto(`/trips/${publicId}/days`);
  await expect(cells(page).first()).toBeVisible();
  return { email, publicId };
}

async function waitSaved(page: Page) {
  await expect(page.getByRole("status").filter({ hasText: days.saved })).toBeVisible();
  await expect(page.getByRole("status").filter({ hasText: days.saving })).toHaveCount(0);
}

async function firstDates(page: Page, count: number): Promise<string[]> {
  const all = await cells(page).evaluateAll((elements) =>
    elements.map((element) => (element as HTMLElement).dataset.date ?? ""),
  );
  return all.slice(0, count);
}

test.describe("F-005 painting", () => {
  test("tap paints with the brush, a second tap resets – saved and still there after reload", async ({
    page,
  }) => {
    const { email, publicId } = await setUp(page);
    const [day] = await firstDates(page, 1);
    if (!day) throw new Error("no editable day");
    // Default brush «Can't» (Flow B.1).
    await expect(page.getByRole("radio", { name: days.brush.no })).toBeChecked();
    await cell(page, day).click();
    await expect(cell(page, day)).toHaveAttribute("data-state", "no");
    await expect(cell(page, day)).toHaveAttribute("aria-label", /, can't$/);
    await waitSaved(page);
    await expect.poll(() => availabilityOf(publicId, email)).toEqual({ [day]: "no" });

    await page.reload();
    await expect(cell(page, day)).toHaveAttribute("data-state", "no");
    await cell(page, day).click();
    await expect(cell(page, day)).toHaveAttribute("data-state", "yes");
    await waitSaved(page);
    await expect.poll(() => availabilityOf(publicId, email)).toEqual({});
  });

  test("dragging over days paints the range in date order (first day decides)", async ({
    page,
  }) => {
    const { email, publicId } = await setUp(page);
    await pickBrush(page, days.brush.maybe);
    const [a, , , d] = await firstDates(page, 4);
    if (!a || !d) throw new Error("not enough days");
    await cell(page, d).scrollIntoViewIfNeeded();
    await cell(page, a).scrollIntoViewIfNeeded();
    const from = await cell(page, a).boundingBox();
    const to = await cell(page, d).boundingBox();
    if (!from || !to) throw new Error("no boxes");
    await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
    await page.mouse.down();
    await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 8 });
    // Preview before releasing: dashed outline, nothing saved yet.
    await expect(cell(page, d)).toHaveAttribute("data-preview", "");
    await page.mouse.up();
    for (const date of await firstDates(page, 4)) {
      await expect(cell(page, date)).toHaveAttribute("data-state", "maybe");
    }
    // Snackbar with undo for ≥ 2 days.
    await expect(snackbar(page, "4 days set to “if needed”")).toBeVisible();
    await expect
      .poll(async () => Object.keys(await availabilityOf(publicId, email)))
      .toHaveLength(4);

    // Undo (toolbar) restores everything.
    await page
      .getByRole("group", { name: days.tools })
      .getByRole("button", { name: days.undo })
      .click();
    await expect(cell(page, d)).toHaveAttribute("data-state", "yes");
    await waitSaved(page);
    await expect.poll(() => availabilityOf(publicId, email)).toEqual({});
  });

  test("range mode: two taps paint the range without dragging (WCAG 2.5.7)", async ({ page }) => {
    await setUp(page);
    const dates = await firstDates(page, 6);
    const start = dates[1] ?? "";
    const end = dates[5] ?? "";
    await page.getByRole("button", { name: days.range }).click();
    await expect(page.getByRole("button", { name: days.range })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(page.getByText(days.rangeHintStart, { exact: true })).toBeVisible();
    await cell(page, start).click();
    await expect(cell(page, start)).toHaveAttribute("data-anchor", "");
    await expect(page.getByText(days.rangeHintEnd, { exact: true })).toBeVisible();
    await cell(page, end).click();
    for (const date of dates.slice(1, 6)) {
      await expect(cell(page, date)).toHaveAttribute("data-state", "no");
    }
    await expect(cell(page, dates[0] ?? "")).toHaveAttribute("data-state", "yes");
  });

  test("keyboard: arrows move, Space marks, Shift+arrows select a range, 1/2/3 and Ctrl+Z", async ({
    page,
  }) => {
    await setUp(page);
    const dates = await firstDates(page, 6);
    // One tab stop for the whole calendar (roving tabindex).
    await expect(page.locator('button[data-date][tabindex="0"]')).toHaveCount(1);
    await cell(page, dates[0] ?? "").focus();
    await page.keyboard.press("ArrowRight");
    await expect(cell(page, dates[1] ?? "")).toBeFocused();
    await page.keyboard.press("Space");
    await expect(cell(page, dates[1] ?? "")).toHaveAttribute("data-state", "no");

    await page.keyboard.press("2"); // brush «If needed»
    await expect(page.getByRole("radio", { name: days.brush.maybe })).toBeChecked();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Shift+ArrowRight");
    await page.keyboard.press("Shift+ArrowRight");
    await expect(cell(page, dates[4] ?? "")).toBeFocused();
    await expect(cell(page, dates[4] ?? "")).toHaveAttribute("data-preview", "");
    await page.keyboard.press("Enter");
    for (const date of dates.slice(2, 5)) {
      await expect(cell(page, date)).toHaveAttribute("data-state", "maybe");
    }
    await page.keyboard.press("ControlOrMeta+z");
    await expect(cell(page, dates[3] ?? "")).toHaveAttribute("data-state", "yes");
    await expect(cell(page, dates[1] ?? "")).toHaveAttribute("data-state", "no");
    await page.keyboard.press("ControlOrMeta+Shift+z");
    await expect(cell(page, dates[3] ?? "")).toHaveAttribute("data-state", "maybe");
  });

  test("quick action «weekdays to if needed» and reset (with confirmation)", async ({ page }) => {
    await setUp(page);
    await page.getByRole("button", { name: days.quick }).click();
    await page.getByRole("button", { name: days.quickActions.workdaysMaybe }).click();
    await expect(snackbar(page, /days set to “if needed”/)).toBeVisible();
    const states = await cells(page).evaluateAll((elements) =>
      elements.map((element) => {
        const date = (element as HTMLElement).dataset.date ?? "";
        const day = new Date(`${date}T00:00:00Z`).getUTCDay();
        return { weekend: day === 0 || day === 6, state: (element as HTMLElement).dataset.state };
      }),
    );
    expect(states.filter((s) => s.weekend).every((s) => s.state === "yes")).toBe(true);
    expect(states.some((s) => !s.weekend && s.state === "maybe")).toBe(true);

    await page.getByRole("button", { name: days.quick }).click();
    await page.getByRole("button", { name: days.quickActions.reset }).click();
    await expect(page.getByRole("heading", { name: days.quickActions.resetTitle })).toBeVisible();
    await page.getByRole("button", { name: days.quickActions.resetConfirm }).click();
    await expect(page.locator('button[data-state="maybe"]')).toHaveCount(0);
  });
});

test.describe("F-005/F-007 submit and status", () => {
  test("submitting without marks asks first; then success, feedback once, on to the group tab", async ({
    page,
  }) => {
    const { email, publicId } = await setUp(page, "Kemal");
    await expect(page.getByText(days.draft)).toBeVisible();
    await page.getByRole("button", { name: days.submit }).click();
    await expect(page.getByRole("heading", { name: days.empty.title })).toBeVisible();
    await page.getByRole("button", { name: days.empty.yes }).click();
    await expect(
      page.getByRole("heading", { name: "Thanks, Kemal! Your dates are in." }),
    ).toBeVisible();
    await page.getByLabel(days.success.google).check();
    await page.getByRole("button", { name: days.success.answer }).click();
    // Increment 4: after submitting, «Gruppe» (W09) – before it existed, the overview.
    await expect(page).toHaveURL(new RegExp(`/trips/${publicId}/group$`));
    expect((await memberStatus(publicId, email))?.submitted).toBe(true);
    await expect(page.getByText(en.trip.kpiAllDone)).toBeVisible();
    await page.goto(`/trips/${publicId}`);
    await expect(page.getByText(/^submitted · /)).toBeVisible();
    await expect(page.getByText("Collecting dates · 1/1 done")).toHaveCount(0); // sr text differs
    await expect(page.getByText(en.trip.kpiAllDone)).toBeVisible();

    // Back on «My dates»: status instead of the button, changes still possible; no draft hint.
    await page.goto(`/trips/${publicId}/days`);
    await expect(page.getByText(/^Submitted · \d/)).toBeVisible();
    await expect(page.getByText(days.draft)).toHaveCount(0);
    const [day] = await firstDates(page, 1);
    await cell(page, day ?? "").click();
    await waitSaved(page);
    await expect.poll(() => availabilityOf(publicId, email)).toEqual({ [day ?? ""]: "no" });
  });

  test("comment is saved on leaving the field and shown in the member list", async ({ page }) => {
    const { email, publicId } = await setUp(page, "Tim");
    await page.getByLabel(days.comment.label).fill("July only with the kids");
    await page.getByLabel(days.comment.label).blur();
    await expect(page.getByText(days.comment.saved)).toBeVisible();
    expect((await memberStatus(publicId, email))?.comment).toBe("July only with the kids");
    const [day] = await firstDates(page, 1);
    await cell(page, day ?? "").click();
    await page.getByRole("button", { name: days.submit }).click();
    await page.getByRole("button", { name: days.success.skip }).click();
    await expect(page.getByText("July only with the kids")).toBeVisible();
  });
});

test.describe("F-016 holidays and weekends", () => {
  test("own UK bank holidays and weekends are marked, named and listed; trip holidays optional", async ({
    page,
  }) => {
    const email = await signUp(page, "Holly", uniqueEmail("holly"));
    const year = new Date().getUTCFullYear() + 1;
    const trip = await seedTrip(`Holidays ${String(Date.now())}`, {
      rangeStart: `${String(year)}-12-20`,
      rangeEnd: `${String(year + 1)}-01-10`,
      holidayCountry: "DE",
      holidaySubdivision: "DE-BY",
    });
    await addAccountToTrip(trip.tripId, email, "Holly");
    await page.goto(`/trips/${trip.publicId}/days`);
    const boxing = cell(page, `${String(year)}-12-26`);
    await expect(boxing).toHaveAttribute("data-holiday", "");
    await expect(boxing).toHaveAttribute("aria-label", /holiday Boxing Day/);
    await expect(
      page.getByRole("list", { name: "Holidays in December" }).getByText(/^25 Dec Christmas Day$/),
    ).toBeVisible();
    // Weekend: Saturday 25 Dec 2027 … any Saturday carries «weekend» in its name.
    const saturday = await cells(page).evaluateAll((elements) =>
      elements
        .map((element) => (element as HTMLElement).dataset.date ?? "")
        .find((date) => new Date(`${date}T00:00:00Z`).getUTCDay() === 6),
    );
    await expect(cell(page, saturday ?? "")).toHaveAttribute("aria-label", /, weekend/);
    // Monday start for en-GB: first column header is Monday.
    await expect(page.locator("thead th").first()).toHaveAttribute("abbr", "Monday");
    // R-049: the holiday region sits in the (folded) legend «How it works».
    await page.getByText(days.legendTitle, { exact: true }).click();
    await expect(page.getByText("Holidays for: United Kingdom")).toBeVisible();

    // Epiphany (6 Jan) is a holiday in Bavaria (the trip's region), not in the UK.
    const epiphany = cell(page, `${String(year + 1)}-01-06`);
    await expect(epiphany).not.toHaveAttribute("data-holiday", "");
    await page.getByRole("button", { name: days.quick }).click();
    await page
      .getByRole("button", {
        name: days.quickActions.showTripHolidays.replace("{region}", "Bavaria"),
      })
      .click();
    await expect(epiphany).toHaveAttribute("data-holiday", "");
    await expect(epiphany).toHaveAttribute("aria-label", /holiday Epiphany \(trip\)/);
  });
});

test.describe("security and phases", () => {
  test("save actions are scoped to the own membership – a replay by a non-member changes nothing", async ({
    page,
    browser,
  }) => {
    const { email, publicId } = await setUp(page);
    const [day] = await firstDates(page, 1);
    const request = page.waitForRequest(
      (r) => r.method() === "POST" && r.headers()["next-action"] !== undefined,
    );
    await cell(page, day ?? "").click();
    const captured = await request;
    await waitSaved(page);

    const other = await browser.newContext({ locale: "en-GB" });
    const otherPage = await other.newPage();
    await signUp(otherPage, "Mallory", uniqueEmail("mallory"));
    const headers = await captured.allHeaders();
    const replay = await other.request.post(captured.url(), {
      headers: {
        "next-action": headers["next-action"] ?? "",
        "content-type": headers["content-type"] ?? "text/plain;charset=UTF-8",
        accept: "text/x-component",
      },
      data: (captured.postData() ?? "").replace('"no"', '"maybe"'),
    });
    expect(replay.status()).toBeLessThan(500);
    expect(await replay.text()).toContain("notAllowed");
    expect(await availabilityOf(publicId, email)).toEqual({ [day ?? ""]: "no" });
    // Non-member page: same «not found» as an unknown trip.
    const response = await otherPage.goto(`/trips/${publicId}/days`);
    expect(response?.status()).toBe(404);
    await other.close();
  });

  test("R-045: marks on past days (incl. yesterday) survive later saves", async ({ page }) => {
    const email = await signUp(page, "Pia", uniqueEmail("pia"));
    const trip = await seedTrip(`Past ${String(Date.now())}`, {
      rangeStart: isoDay(-5),
      rangeEnd: isoDay(20),
    });
    await addAccountToTrip(trip.tripId, email, "Pia");
    await setAvailability(trip.tripId, email, { [isoDay(-3)]: "no", [isoDay(-1)]: "maybe" });
    await page.goto(`/trips/${trip.publicId}/days`);
    const [day] = await firstDates(page, 1);
    await cell(page, day ?? "").click();
    await waitSaved(page);
    await expect
      .poll(() => availabilityOf(trip.publicId, email))
      .toEqual({ [isoDay(-3)]: "no", [isoDay(-1)]: "maybe", [day ?? ""]: "no" });
  });

  test("R-047: dates fixed while the page is open – the save is refused with the lock notice", async ({
    page,
  }) => {
    const email = await signUp(page, "Tom", uniqueEmail("tom"));
    const trip = await seedTrip(`Lock ${String(Date.now())}`);
    await addAccountToTrip(trip.tripId, email, "Tom");
    await page.goto(`/trips/${trip.publicId}/days`);
    const [day] = await firstDates(page, 1);
    await fixTripDates(trip.tripId);
    await cell(page, day ?? "").click();
    await expect(page.getByText(days.banner.locked).first()).toBeVisible();
    await expect(page.getByText(days.banner.rangeChanged)).toHaveCount(0);
    expect(await availabilityOf(trip.publicId, email)).toEqual({});
  });

  test("R-048: opening «My dates» without changes saves nothing", async ({ page }) => {
    const { publicId } = await setUp(page);
    const posts: string[] = [];
    page.on("request", (request) => {
      if (request.method() === "POST" && request.headers()["next-action"])
        posts.push(request.url());
    });
    await page.goto(`/trips/${publicId}/days`);
    await expect(cells(page).first()).toBeVisible();
    await page.waitForTimeout(1500);
    expect(posts).toEqual([]);
  });

  test("fixed dates: «My dates» is read-only, states stay visible", async ({ page }) => {
    const email = await signUp(page, "Lia", uniqueEmail("lia"));
    const trip = await seedTrip(`Fixed ${String(Date.now())}`, { phase: "fixed" });
    await addAccountToTrip(trip.tripId, email, "Lia");
    await page.goto(`/trips/${trip.publicId}/days`);
    await expect(page.getByText(days.banner.locked)).toBeVisible();
    await expect(cells(page)).toHaveCount(0);
    await expect(page.getByRole("button", { name: days.submit })).toHaveCount(0);
  });
});

test.describe("motion and accessibility", () => {
  test("reduced motion: painting a range runs no transform animation", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await setUp(page);
    await page.getByRole("button", { name: days.range }).click();
    const [a, , , d] = await firstDates(page, 4);
    await cell(page, a ?? "").click();
    await cell(page, d ?? "").click();
    const transforms = await page.evaluate(
      () =>
        document.getAnimations().filter((animation) => {
          const effect = animation.effect as KeyframeEffect | null;
          // Transitions collapse to 0.01 ms with reduced motion (tokens.css §6) – not motion.
          const duration = Number(effect?.getComputedTiming().duration ?? 0);
          return (
            duration > 1 && (effect?.getKeyframes().some((frame) => "transform" in frame) ?? false)
          );
        }).length,
    );
    expect(transforms).toBe(0);
  });

  test("R-046: skip links stay hidden until they get focus", async ({ page }) => {
    await setUp(page);
    const skip = page.getByRole("link", { name: days.skipCalendar });
    const hidden = () =>
      skip.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return rect.width <= 1 && rect.height <= 1;
      });
    expect(await hidden()).toBe(true);
    await skip.focus();
    expect(await hidden()).toBe(false);
  });

  test("axe – «My dates» light and dark, after painting", async ({ page }) => {
    test.slow();
    await setUp(page);
    const [a, b] = await firstDates(page, 2);
    await cell(page, a ?? "").click();
    await pickBrush(page, days.brush.maybe);
    await cell(page, b ?? "").click();
    await waitForAnimations(page);
    await expectNoSeriousAxeViolations(page, "days light");
    await page.emulateMedia({ colorScheme: "dark" });
    await expectNoSeriousAxeViolations(page, "days dark");
    await page.getByRole("button", { name: days.quick }).click();
    await expectNoSeriousAxeViolations(page, "quick actions sheet");
  });
});
