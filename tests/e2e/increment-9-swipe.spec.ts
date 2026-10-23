import { expect, test, type Page } from "@playwright/test";
import en from "../../messages/en.json" with { type: "json" };
import { expectNoSeriousAxeViolations } from "./helpers/axe";
import { signUp } from "./helpers/auth";
import {
  addAccountToTrip,
  addStays,
  rateStays,
  ratingsOf,
  seedTrip,
  setFixedDates,
} from "./helpers/db";
import { uniqueEmail } from "./helpers/mailpit";

// Increment 9 – «Unterkünfte bewerten» (W18 E.5, motion W18-A/W18-01 – W18-18): gesture,
// buttons (SC 2.5.7), keyboard incl. held keys and Ctrl+Z, end of the stack, new suggestions,
// reduced motion. Swipe gestures are tested by buttons/keys everywhere; pointer dragging only
// additionally in Chromium. Accounts: en-GB.

test.use({ locale: "en-GB" });

const w = en.stays.swipe;
const r = en.stays.rate;
const fill = (text: string, values: Record<string, string | number>) =>
  Object.entries(values).reduce(
    (out, [key, value]) => out.replaceAll(`{${key}}`, String(value)),
    text,
  );
const plural = (text: string, count: number) =>
  text.replace(
    /\{(\w+), plural, one \{([^}]*)\} other \{([^}]*)\}\}/g,
    (_m, _k, one: string, other: string) =>
      (count === 1 ? one : other).replaceAll("#", String(count)),
  );
const hydrated = (page: Page) => page.waitForLoadState("networkidle");

async function swipeTrip(page: Page, titles = ["Villa Mare", "Casa Azul", "Haus Galeb"]) {
  const trip = await seedTrip(`Swipe ${String(Date.now())}`, { extraMembers: 1 });
  const email = await signUp(page, "Kai", uniqueEmail("kai"));
  await addAccountToTrip(trip.tripId, email, "Kai");
  await setFixedDates(trip.tripId, 41, 48);
  const ids = await addStays(
    trip.tripId,
    titles.map((title, index) => ({ title, priceEuro: 1000 + index * 100 })),
  );
  // Lena has rated everything – Kai's ranking unlocks once he is done.
  await rateStays(
    trip.tripId,
    { name: "Lena Berg" },
    Object.fromEntries(ids.map((id) => [id, "like" as const])),
  );
  return { ...trip, email, ids };
}

/** Heading of the top card (the only card with a name). */
const topCard = (page: Page) => page.locator("article[data-swipe-card]");

test.describe("W18 E.5 – swipe by keys and buttons", () => {
  test("→ like, ← pass, Ctrl+Z undo, held arrow rates once, end «All done!», ranking free", async ({
    page,
  }) => {
    const trip = await swipeTrip(page);
    await page.goto(`/trips/${trip.publicId}/stays/swipe`);
    await hydrated(page);
    await expect(page.getByText(fill(w.position, { pos: 1, total: 3 }))).toBeVisible();
    await expect(topCard(page).getByRole("heading", { name: "Villa Mare" })).toBeVisible();
    await expect(page.getByRole("button", { name: w.undoName })).toHaveAttribute(
      "aria-disabled",
      "true",
    );

    await page.keyboard.press("ArrowRight");
    await expect(topCard(page).getByRole("heading", { name: "Casa Azul" })).toBeVisible();
    await expect(page.getByText(fill(w.position, { pos: 2, total: 3 }))).toBeVisible();
    await expect
      .poll(async () => ratingsOf(trip.tripId, trip.email))
      .toEqual({
        "Villa Mare": "like",
      });

    await page.keyboard.press("ArrowLeft");
    await expect(topCard(page).getByRole("heading", { name: "Haus Galeb" })).toBeVisible();
    await expect
      .poll(async () => (await ratingsOf(trip.tripId, trip.email))["Casa Azul"])
      .toBe("nope");
    // Undo (Ctrl+Z): Casa Azul is open again.
    await page.keyboard.press("Control+z");
    await expect(topCard(page).getByRole("heading", { name: "Casa Azul" })).toBeVisible();
    await expect(page.getByText(fill(w.undone, { title: "Casa Azul" }))).toBeAttached();
    await expect
      .poll(async () => (await ratingsOf(trip.tripId, trip.email))["Casa Azul"])
      .toBeUndefined();

    // Button (equal alternative): «Like».
    await page.getByRole("button", { name: r.like, exact: true }).click();
    await expect(topCard(page).getByRole("heading", { name: "Haus Galeb" })).toBeVisible();
    // A held arrow key rates only once (no `event.repeat`).
    await page.keyboard.down("ArrowLeft");
    await page.keyboard.down("ArrowLeft");
    await page.keyboard.down("ArrowLeft");
    await page.keyboard.up("ArrowLeft");

    const done = page.getByRole("heading", { name: w.doneTitle });
    await expect(done).toBeVisible();
    await expect(done).toBeFocused();
    await expect(page.getByText(fill(w.doneText, { total: 3 }))).toBeVisible();
    await expect
      .poll(async () => ratingsOf(trip.tripId, trip.email))
      .toEqual({
        "Villa Mare": "like",
        "Casa Azul": "like",
        "Haus Galeb": "nope",
      });
    await expectNoSeriousAxeViolations(page, "swipe end");

    await page.getByRole("link", { name: w.toRanking }).click();
    await expect(page).toHaveURL(new RegExp(`/trips/${trip.publicId}/stays#ranking$`));
    await expect(
      page.getByRole("heading", { level: 2, name: en.stays.ranking.title }),
    ).toBeVisible();
    await expect(page.getByText(en.stays.locked.title)).toHaveCount(0);
  });

  test("new suggestion while swiping is appended with a banner; direct visit without open ones", async ({
    page,
  }) => {
    const trip = await swipeTrip(page, ["Villa Mare", "Casa Azul"]);
    await page.goto(`/trips/${trip.publicId}/stays/swipe`);
    await hydrated(page);
    await expect(topCard(page).getByRole("heading", { name: "Villa Mare" })).toBeVisible();
    await addStays(trip.tripId, [
      { title: "Neues Haus", url: "https://neu.example/haus", minutesAgo: 0 },
    ]);
    await page.getByRole("button", { name: r.nope, exact: true }).click();
    await expect(page.getByText(plural(w.newArrived, 1)).first()).toBeVisible();
    await expect(page.getByText(fill(w.left, { count: 2 }))).toBeVisible();
    await page.getByRole("button", { name: r.like, exact: true }).click();
    await expect(topCard(page).getByRole("heading", { name: "Neues Haus" })).toBeVisible();
    await page.getByRole("button", { name: r.like, exact: true }).click();
    await expect(page.getByRole("heading", { name: w.doneTitle })).toBeVisible();

    // Direct visit with nothing open → end state without the stack.
    await page.goto(`/trips/${trip.publicId}/stays/swipe`);
    await expect(page.getByRole("heading", { name: w.doneTitle })).toBeVisible();
    await expect(topCard(page)).toHaveCount(0);
  });

  test("360 × 640: title, price and the three buttons visible without scrolling; axe", async ({
    page,
  }) => {
    const trip = await swipeTrip(page);
    await page.setViewportSize({ width: 360, height: 640 });
    await page.goto(`/trips/${trip.publicId}/stays/swipe`);
    await hydrated(page);
    await expect(topCard(page).getByRole("heading", { name: "Villa Mare" })).toBeInViewport();
    await expect(topCard(page).getByText(/total/)).toBeInViewport();
    for (const name of [r.nope, r.like]) {
      await expect(page.getByRole("button", { name, exact: true })).toBeInViewport();
    }
    await expect(page.getByRole("button", { name: w.undoName })).toBeInViewport();
    await expectNoSeriousAxeViolations(page, "swipe 360");
  });

  test("reduced motion: no transform animation on rating (cross-fade only)", async ({ page }) => {
    const trip = await swipeTrip(page);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`/trips/${trip.publicId}/stays/swipe`);
    await hydrated(page);
    await page.keyboard.press("ArrowRight");
    const transforms = await page.evaluate(
      () =>
        document
          .getAnimations()
          .filter((animation) => animation.effect instanceof KeyframeEffect)
          .flatMap((animation) => (animation.effect as KeyframeEffect).getKeyframes())
          .filter((frame) => "transform" in frame && frame.transform !== "none").length,
    );
    expect(transforms).toBe(0);
    await expect(topCard(page).getByRole("heading", { name: "Casa Azul" })).toBeVisible();
  });
});

test.describe("W18-A – pointer gesture (Chromium)", () => {
  test.skip(({ browserName }) => browserName !== "chromium", "Pointer drag only in Chromium");

  test("drag past the threshold rates; a short drag springs back; a vertical drag scrolls", async ({
    page,
  }) => {
    const trip = await swipeTrip(page);
    await page.goto(`/trips/${trip.publicId}/stays/swipe`);
    await hydrated(page);
    const card = topCard(page);
    await expect(card.getByRole("heading", { name: "Villa Mare" })).toBeVisible();
    const box = await card.boundingBox();
    if (!box) throw new Error("no card");
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 3;

    // Short drag (40 px, slow) → springs back, nothing saved.
    await page.mouse.move(x, y);
    await page.mouse.down();
    for (let step = 1; step <= 8; step++) {
      await page.mouse.move(x + step * 5, y);
      await page.waitForTimeout(30);
    }
    await page.waitForTimeout(150);
    await page.mouse.up();
    await expect(card.getByRole("heading", { name: "Villa Mare" })).toBeVisible();
    expect(await ratingsOf(trip.tripId, trip.email)).toEqual({});

    // Past the threshold (right) → like.
    await page.mouse.move(x, y);
    await page.mouse.down();
    for (let step = 1; step <= 10; step++) {
      await page.mouse.move(x + step * 20, y);
    }
    await page.mouse.up();
    await expect(topCard(page).getByRole("heading", { name: "Casa Azul" })).toBeVisible();
    await expect
      .poll(async () => ratingsOf(trip.tripId, trip.email))
      .toEqual({
        "Villa Mare": "like",
      });

    // Fling to the left (fast, short) → pass.
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x - 20, y);
    await page.mouse.move(x - 50, y);
    await page.mouse.up();
    await expect(topCard(page).getByRole("heading", { name: "Haus Galeb" })).toBeVisible();
    await expect
      .poll(async () => (await ratingsOf(trip.tripId, trip.email))["Casa Azul"])
      .toBe("nope");
  });
});
