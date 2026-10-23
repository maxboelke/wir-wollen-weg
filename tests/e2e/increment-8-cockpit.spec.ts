import { expect, test, type Page } from "@playwright/test";
import en from "../../messages/en.json" with { type: "json" };
import { expectNoSeriousAxeViolations, waitForAnimations } from "./helpers/axe";
import { signUp } from "./helpers/auth";
import {
  addAccountToTrip,
  addPlaceholder,
  cockpitState,
  isoDay,
  makeOrganizer,
  seedTrip,
  setFixedDates,
  setTripInfo,
} from "./helpers/db";
import { uniqueEmail } from "./helpers/mailpit";
import { openTripMenu } from "./helpers/trips";

// Increment 8 (F-053 «Reiseverlauf», UX-8, UX-9 – W16 v2.13): ticket head, way with «Heute»,
// sub-phases, tile «Info», «More about the trip». Accounts: en-GB. Only visible elements and
// `expect.poll` – holds on 393 × 659 (WebKit in CI).

test.use({ locale: "en-GB" });

const r = en.route;
const fill = (text: string, values: Record<string, string | number>) =>
  Object.entries(values).reduce(
    (out, [key, value]) => out.replaceAll(`{${key}}`, String(value)),
    text,
  );
const hydrated = (page: Page) => page.waitForLoadState("networkidle");

/** Kai (signed in) in Lena's trip; `role` organizer → Kai is the organiser. */
async function fixedTrip(
  page: Page,
  options: {
    role?: "member" | "organizer";
    start?: number;
    end?: number;
    fixedDaysAgo?: number;
    announced?: boolean;
    description?: string;
  } = {},
) {
  const name = `Cockpit ${String(Date.now())}`;
  const trip = await seedTrip(
    name,
    options.description === undefined ? {} : { description: options.description },
  );
  const email = await signUp(page, "Kai", uniqueEmail("kai"));
  await addAccountToTrip(trip.tripId, email, "Kai");
  if (options.role === "organizer") await makeOrganizer(trip.tripId, email);
  await setFixedDates(trip.tripId, options.start ?? 41, options.end ?? 48, {
    fixedDaysAgo: options.fixedDaysAgo ?? 30,
    announced: options.announced ?? true,
  });
  return { ...trip, email, name };
}

test.describe("W16 v2 – Vorbereitung", () => {
  test("member with an open placeholder: H-2, «Let Lena Berg know», no personal link, no teasers", async ({
    page,
  }) => {
    const trip = await fixedTrip(page);
    await addPlaceholder(trip.tripId, "Mia");
    await page.goto(`/trips/${trip.publicId}`);
    await hydrated(page);

    // Row 1: trip name is h1; phase line as text; no tabs (UX-1).
    await expect(page.getByRole("heading", { level: 1, name: trip.name })).toBeVisible();
    await expect(page.getByText(/Locked in · 41 days to go/).first()).toBeVisible();
    await expect(page.getByText("41 days until you leave.")).toBeAttached();
    await expect(page.getByRole("navigation", { name: en.trip.tabsLabel })).toHaveCount(0);
    // Ring = button «Countdown: 41 days to go», calendar button in the stub.
    await expect(page.getByRole("button", { name: "Countdown: 41 days to go" })).toBeVisible();
    await expect(page.getByRole("button", { name: en.poll.result.addToCalendar })).toBeVisible();

    await expect(page.getByRole("heading", { level: 2, name: r.way.before })).toBeVisible();
    // Increment 9: station V3 «Place to stay» counts too (W16 v2.14 «{done} von 3 geschafft»).
    await expect(page.getByText(fill(r.meta.done, { done: 1, total: 3 }))).toBeVisible();
    await expect(
      page.getByText("Nothing for you right now. You’re waiting on: Mia to join."),
    ).toBeVisible();
    // No primary action for a waiting member.
    await expect(
      page.locator("main a[class*='primary'], main button[class*='primary']"),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Waiting on others: Everyone’s in. Mia hasn’t joined yet" }),
    ).toBeVisible();

    // Waiting → «Let Lena Berg know»: text with the TRIP link, never Mia's personal link.
    await page.getByRole("button", { name: "Let Lena Berg know that Mia is missing" }).click();
    const sheet = page.getByRole("dialog", {
      name: fill(en.remind.orgaTitle, { orga: "Lena Berg" }),
    });
    await expect(sheet).toBeVisible();
    await expect(sheet.locator("textarea")).toHaveValue(/Hey Lena Berg, Mia still hasn.t joined/);
    const html = await (await page.request.get(`/trips/${trip.publicId}`)).text();
    expect(html).not.toMatch(/\/i\/[A-Za-z0-9_-]{40,}/);
    await page.keyboard.press("Escape");

    // Tile «Info» (empty, member) and «More about the trip».
    await expect(
      page.getByRole("link", { name: "Info. Still empty – Lena Berg will add it" }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: r.moreTitle })).toBeVisible();
    // W16 v2.13: no teasers for areas that are not built (increments 10–12); V3 «Place to stay»
    // is built since Increment 9 and stands «Up next» without suggestions (W16 v2.14 rule 9).
    await expect(page.getByRole("link", { name: /^Up next: Place to stay\./ })).toBeVisible();
    const main = page.locator("main");
    for (const word of [/costs?\b/i, /documents/i, /tickets/i, /travel details/i]) {
      await expect(main.getByText(word)).toHaveCount(0);
    }
    await expectNoSeriousAxeViolations(page, "cockpit member");
  });

  test("organiser right after fixing: V1 your turn → share → done; «Mia joins without the app» + undo", async ({
    page,
  }) => {
    const trip = await fixedTrip(page, { role: "organizer", fixedDaysAgo: 0, announced: false });
    await addPlaceholder(trip.tripId, "Mia");
    await page.goto(`/trips/${trip.publicId}`);
    await hydrated(page);
    await expect(page.getByText("Your turn – one thing for you.")).toBeVisible();
    const first = page.locator("main").getByText(r.label.yours, { exact: true }).first();
    await expect(first).toBeVisible();
    // The only primary action of the page.
    const announce = page.getByRole("button", { name: r.v1.announce });
    await expect(announce).toBeVisible();
    await announce.click();
    const share = page.getByRole("dialog", { name: en.poll.result.tellEveryone });
    await expect(share).toBeVisible();
    await share.getByRole("button", { name: en.share.copyText }).click();
    await expect
      .poll(async () => (await cockpitState(trip.publicId, trip.email))?.announced)
      .toBe(true);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", { name: r.v1.announce })).toHaveCount(0);

    // UX-9: «Mia joins without the app» → V2 done for everyone, undo in the done list.
    await page
      .getByRole("button", { name: fill(r.v2.withoutApp, { name: "Mia" }) })
      .first()
      .click();
    await expect
      .poll(async () => (await cockpitState(trip.publicId, trip.email))?.offline)
      .toEqual(["Mia"]);
    await expect(page.getByText(r.sentence.h3)).toBeVisible();
    await page.getByRole("button", { name: /2 done/ }).click();
    await expect(page.getByText(r.done.offline)).toBeVisible();
    await page.getByRole("button", { name: fill(r.v2.undo, { name: "Mia" }) }).click();
    await expect
      .poll(async () => (await cockpitState(trip.publicId, trip.email))?.offline)
      .toBeNull();
    await expect(
      page.getByText("Nothing for you right now. You’re waiting on: Mia to join."),
    ).toBeVisible();
  });

  test("organiser ≤ 21 days before with empty infos: task A2 → edit form → saved → info page", async ({
    page,
  }) => {
    const trip = await fixedTrip(page, { role: "organizer", start: 10, end: 14 });
    await page.goto(`/trips/${trip.publicId}`);
    await hydrated(page);
    await expect(page.getByText(r.a2.status)).toBeVisible();
    await page.getByRole("link", { name: r.a2.action, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/trips/${trip.publicId}/info/edit$`));
    await hydrated(page);
    const f = en.tripInfo.form;
    await page.getByLabel(f.stayName).fill("Kamena Kuća");
    await page.getByLabel(f.address).fill("Put Zlatnog rata 8\n21420 Bol");
    await page.getByLabel(f.checkIn).fill("15:00");
    await page.getByLabel(f.meetingPoint).fill("Meet 6:15 at the airport T2\nLena has the passes");
    await page.getByLabel(f.emergencyPhone).fill("call Ana");
    await page
      .getByLabel(f.notes)
      .fill("Playlist: https://example.org/list and javascript:alert(1)");
    await page.getByRole("button", { name: f.save }).click();
    await expect(page.getByText(f.errorPhone)).toBeVisible();
    await page.getByLabel(f.emergencyPhone).fill("+385 21 123 456");
    await page.getByRole("button", { name: f.save }).click();
    await expect(page).toHaveURL(new RegExp(`/trips/${trip.publicId}/info$`));
    await expect(page.getByText(f.saved)).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 2, name: en.tripInfo.stayTitle }),
    ).toBeVisible();
    const maps = page.getByRole("link", { name: new RegExp(en.tripInfo.maps) });
    await expect(maps).toHaveAttribute("href", /^https:\/\/www\.google\.com\/maps\/search\//);
    await expect(maps).toHaveAttribute("rel", "noopener noreferrer");
    await expect(page.getByRole("link", { name: "+385 21 123 456" })).toHaveAttribute(
      "href",
      "tel:+38521123456",
    );
    await expect(page.getByRole("link", { name: /https:\/\/example\.org\/list/ })).toHaveAttribute(
      "target",
      "_blank",
    );
    await expect(page.getByRole("link", { name: /javascript/ })).toHaveCount(0);
    await expect(page.getByText(/Last changed by Kai/)).toBeVisible();
    await expectNoSeriousAxeViolations(page, "info page");

    // Back on the cockpit: A2 is gone, the goal shows the first line of the meeting point.
    await page.goto(`/trips/${trip.publicId}`);
    await expect(page.getByText(r.a2.status)).toHaveCount(0);
    await expect(page.getByText("Meet 6:15 at the airport T2").first()).toBeVisible();
  });

  test("concurrent edits: conflict notice, saving again overwrites (last save wins)", async ({
    page,
    context,
  }) => {
    const trip = await fixedTrip(page, { role: "organizer" });
    await setTripInfo(trip.tripId, { stay_name: "Old name" });
    const f = en.tripInfo.form;
    await page.goto(`/trips/${trip.publicId}/info/edit`);
    await hydrated(page);
    const other = await context.newPage();
    await other.goto(`/trips/${trip.publicId}/info/edit`);
    await hydrated(other);
    await other.getByLabel(f.stayName).fill("Their name");
    await other.getByRole("button", { name: f.save }).click();
    await expect(other).toHaveURL(new RegExp(`/info$`));
    await other.close();

    await page.getByLabel(f.stayName).fill("My name");
    await page.getByRole("button", { name: f.save }).click();
    await expect(page.getByText(fill(f.conflict, { name: "Kai" }))).toBeVisible();
    await expect
      .poll(async () => (await cockpitState(trip.publicId, trip.email))?.stay_name)
      .toBe("Their name");
    await page.getByRole("button", { name: f.save }).click();
    await expect(page).toHaveURL(new RegExp(`/info$`));
    await expect
      .poll(async () => (await cockpitState(trip.publicId, trip.email))?.stay_name)
      .toBe("My name");
  });

  test("two parallel FIRST saves (no infos yet): exactly one wins, the other gets the conflict", async ({
    page,
    context,
  }) => {
    const trip = await fixedTrip(page, { role: "organizer" });
    const f = en.tripInfo.form;
    const other = await context.newPage();
    for (const tab of [page, other]) {
      await tab.goto(`/trips/${trip.publicId}/info/edit`);
      await hydrated(tab);
    }
    await page.getByLabel(f.stayName).fill("Mine");
    await other.getByLabel(f.stayName).fill("Theirs");
    await Promise.all([
      page.getByRole("button", { name: f.save }).click(),
      other.getByRole("button", { name: f.save }).click(),
    ]);
    const conflict = fill(f.conflict, { name: "Kai" });
    const outcome = async (tab: Page) => {
      await expect
        .poll(async () =>
          /\/info$/.test(tab.url())
            ? "saved"
            : (await tab.getByText(conflict).isVisible())
              ? "conflict"
              : "pending",
        )
        .not.toBe("pending");
      return /\/info$/.test(tab.url()) ? "saved" : "conflict";
    };
    const mine = await outcome(page);
    const theirs = await outcome(other);
    expect([mine, theirs].sort()).toEqual(["conflict", "saved"]);
    const state = await cockpitState(trip.publicId, trip.email);
    expect(state?.info_version).toBe(1);
    expect(state?.stay_name).toBe(mine === "saved" ? "Mine" : "Theirs");
    await other.close();
  });

  test("rights: members cannot edit (redirect), info page only in phase 3 and for members", async ({
    page,
    browser,
  }) => {
    const trip = await fixedTrip(page);
    await page.goto(`/trips/${trip.publicId}/info/edit`);
    await expect(page).toHaveURL(new RegExp(`/trips/${trip.publicId}/info$`));
    await expect(page.getByRole("link", { name: en.tripInfo.editName })).toHaveCount(0);
    await expect(
      page.getByText(fill(en.tripInfo.emptyMember, { names: "Lena Berg" })),
    ).toBeVisible();

    // Another account (no member): the shared «trip not found».
    const stranger = await browser.newContext({ locale: "en-GB" });
    const strangerPage = await stranger.newPage();
    await signUp(strangerPage, "Zed", uniqueEmail("zed"));
    const response = await strangerPage.goto(`/trips/${trip.publicId}/info`);
    expect(response?.status()).toBe(404);
    await stranger.close();

    // Phase 1/2: back to the trip (data stays).
    const open = await seedTrip(`Open ${String(Date.now())}`);
    await addAccountToTrip(open.tripId, trip.email, "Kai");
    await page.goto(`/trips/${open.publicId}/info`);
    await expect(page).toHaveURL(new RegExp(`/trips/${open.publicId}(/days)?$`));
  });

  test("«More about the trip» and the trip menu open the sheets", async ({ page }) => {
    const trip = await fixedTrip(page, { description: "Sun, pastéis, surfing." });
    await page.goto(`/trips/${trip.publicId}`);
    await hydrated(page);
    await page
      .getByRole("button", {
        name: new RegExp(fill(r.members.title, { count: 2 }).replace(/[()?]/g, "\\$&")),
      })
      .first()
      .click();
    const members = page.getByRole("dialog", { name: fill(r.members.title, { count: 2 }) });
    await expect(members.getByText("Lena Berg")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(members).toBeHidden();
    await openTripMenu(page);
    await page
      .getByRole("dialog")
      .getByRole("button", { name: en.trip.menuItems.decided, exact: true })
      .click();
    const decided = page.getByRole("dialog", { name: r.decided.title });
    await expect(decided).toBeVisible();
    await expect(decided.getByRole("link", { name: r.decided.poll })).toBeVisible();
    // CEO 2026-10-22: the trip description as a quote line on top of the sheet.
    await expect(decided.getByText("Sun, pastéis, surfing.")).toBeVisible();
  });
});

test.describe("W16 v2 – Unterwegs and Danach", () => {
  test("arrival day (UX-8): H-7, meeting point as today's plan, small celebration once per person", async ({
    page,
  }) => {
    const trip = await fixedTrip(page, { start: 0, end: 7 });
    await setTripInfo(trip.tripId, {
      meeting_point: "7:30 at the car rental desk\nBen picks up the car",
      check_out: "10:30",
    });
    await page.goto(`/trips/${trip.publicId}`);
    await expect(page.getByText(r.sentence.h7)).toBeVisible();
    await expect(page.getByText(/On the road · day 1 of 8/).first()).toBeVisible();
    await expect(page.getByText(r.label.plan, { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: r.plan.meetAction })).toBeVisible();
    await expect(page.getByText(r.goal.home, { exact: true })).toBeVisible();
    await expect
      .poll(async () => (await cockpitState(trip.publicId, trip.email))?.departure)
      .toBe(isoDay(0));
    // Second visit: no small round any more (server marker).
    const html = await (await page.request.get(`/trips/${trip.publicId}`)).text();
    expect(html).not.toContain('data-celebrate="small"');
    // No head buttons while travelling in Increment 8.
    await expect(page.getByRole("button", { name: en.poll.result.addToCalendar })).toHaveCount(0);
    await waitForAnimations(page);
    await expectNoSeriousAxeViolations(page, "cockpit departure day");
  });

  test("day 3 without plans: H-4; open placeholder is «not used»", async ({ page }) => {
    const trip = await fixedTrip(page, { start: -2, end: 5 });
    await addPlaceholder(trip.tripId, "Mia");
    await page.goto(`/trips/${trip.publicId}`);
    await expect(page.getByText(r.sentence.h4)).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: r.way.during })).toBeVisible();
    await page.getByRole("button", { name: /Preparation · 1 done/ }).click();
    await expect(page.getByText(/not used – Mia didn’t join/)).toBeVisible();
  });

  test("after the trip: H-5b, «Back for 9 days», «Where to next?» and the deletion date", async ({
    page,
  }) => {
    const trip = await fixedTrip(page, { start: -16, end: -9 });
    await page.goto(`/trips/${trip.publicId}`);
    await expect(page.getByText(r.sentence.h5b)).toBeVisible();
    await expect(page.getByText("Back for 9 days").first()).toBeVisible();
    await expect(page.getByRole("link", { name: r.goal.newTrip })).toHaveAttribute(
      "href",
      "/trips/new",
    );
    await expect(page.getByText(/This trip will be deleted automatically on/)).toBeVisible();
  });
});

test.describe("responsive and accessibility", () => {
  test("360 px with 200 % text: no horizontal scrolling, rail instead of the line", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    const trip = await fixedTrip(page);
    await addPlaceholder(trip.tripId, "Mia");
    await page.goto(`/trips/${trip.publicId}`);
    await hydrated(page);
    await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
    await expect(page.locator("#route-today")).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(() => {
          // Cockpit only (head, ticket, way) – the shared page footer is not part of W16.
          document.querySelector("footer")?.style.setProperty("display", "none");
          return document.documentElement.scrollWidth - document.documentElement.clientWidth;
        }),
      )
      .toBeLessThanOrEqual(0);
    // Narrow container: markers sit in the label chips (22 px) instead of the 32 px column.
    await expect
      .poll(() =>
        page.evaluate(() => {
          const marker = document.querySelector("[data-route-marker='wait']");
          return marker ? Math.round(marker.getBoundingClientRect().width) : 0;
        }),
      )
      .toBeLessThan(30);
  });

  for (const scheme of ["light", "dark"] as const) {
    test(`axe ${scheme}: organiser cockpit with sheets, edit form`, async ({ page }) => {
      test.setTimeout(60_000);
      await page.emulateMedia({ colorScheme: scheme });
      const trip = await fixedTrip(page, {
        role: "organizer",
        start: 12,
        end: 18,
        announced: false,
        fixedDaysAgo: 1,
      });
      await addPlaceholder(trip.tripId, "Mia");
      await page.goto(`/trips/${trip.publicId}`);
      await hydrated(page);
      await expectNoSeriousAxeViolations(page, `cockpit organiser ${scheme}`);
      await page.getByRole("button", { name: "Remind Mia – send the personal link" }).click();
      await expect(
        page.getByRole("dialog", { name: fill(en.remind.remindName, { name: "Mia" }) }),
      ).toBeVisible();
      await expectNoSeriousAxeViolations(page, `remind placeholder ${scheme}`);
      await page.keyboard.press("Escape");
      await page.goto(`/trips/${trip.publicId}/info/edit`);
      await hydrated(page);
      await expectNoSeriousAxeViolations(page, `info edit ${scheme}`);
    });
  }

  test("reduced motion: no pulse, no build-up, the departure marker is still set", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const trip = await fixedTrip(page, { start: 0, end: 3 });
    await page.goto(`/trips/${trip.publicId}`);
    await expect(page.getByText(r.sentence.h7)).toBeVisible();
    await expect
      .poll(async () => (await cockpitState(trip.publicId, trip.email))?.departure)
      .toBe(isoDay(0));
    const running = await page.evaluate(
      () => document.getAnimations().filter((a) => a.playState === "running").length,
    );
    expect(running).toBe(0);
  });
});
