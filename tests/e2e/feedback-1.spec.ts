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

  test("members see «Lena Berg has reopened the dates» once after «Undo locked dates»", async ({
    page,
  }) => {
    const trip = await memberTrip(page);
    await seedPoll(trip.tripId, [[day(10), day(14)]]);
    // Kai had celebrated the earlier fixing.
    await setCelebratedFor(trip.tripId, trip.email, `${day(10)}/${day(14)}`);
    const notice = fill(en.trip.reopenedNotice, { orga: "Lena Berg" });
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
