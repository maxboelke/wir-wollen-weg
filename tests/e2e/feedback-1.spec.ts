import { expect, test, type Page } from "@playwright/test";
import en from "../../messages/en.json" with { type: "json" };
import { expectNoSeriousAxeViolations, waitForAnimations } from "./helpers/axe";
import { signUp } from "./helpers/auth";
import {
  addAccountToTrip,
  addMemberWithDays,
  addPlaceholder,
  addVoter,
  isoDay,
  makeOrganizer,
  markAllSubmitted,
  markSubmitted,
  placeholderToken,
  seedPoll,
  seedTrip,
  setCelebratedFor,
} from "./helpers/db";
import { uniqueEmail } from "./helpers/mailpit";
import { openTripMenu } from "./helpers/trips";

// Feedback-Runde 1 (ux-spec §14): «Nächster Schritt» matrix (14.1), person status + remind
// sheet for everyone with WhatsApp (14.2), hint «Based on x of n» (14.3), phase 3 without tabs
// (14.4). Accounts: en-GB. Only visible elements and `expect.poll` – holds on 393 × 659.

test.use({ locale: "en-GB" });

const fill = (text: string, values: Record<string, string | number>) =>
  Object.entries(values).reduce(
    (out, [key, value]) => out.replaceAll(`{${key}}`, String(value)),
    text,
  );
const hydrated = (page: Page) => page.waitForLoadState("networkidle");
const nextCard = (page: Page) => page.getByRole("region", { name: en.trip.nextTitle });
const tabs = (page: Page) => page.getByRole("navigation", { name: en.trip.tabsLabel });
const day = (offset: number) => isoDay(30 + offset);

/** Kai (signed in) is a member of Lena's trip. */
async function memberTrip(page: Page) {
  const name = `Feedback ${String(Date.now())}`;
  const trip = await seedTrip(name);
  const email = await signUp(page, "Kai", uniqueEmail("kai"));
  await addAccountToTrip(trip.tripId, email, "Kai");
  return { ...trip, email, name };
}

test.describe("§14.1 Next step", () => {
  test("member, everyone in (N1-9): Lena's turn, no primary action, «Let Lena know» via WhatsApp", async ({
    page,
  }) => {
    const trip = await memberTrip(page);
    await markAllSubmitted(trip.tripId);
    await page.goto(`/trips/${trip.publicId}`);
    await hydrated(page);
    const card = nextCard(page);
    await expect(card.getByText(fill(en.trip.next.n1_9, { orga: "Lena Berg" }))).toBeVisible();
    await expect(
      card.getByRole("link", { name: en.trip.nextAction.suggestions, exact: true }),
    ).toBeVisible();
    // KPI: everyone in → the box is no button.
    await expect(page.getByText(en.trip.kpiAllDone, { exact: true })).toBeVisible();
    await expect(page.locator("[data-kpi-button]")).toHaveCount(0);

    await card
      .getByRole("button", { name: fill(en.trip.nextAction.nudgeOrga, { orga: "Lena Berg" }) })
      .click();
    const sheet = page.getByRole("dialog", {
      name: fill(en.remind.orgaTitle, { orga: "Lena Berg" }),
    });
    await expect(sheet).toBeVisible();
    const whatsapp = sheet.getByRole("link", { name: new RegExp(en.remind.whatsapp) });
    const href = await whatsapp.getAttribute("href");
    expect(href).toMatch(/^https:\/\/wa\.me\/\?text=/);
    expect(decodeURIComponent(href?.split("text=")[1] ?? "")).toContain(
      `Hey Lena Berg, everyone has added their dates for ${trip.name}`,
    );
    await expect(whatsapp).toHaveAttribute("target", "_blank");
    await waitForAnimations(page);
    await expectNoSeriousAxeViolations(page, "remind sheet orga step");
  });

  test("member, only the organiser is open (N1-11) → «Remind Lena Berg» opens her reminder", async ({
    page,
  }) => {
    const trip = await memberTrip(page);
    await markSubmitted(trip.tripId, trip.email);
    await page.goto(`/trips/${trip.publicId}`);
    await hydrated(page);
    const card = nextCard(page);
    await expect(card.getByText(fill(en.trip.next.n1_11, { orga: "Lena Berg" }))).toBeVisible();
    await card
      .getByRole("button", { name: fill(en.trip.nextAction.remindOrga, { orga: "Lena Berg" }) })
      .click();
    const sheet = page.getByRole("dialog", {
      name: fill(en.remind.remindName, { name: "Lena Berg" }),
    });
    await expect(sheet.getByRole("textbox")).toHaveValue(
      /^Hey Lena Berg, yours are the last dates/,
    );
  });

  test("organiser: all in (N1-5), own vote open (N2-5), «?fix=1» opens «Lock in dates»", async ({
    page,
  }) => {
    const trip = await memberTrip(page);
    await makeOrganizer(trip.tripId, trip.email);
    await markAllSubmitted(trip.tripId);
    await page.goto(`/trips/${trip.publicId}`);
    await expect(nextCard(page).getByText(en.trip.next.n1_5)).toBeVisible();
    await expect(
      nextCard(page).getByRole("link", { name: en.trip.nextAction.startVote }),
    ).toBeVisible();

    const ids = await seedPoll(trip.tripId, [
      [day(10), day(14)],
      [day(20), day(24)],
    ]);
    await addVoter(trip.tripId, "Zora", ids, ["yes", "no"]);
    // Kai and Lena still open → N2-5 for Kai (not voted).
    await page.goto(`/trips/${trip.publicId}`);
    await expect(nextCard(page).getByText(en.trip.next.n2_5)).toBeVisible();
    await page.goto(`/trips/${trip.publicId}/poll?fix=1`);
    await expect(page.getByRole("dialog", { name: en.poll.fix.title })).toBeVisible();
    await expect.poll(() => new URL(page.url()).search).toBe("");
  });
});

test.describe("§14.2 Person status and reminders", () => {
  test("member: KPI box opens «Who has added their dates?», single reminder, back focuses the row", async ({
    page,
  }) => {
    const trip = await memberTrip(page);
    await markSubmitted(trip.tripId, trip.email);
    await addMemberWithDays(trip.tripId, "Kemal", {}, false);
    await addMemberWithDays(trip.tripId, "Sara", {}, false);
    await addPlaceholder(trip.tripId, "Mia");
    await page.goto(`/trips/${trip.publicId}`);
    await hydrated(page);

    // Grouped list «Still missing» / «Dates added».
    const members = page.getByRole("region", { name: /Who's in\?/ });
    await expect(
      members.getByRole("heading", { name: fill(en.trip.groupOpen, { count: 4 }) }),
    ).toBeVisible();
    await expect(
      members.getByRole("heading", { name: fill(en.trip.groupSubmitted, { count: 1 }) }),
    ).toBeVisible();
    await expect(members.getByText(en.trip.status.placeholder)).toBeVisible();

    await page.locator("[data-kpi-button]").click();
    const list = page.getByRole("dialog", { name: en.remind.titleCollect });
    await expect(list).toBeVisible();
    await expect(
      list.getByRole("button", { name: fill(en.remind.remindAll, { count: 3 }) }),
    ).toBeVisible();
    const kemal = list.getByRole("button", { name: fill(en.remind.remindName, { name: "Kemal" }) });
    await kemal.click();
    const single = page.getByRole("dialog", {
      name: fill(en.remind.remindName, { name: "Kemal" }),
    });
    await expect(single.getByRole("textbox")).toHaveValue(
      new RegExp(`^Hey Kemal, we're still missing your dates for ${trip.name}!`),
    );
    const href = await single
      .getByRole("link", { name: new RegExp(en.remind.whatsapp) })
      .getAttribute("href");
    expect(decodeURIComponent(href ?? "")).toContain(`/trips/${trip.publicId}/days`);
    await single.getByRole("button", { name: en.remind.back }).click();
    await expect(
      page
        .getByRole("dialog", { name: en.remind.titleCollect })
        .getByRole("button", { name: fill(en.remind.remindName, { name: "Kemal" }) }),
    ).toBeFocused();
  });

  test("R-070: 200 % browser text on 360 × 640 – whole rows of the remind list fit, the sheet scrolls", async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== "chromium", "browser text size via CDP (Chromium only)");
    await page.setViewportSize({ width: 360, height: 640 });
    const cdp = await page.context().newCDPSession(page);
    // Browser text size 200 % (not page CSS) – `em` in media queries follows it.
    await cdp.send("Page.setFontSizes", { fontSizes: { standard: 32, fixed: 26 } });
    const trip = await memberTrip(page);
    for (const name of ["Ada", "Bo", "Cem", "Dana", "Eli", "Finn", "Gio", "Hana"]) {
      await addMemberWithDays(trip.tripId, name, {}, false);
    }
    await page.goto(`/trips/${trip.publicId}`);
    await hydrated(page);
    await page.locator("[data-kpi-button]").click();
    const sheet = page.getByRole("dialog", { name: en.remind.titleCollect });
    await expect(sheet).toBeVisible();
    await waitForAnimations(page);
    const rows = sheet.getByRole("listitem");
    await expect.poll(() => rows.count()).toBeGreaterThanOrEqual(2);
    // Scroll the first row to the top: rows 1–2 are then visible together, nothing clips them.
    const fits = await rows.first().evaluate((first) => {
      first.scrollIntoView({ block: "start" });
      const items = [...(first.parentElement?.children ?? [])].slice(0, 2);
      const visible = (el: Element) => {
        const rect = el.getBoundingClientRect();
        for (let box = el.parentElement; box; box = box.parentElement) {
          const style = getComputedStyle(box);
          if (style.overflowY === "visible") continue;
          const clip = box.getBoundingClientRect();
          if (rect.top < clip.top - 1 || rect.bottom > clip.bottom + 1) return false;
        }
        return rect.top >= -1 && rect.bottom <= window.innerHeight + 1;
      };
      return items.map(visible);
    });
    // Rows at 200 % are ~200 px high (name, status, button below) – two whole rows fit at once
    // (before: half a row in an inner scroll box).
    expect(fits.slice(0, 2)).toEqual([true, true]);
    // The «Remind all» button scrolls along and stays reachable.
    const all = sheet.getByRole("button", { name: /^Remind all \(\d+\)$/ });
    await all.scrollIntoViewIfNeeded();
    await expect(all).toBeInViewport();
  });

  test("placeholder: members get «Let Lena know» – the personal link never reaches them", async ({
    page,
  }) => {
    const trip = await memberTrip(page);
    await addPlaceholder(trip.tripId, "Mia");
    const token = await placeholderToken(trip.publicId, "Mia");
    await page.goto(`/trips/${trip.publicId}`);
    await hydrated(page);
    expect(await page.content()).not.toContain(token ?? "missing");

    await page
      .getByRole("region", { name: /Who's in\?/ })
      .getByRole("button", { name: fill(en.remind.remindName, { name: "Mia" }) })
      .click();
    const sheet = page.getByRole("dialog", {
      name: fill(en.remind.placeholderTitle, { name: "Mia" }),
    });
    await expect(
      sheet.getByText(fill(en.remind.placeholderText, { name: "Mia", orga: "Lena Berg" })),
    ).toBeVisible();
    await expect(sheet.getByRole("textbox")).toHaveValue(
      new RegExp(`^Hey Lena Berg, Mia still hasn't joined ${trip.name}`),
    );
  });

  test("placeholder, organiser: the reminder carries the personal link", async ({ page }) => {
    const trip = await memberTrip(page);
    await makeOrganizer(trip.tripId, trip.email);
    await addPlaceholder(trip.tripId, "Mia");
    const token = await placeholderToken(trip.publicId, "Mia");
    await page.goto(`/trips/${trip.publicId}`);
    await hydrated(page);
    await page
      .getByRole("region", { name: /Who's in\?/ })
      .getByRole("button", { name: fill(en.remind.remindName, { name: "Mia" }) })
      .click();
    const sheet = page.getByRole("dialog", { name: fill(en.remind.remindName, { name: "Mia" }) });
    await expect(sheet.getByRole("textbox")).toHaveValue(new RegExp(`/i/${token ?? "missing"}$`));
  });

  test("trip menu «Remind the group» for members while somebody else is open", async ({ page }) => {
    const trip = await memberTrip(page);
    await page.goto(`/trips/${trip.publicId}`);
    await hydrated(page);
    await openTripMenu(page);
    await page.getByRole("button", { name: en.trip.menuItems.remind }).click();
    await expect(page.getByRole("dialog", { name: en.remind.titleCollect })).toBeVisible();
  });
});

test.describe("§14.3 Based on x of n", () => {
  test("hint under «Everyone's in» names the missing people and goes when all are in", async ({
    page,
  }) => {
    const trip = await memberTrip(page);
    await markSubmitted(trip.tripId, trip.email);
    await addMemberWithDays(trip.tripId, "Zora", { no: [day(3)] });
    await addPlaceholder(trip.tripId, "Mia");
    await page.goto(`/trips/${trip.publicId}/group`);
    await hydrated(page);
    const hint = page.getByText(
      fill(en.group.basedOn, { done: 2, total: 4, names: "Lena Berg and Mia" }),
    );
    await expect(hint).toBeVisible();
    await page.getByRole("button", { name: en.group.basedOnRemind, exact: true }).click();
    await expect(page.getByRole("dialog", { name: en.remind.titleCollect })).toBeVisible();
  });

  test("viewer still open: «you» first and «Add your dates»; no hint once everybody is in", async ({
    page,
  }) => {
    const trip = await memberTrip(page);
    await addMemberWithDays(trip.tripId, "Zora", { no: [day(3)] });
    await page.goto(`/trips/${trip.publicId}/group`);
    await expect(
      page.getByText(fill(en.group.basedOn, { done: 1, total: 3, names: "you and Lena Berg" })),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: en.group.basedOnAddDates })).toBeVisible();

    await markAllSubmitted(trip.tripId);
    await page.goto(`/trips/${trip.publicId}/group`);
    await expect(page.getByText(/^Based on/)).toHaveCount(0);
  });
});

test.describe("§14.4 Phase 3: the overview is the trip hub", () => {
  test("no tabs, «How you decided» tiles, read-only sub-pages, deep links", async ({ page }) => {
    const trip = await memberTrip(page);
    const ids = await seedPoll(trip.tripId, [[day(10), day(14)]], { fixed: true });
    await addVoter(trip.tripId, "Zora", ids, ["yes"]);
    // Celebration due → /poll leads to the overview first.
    await page.goto(`/trips/${trip.publicId}/poll`);
    await expect(page).toHaveURL(new RegExp(`/trips/${trip.publicId}$`));
    await expect(tabs(page)).toHaveCount(0);
    await expect(nextCard(page)).toHaveCount(0);
    await expect(
      page.getByRole("heading", { level: 2, name: en.trip.hub.decidedTitle }),
    ).toBeVisible();

    await setCelebratedFor(trip.tripId, trip.email, `${day(10)}/${day(14)}`);
    await page.goto(`/trips/${trip.publicId}`);
    await page.getByRole("link", { name: new RegExp(en.trip.hub.pollTitle) }).click();
    await expect(page).toHaveURL(new RegExp(`/trips/${trip.publicId}/poll$`));
    await expect(page.getByText(en.trip.hub.pollTitle).first()).toBeVisible();
    await expect(tabs(page)).toHaveCount(0);
    await expect(page.getByRole("button", { name: en.poll.fixButton })).toHaveCount(0);

    await page.goto(`/trips/${trip.publicId}/group?view=calendar`);
    await expect(page.getByText(en.trip.hub.groupTitle).first()).toBeVisible();
    await expect(tabs(page)).toHaveCount(0);
    await expect(page.getByText(/^Based on/)).toHaveCount(0);

    for (const path of ["days", "poll/new"]) {
      await page.goto(`/trips/${trip.publicId}/${path}`);
      await expect(page).toHaveURL(new RegExp(`/trips/${trip.publicId}$`));
    }
    await waitForAnimations(page);
    await expectNoSeriousAxeViolations(page, "phase 3 hub");
  });

  test("R-071: open placeholders only at the end under «Not joined (n)», without reminders", async ({
    page,
  }) => {
    const trip = await memberTrip(page);
    for (const name of ["Ada", "Bo", "Cem", "Dana", "Eli", "Finn", "Gio"]) {
      await addMemberWithDays(trip.tripId, name, {});
    }
    await addPlaceholder(trip.tripId, "Mia");
    await seedPoll(trip.tripId, [[day(10), day(14)]], { fixed: true });
    await setCelebratedFor(trip.tripId, trip.email, `${day(10)}/${day(14)}`);
    await page.goto(`/trips/${trip.publicId}`);
    await hydrated(page);

    const members = page.getByRole("region", { name: /Who's in\?/ });
    const toggle = members.getByRole("button", { name: fill(en.trip.showAll, { count: 9 }) });
    const notJoined = members.getByRole("region", {
      name: fill(en.trip.groupNotJoined, { count: 1 }),
    });
    await expect(toggle).toBeVisible();
    await expect(notJoined.getByText("Mia", { exact: true })).toBeVisible();
    await expect(notJoined.getByRole("button")).toHaveCount(0);
    // The folded list holds 5 members – Mia is not among them, and comes after the toggle.
    const list = page.locator(`[id="${String(await toggle.getAttribute("aria-controls"))}"]`);
    await expect(list.getByRole("listitem")).toHaveCount(5);
    await expect(list.getByText("Mia", { exact: true })).toHaveCount(0);
    const toggleBox = await toggle.boundingBox();
    const notJoinedBox = await notJoined.boundingBox();
    expect(notJoinedBox?.y ?? 0).toBeGreaterThan(toggleBox?.y ?? Infinity);

    await toggle.click();
    await expect(list.getByRole("listitem")).toHaveCount(9);
    await expect(list.getByText("Mia", { exact: true })).toHaveCount(0);
    await waitForAnimations(page);
    await expectNoSeriousAxeViolations(page, "phase 3 members with placeholder");
  });

  test("members see «Lena Berg has reopened the dates» once after «Undo locked dates»", async ({
    page,
  }) => {
    const trip = await memberTrip(page);
    await seedPoll(trip.tripId, [[day(10), day(14)]]);
    const notice = fill(en.trip.reopenedNotice, { orga: "Lena Berg" });
    // R-069 (a): Kai celebrated an earlier fixing, but this is a NEW vote (after a cancel) –
    // nothing was reopened, no notice.
    await setCelebratedFor(trip.tripId, trip.email, `${day(10)}/${day(14)}`);
    await page.goto(`/trips/${trip.publicId}`);
    await expect(tabs(page)).toBeVisible();
    await expect(page.getByText(notice)).toHaveCount(0);
    // Kai had celebrated the fixing Lena just undid.
    await setCelebratedFor(trip.tripId, trip.email, `${day(10)}/${day(14)}`, true);
    await page.goto(`/trips/${trip.publicId}`);
    await expect(page.getByText(notice)).toBeVisible();
    await expect(tabs(page)).toBeVisible();
    await hydrated(page);
    await expect
      .poll(async () => {
        await page.goto(`/trips/${trip.publicId}`);
        return page.getByText(notice).count();
      })
      .toBe(0);
  });
});
