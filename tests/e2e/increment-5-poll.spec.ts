import { expect, test, type Browser, type Page } from "@playwright/test";
import en from "../../messages/en.json" with { type: "json" };
import { expectNoSeriousAxeViolations, waitForAnimations } from "./helpers/axe";
import { signUp } from "./helpers/auth";
import {
  addAccountToTrip,
  addMemberWithDays,
  addVoter,
  isoDay,
  makeOrganizer,
  memberVoteStatus,
  pollState,
  seedPoll,
  seedTrip,
  setAvailability,
  setTripRange,
  tripRange,
  tripRow,
  votesOf,
} from "./helpers/db";
import { uniqueEmail } from "./helpers/mailpit";
import { newPerson } from "./helpers/trips";

// Increment 5: F-010 create a vote, F-011 vote (Q13 a: results only after the own vote, the
// organiser sees all), F-012 lock in dates + celebration «It's on!» (Q17 b, once per person
// and fixing), F-017 deadline. Accounts: en-GB. Tests use `expect.poll` and only visible
// elements, so they also hold on short viewports (WebKit iPhone 15, 393 × 659).

test.use({ locale: "en-GB" });

const p = en.poll;
const S = 30; // seeded search range: isoDay(30) … isoDay(90)
const day = (offset: number) => isoDay(S + offset);
const range = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => day(from + i));
const fill = (text: string, values: Record<string, string | number>) =>
  Object.entries(values).reduce(
    (out, [key, value]) => out.replace(`{${key}}`, String(value)),
    text,
  );
/** Interactions need the hydrated client component (dev server compiles lazily). */
const hydrated = (page: Page) => page.waitForLoadState("networkidle");
const cards = (page: Page) => page.locator("li[data-option-card]");
const segment = (page: Page, index: number, name: string) =>
  cards(page).nth(index).getByRole("radio", { name, exact: true });

/** Member Kemal (signed in) in a running vote with three options; Zora and Uli voted. */
async function votingTrip(page: Page, role: "member" | "organizer" = "member") {
  const trip = await seedTrip(`Vote ${String(Date.now())}`);
  const email = await signUp(page, "Kemal", uniqueEmail("kemal"));
  await addAccountToTrip(trip.tripId, email, "Kemal");
  if (role === "organizer") await makeOrganizer(trip.tripId, email);
  // Own day «can't» inside option 2 → pre-filled «No?» (F-011).
  await setAvailability(trip.tripId, email, { [day(41)]: "no" });
  const optionIds = await seedPoll(trip.tripId, [
    [day(10), day(15)],
    [day(40), day(45)],
    [day(50), day(55)],
  ]);
  await addVoter(trip.tripId, "Zora", optionIds, ["yes", "no", "maybe"]);
  await addVoter(trip.tripId, "Uli", optionIds, ["maybe", null, null]);
  return { ...trip, email, optionIds };
}

test.describe("F-010 create a vote", () => {
  test("organiser: pre-selection, own period, remove, deadline, start → share sheet, phase 2", async ({
    page,
  }) => {
    const trip = await seedTrip(`Create ${String(Date.now())}`);
    const email = await signUp(page, "Kemal", uniqueEmail("kemal"));
    await addAccountToTrip(trip.tripId, email, "Kemal");
    await makeOrganizer(trip.tripId, email);
    await addMemberWithDays(trip.tripId, "Jonas", { no: range(0, 9) });
    await addMemberWithDays(trip.tripId, "Tim", { no: range(20, 60), maybe: [day(12)] });

    await page.goto(`/trips/${trip.publicId}/poll`);
    await expect(page.getByRole("heading", { name: p.emptyOrgaTitle })).toBeVisible();
    await page.getByRole("link", { name: p.emptyOrgaAction }).click();
    await expect(page).toHaveURL(new RegExp(`/trips/${trip.publicId}/poll/new$`));
    await hydrated(page);

    // Top suggestions in the wished length (5 nights): «Everyone's in» and «without Jonas».
    const options = page.locator("li[data-option]");
    await expect(options).toHaveCount(2);
    await expect(options.nth(0)).toContainText(fill(en.group.card.can, { count: 2 }));
    await expect(options.nth(0)).toContainText("1× if needed");
    await expect(options.nth(1)).toContainText(fill(p.create.warnCannot, { names: "Jonas" }));

    // Own period via the sheet (native date fields).
    await page.getByRole("button", { name: p.create.custom }).click();
    const sheet = page.getByRole("dialog");
    await sheet.getByLabel(p.period.start).fill(day(40));
    await sheet.getByLabel(p.period.end).fill(day(45));
    await sheet.getByRole("button", { name: p.period.add }).click();
    await expect(options).toHaveCount(3);

    await page.getByRole("button", { name: fill(p.create.removeLabel, { n: 2 }) }).click();
    await expect(options).toHaveCount(2);
    await page.getByRole("button", { name: p.create.deadlineIn3 }).click();

    await page.getByRole("button", { name: p.create.submit }).click();
    await expect(page).toHaveURL(new RegExp(`/trips/${trip.publicId}/poll`));
    const share = page.getByRole("dialog", { name: p.shareTitle });
    await expect(share).toBeVisible();
    await expect(share.getByRole("textbox", { name: en.share.messageLabel })).toHaveValue(
      /^Voting for .* is open! 2 options to choose from – vote by .*: http/,
    );
    await expect
      .poll(async () => pollState(trip.publicId))
      .toMatchObject({ phase: "voting", options: 2, poll_deadline: isoDay(3) });
    await share.getByRole("button", { name: en.common.close }).click();
    await expect(page.getByRole("heading", { name: p.open, level: 1 })).toBeVisible();
    await expect(page.getByText(/^Voting open ·/)).toBeVisible();
  });

  test("fewer than 2 options cannot be started – the reason stands next to the button", async ({
    page,
  }) => {
    const trip = await seedTrip(`Few ${String(Date.now())}`);
    const email = await signUp(page, "Kemal", uniqueEmail("kemal"));
    await addAccountToTrip(trip.tripId, email, "Kemal");
    await makeOrganizer(trip.tripId, email);
    await page.goto(`/trips/${trip.publicId}/poll/new`);
    await hydrated(page);
    await expect(page.getByText(p.create.noSuggestions)).toBeVisible();
    const submit = page.getByRole("button", { name: p.create.submit });
    await expect(submit).toHaveAttribute("aria-disabled", "true");
    await expect(page.getByText(p.create.minOptions)).toBeVisible();
    // Playwright treats aria-disabled as disabled – dispatch the click like a screen reader would.
    await submit.dispatchEvent("click");
    await page.waitForTimeout(500);
    expect((await pollState(trip.publicId))?.phase).toBe("collecting");
  });

  test("members cannot open «Create a vote» – they land on the vote tab", async ({ page }) => {
    const trip = await seedTrip(`Member ${String(Date.now())}`);
    const email = await signUp(page, "Kemal", uniqueEmail("kemal"));
    await addAccountToTrip(trip.tripId, email, "Kemal");
    await page.goto(`/trips/${trip.publicId}/poll/new`);
    await expect(page).toHaveURL(new RegExp(`/trips/${trip.publicId}/poll$`));
    await expect(page.getByRole("heading", { name: p.emptyMemberTitle })).toBeVisible();
  });
});

test.describe("F-011 vote", () => {
  test("Q13 a: no result before the own vote – not even in the HTML/RSC payload", async ({
    page,
  }) => {
    const { publicId } = await votingTrip(page);
    await page.goto(`/trips/${publicId}/poll`);
    await expect(cards(page)).toHaveCount(3);
    await expect(page.getByText(p.voteToSee)).toHaveCount(3);
    // The flight data of the client props carries no tallies or answer names.
    const html = await page.content();
    expect(html).not.toContain("tally");
    expect(html).not.toMatch(/names\\?":\{/);
  });

  test("vote, pre-fill, accept all, change – results per option, status line, no re-sorting", async ({
    page,
  }) => {
    const { publicId, email } = await votingTrip(page);
    await page.goto(`/trips/${publicId}/poll`);
    await hydrated(page);
    const titles = await cards(page).locator("h2").allTextContents();

    // Unconfirmed suggestion: dashed «No?», accessible name without «?».
    await expect(segment(page, 1, p.segment.no)).toHaveAttribute("data-ghost", "true");
    await expect(segment(page, 1, p.segment.no)).toHaveAttribute("aria-checked", "false");
    await expect(page.getByText("3 options left.")).toBeVisible();

    await segment(page, 0, p.segment.yes).click();
    await expect(segment(page, 0, p.segment.yes)).toHaveAttribute("aria-checked", "true");
    // The server releases the result of THIS option only.
    await expect(cards(page).nth(0).locator("[data-result]")).toHaveAttribute(
      "data-result",
      "shown",
    );
    await expect(cards(page).nth(0)).toContainText(fill(p.resultSr, { yes: 2, maybe: 1, no: 0 }));
    await expect(cards(page).nth(1).locator("[data-result]")).toHaveAttribute(
      "data-result",
      "hidden",
    );
    await expect
      .poll(async () => votesOf(publicId, email))
      .toEqual({
        [`${day(10)}/${day(15)}`]: "yes",
      });

    await page.getByRole("button", { name: p.prefillAll }).click();
    await expect(segment(page, 1, p.segment.no)).toHaveAttribute("aria-checked", "true");
    await expect(cards(page).nth(1)).toContainText(fill(p.without, { names: "Kemal, Zora" }));
    await expect(page.getByRole("button", { name: p.prefillAll })).toHaveCount(0);

    await segment(page, 2, p.segment.maybe).click();
    await expect(page.getByText(p.statusDone)).toBeVisible();
    await expect.poll(async () => (await memberVoteStatus(publicId, email))?.voted).toBe(true);
    // W10-08: the cards keep their order while the page is open.
    expect(await cards(page).locator("h2").allTextContents()).toEqual(titles);

    // Answers can be changed until the end.
    await segment(page, 0, p.segment.no).click();
    await expect
      .poll(async () => (await votesOf(publicId, email))[`${day(10)}/${day(15)}`])
      .toBe("no");
  });

  test("keyboard: arrows move within the answers and choose (radio group)", async ({ page }) => {
    const { publicId, email } = await votingTrip(page);
    await page.goto(`/trips/${publicId}/poll`);
    await hydrated(page);
    await segment(page, 0, p.segment.yes).focus();
    await page.keyboard.press("ArrowRight");
    await expect(segment(page, 0, p.segment.maybe)).toBeFocused();
    await expect(segment(page, 0, p.segment.maybe)).toHaveAttribute("aria-checked", "true");
    await expect
      .poll(async () => (await votesOf(publicId, email))[`${day(10)}/${day(15)}`])
      .toBe("maybe");
  });

  test("the organiser sees every result and «Top choice» without voting", async ({ page }) => {
    const { publicId } = await votingTrip(page, "organizer");
    await page.goto(`/trips/${publicId}/poll`);
    await expect(page.getByText(p.voteToSee)).toHaveCount(0);
    await expect(cards(page).nth(0)).toContainText(fill(p.resultSr, { yes: 1, maybe: 1, no: 0 }));
    await expect(cards(page).nth(0).getByText(p.topChoice)).toBeVisible();
    // «Who has voted?»: status only.
    await page.getByRole("button", { name: /have voted/ }).click();
    const sheet = page.getByRole("dialog", { name: p.votersTitle });
    await expect(sheet.getByText(fill(p.votersDone, { count: 1 }))).toBeVisible();
    await expect(sheet.getByText("Zora")).toBeVisible();
  });

  test("security: a replayed vote of another account is refused (no IDOR)", async ({
    page,
    browser,
  }) => {
    const { publicId, email } = await votingTrip(page);
    await page.goto(`/trips/${publicId}/poll`);
    await hydrated(page);
    const request = page.waitForRequest(
      (r) => r.method() === "POST" && r.headers()["next-action"] !== undefined,
    );
    await segment(page, 0, p.segment.yes).click();
    const captured = await request;
    await expect.poll(async () => Object.keys(await votesOf(publicId, email)).length).toBe(1);

    const mallory = await newPerson(browser, "Mallory");
    const headers = await captured.allHeaders();
    const replay = await mallory.context.request.post(captured.url(), {
      headers: {
        "next-action": headers["next-action"] ?? "",
        "content-type": headers["content-type"] ?? "text/plain;charset=UTF-8",
        accept: "text/x-component",
      },
      data: captured.postData() ?? "",
    });
    expect(replay.status()).toBeLessThan(500);
    expect(await replay.text()).toContain("notAllowed");
    expect(await votesOf(publicId, mallory.email)).toEqual({});
    for (const path of ["poll", "poll/new", "event.ics"]) {
      const response = await mallory.page.goto(`/trips/${publicId}/${path}`);
      expect(response?.status(), path).toBe(404);
    }
    await mallory.context.close();
  });
});

test.describe("F-012 lock in dates", () => {
  test("organiser: place 1 pre-selected → phase 3, focus on «It's on!», calendar file", async ({
    page,
  }) => {
    const trip = await seedTrip(`Fix ${String(Date.now())}`);
    const email = await signUp(page, "Kemal", uniqueEmail("kemal"));
    await addAccountToTrip(trip.tripId, email, "Kemal");
    await makeOrganizer(trip.tripId, email);
    const ids = await seedPoll(trip.tripId, [
      [day(10), day(15)],
      [day(40), day(45)],
    ]);
    await addVoter(trip.tripId, "Zora", ids, ["maybe", "yes"]);
    await addVoter(trip.tripId, "Uli", ids, ["no", "yes"]);

    await page.goto(`/trips/${trip.publicId}/poll`);
    await hydrated(page);
    await page.getByRole("button", { name: p.fixButton }).click();
    const sheet = page.getByRole("dialog", { name: p.fix.title });
    await expect(sheet.getByText(fill(p.fix.missing, { names: "Lena Berg, Kemal" }))).toBeVisible();
    const radios = sheet.getByRole("radio");
    await expect(radios.nth(0)).toBeChecked();
    await sheet.getByRole("button", { name: p.fix.confirm }).click();

    await expect(page).toHaveURL(new RegExp(`/trips/${trip.publicId}$`));
    const heading = page.getByRole("heading", { name: p.result.title, level: 1 });
    await expect(heading).toBeFocused();
    await expect
      .poll(async () => pollState(trip.publicId))
      .toMatchObject({ phase: "fixed", fixed_start: day(40), fixed_end: day(45) });
    await expect
      .poll(async () => (await memberVoteStatus(trip.publicId, email))?.celebrated_for)
      .toBe(`${day(40)}/${day(45)}`);

    const ics = await page.request.get(`/trips/${trip.publicId}/event.ics`);
    expect(ics.status()).toBe(200);
    expect(ics.headers()["content-type"]).toContain("text/calendar");
    const body = await ics.text();
    expect(body).toContain(`DTSTART;VALUE=DATE:${day(40).replaceAll("-", "")}`);
    expect(body).toContain(`DTEND;VALUE=DATE:${day(46).replaceAll("-", "")}`);

    // «Undo locked dates» (W11-07): back to voting, votes kept.
    await page.getByRole("button", { name: en.trip.menu }).click();
    await page.getByRole("button", { name: en.trip.menuItems.unfix }).click();
    await page.getByRole("button", { name: en.trip.dialogs.unfixConfirm }).click();
    await expect(page).toHaveURL(new RegExp(`/trips/${trip.publicId}/poll$`));
    await expect.poll(async () => (await pollState(trip.publicId))?.phase).toBe("voting");
    await expect(page.getByText(fill(p.resultSr, { yes: 2, maybe: 0, no: 0 }))).toBeAttached();
  });

  test("tie on place 1: no pre-selection, the organiser decides", async ({ page }) => {
    const trip = await seedTrip(`Tie ${String(Date.now())}`);
    const email = await signUp(page, "Kemal", uniqueEmail("kemal"));
    await addAccountToTrip(trip.tripId, email, "Kemal");
    await makeOrganizer(trip.tripId, email);
    const ids = await seedPoll(trip.tripId, [
      [day(10), day(15)],
      [day(40), day(45)],
    ]);
    await addVoter(trip.tripId, "Zora", ids, ["yes", "yes"]);
    await page.goto(`/trips/${trip.publicId}/poll`);
    await hydrated(page);
    await page.getByRole("button", { name: p.fixButton }).click();
    const sheet = page.getByRole("dialog", { name: p.fix.title });
    await expect(sheet.getByText(p.fix.tie)).toBeVisible();
    await expect(sheet.getByRole("radio", { checked: true })).toHaveCount(0);
    await expect(sheet.getByRole("button", { name: p.fix.confirm })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    await sheet.getByRole("radio").nth(1).check();
    await sheet.getByRole("button", { name: p.fix.confirm }).click();
    await expect.poll(async () => (await pollState(trip.publicId))?.phase).toBe("fixed");
  });
});

test.describe("«It's on!» celebration (Q17 b)", () => {
  async function fixedTrip(page: Page) {
    const trip = await seedTrip(`Party ${String(Date.now())}`);
    const email = await signUp(page, "Kemal", uniqueEmail("kemal"));
    await addAccountToTrip(trip.tripId, email, "Kemal");
    await seedPoll(trip.tripId, [[day(10), day(15)]], { fixed: true });
    return { ...trip, email };
  }

  test("members: banner on other tabs, celebration once on the overview, then static", async ({
    page,
  }) => {
    const { publicId, email } = await fixedTrip(page);
    await page.goto(`/trips/${publicId}/days`);
    await expect(page.getByText(p.result.bannerFixed)).toBeVisible();
    await page.getByRole("link", { name: p.result.bannerAction, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/trips/${publicId}$`));
    await expect(page.getByRole("heading", { name: p.result.title })).toBeVisible();
    await expect
      .poll(async () => (await memberVoteStatus(publicId, email))?.celebrated_for)
      .toBe(`${day(10)}/${day(15)}`);
    // Countdown as text (never counting up) and calendar actions are there at once.
    await expect(page.locator("[data-countdown-text]")).toHaveText(`${String(S + 10)} days to go`);
    await expect(page.getByRole("button", { name: p.result.addToCalendar })).toBeVisible();

    // Second visit (another device would be the same – stored per membership): static.
    await page.reload();
    await expect(page.locator("[data-countdown-ring]")).not.toHaveAttribute("data-celebrate", /.*/);
    await page.goto(`/trips/${publicId}/days`);
    await expect(page.getByText(p.result.bannerFixed)).toHaveCount(0);
  });

  test("a new device sees no celebration once it was seen (server-side marker)", async ({
    page,
  }) => {
    const { publicId, email } = await fixedTrip(page);
    await page.goto(`/trips/${publicId}`);
    await expect
      .poll(async () => (await memberVoteStatus(publicId, email))?.celebrated_for)
      .not.toBeNull();
    const html = await (await page.request.get(`/trips/${publicId}`)).text();
    expect(html).not.toContain('data-celebrate="pending"');
  });

  test.describe("reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("no confetti, nothing moves – only a short cross-fade; still counted as seen", async ({
      page,
    }) => {
      const { publicId, email } = await fixedTrip(page);
      await page.addInitScript(() => {
        const seen: string[] = [];
        (window as unknown as { __frames: string[] }).__frames = seen;
        // eslint-disable-next-line @typescript-eslint/unbound-method -- re-invoked with the element as `this`
        const original = Element.prototype.animate;
        Element.prototype.animate = function (keyframes, options) {
          seen.push(JSON.stringify(keyframes));
          return original.call(this, keyframes, options);
        };
      });
      await page.goto(`/trips/${publicId}`);
      await expect
        .poll(async () => (await memberVoteStatus(publicId, email))?.celebrated_for)
        .toBe(`${day(10)}/${day(15)}`);
      await page.waitForTimeout(1200);
      await expect(page.locator("[data-burst]")).toHaveCount(0);
      const frames = await page.evaluate(
        () => (window as unknown as { __frames: string[] }).__frames,
      );
      expect(frames.filter((f) => /transform|strokeDash/.test(f))).toEqual([]);
    });
  });

  test("full motion: ring lap and confetti puff from the sun dot, all over within 2.6 s", async ({
    page,
  }) => {
    const { publicId } = await fixedTrip(page);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto(`/trips/${publicId}`);
    await expect.poll(async () => page.locator("[data-burst]").count(), { timeout: 8000 }).toBe(1);
    await page.waitForTimeout(2800);
    await expect(page.locator("[data-burst]")).toHaveCount(0);
    const running = await page.evaluate(
      () => document.getAnimations().filter((a) => a.playState === "running").length,
    );
    expect(running).toBe(0);
  });
});

test.describe("R-055 search range changed during the vote", () => {
  /** Running trip (started 20 days ago) in phase 2; Kemal = organiser, Mia = member without vote. */
  async function runningVote(page: Page, browser: Browser) {
    const trip = await seedTrip(`Range ${String(Date.now())}`, {
      rangeStart: isoDay(-20),
      rangeEnd: isoDay(90),
    });
    const email = await signUp(page, "Kemal", uniqueEmail("kemal"));
    await addAccountToTrip(trip.tripId, email, "Kemal");
    await makeOrganizer(trip.tripId, email);
    const optionIds = await seedPoll(trip.tripId, [
      [isoDay(10), isoDay(15)],
      [isoDay(38), isoDay(43)],
      [isoDay(50), isoDay(55)],
    ]);
    await addVoter(trip.tripId, "Zora", optionIds, ["yes", "no", "maybe"]);
    const mia = await newPerson(browser, "Mia");
    await addAccountToTrip(trip.tripId, mia.email, "Mia");
    return { ...trip, mia };
  }

  const endField = (page: Page) => page.getByLabel(en.tripForm.endLabel, { exact: true });
  /** The error at the field «To» (the summary above repeats it as a link). */
  const endError = (page: Page) => page.locator('[id$="-rangeEnd-error"]');
  const iso = /\d{4}-\d{2}-\d{2}/;

  test("the end cannot move into the past (client and server), the vote stays open", async ({
    page,
    browser,
  }) => {
    const { publicId, mia } = await runningVote(page, browser);
    await page.goto(`/trips/${publicId}/settings`);
    await hydrated(page);
    await endField(page).fill(isoDay(-2));
    await page.getByRole("button", { name: en.tripForm.save }).click();
    await expect(endError(page)).toHaveText(en.tripForm.errors.endInPast);
    await expect(endField(page)).toBeFocused();
    expect((await tripRange(publicId))?.range_end).toBe(isoDay(90));

    // Server (form post without JavaScript, client validation skipped): the whole save is
    // refused – a control post without the past end goes through.
    const noJs = await browser.newContext({
      javaScriptEnabled: false,
      locale: "en-GB",
      storageState: await page.context().storageState(),
    });
    const plain = await noJs.newPage();
    const postSettings = async (patch: { name: string; end?: string }) => {
      await plain.goto(`/trips/${publicId}/settings`);
      await plain.getByLabel(en.tripForm.nameLabel).fill(patch.name);
      if (patch.end) await endField(plain).fill(patch.end);
      const posted = plain.waitForResponse((r) => r.request().method() === "POST");
      await plain.getByRole("button", { name: en.tripForm.save }).click();
      await posted;
    };
    await postSettings({ name: "Past end", end: isoDay(-2) });
    expect(await tripRange(publicId)).toEqual({ range_start: isoDay(-20), range_end: isoDay(90) });
    expect((await tripRow(publicId))?.name).not.toBe("Past end");
    await postSettings({ name: "Control" });
    await expect.poll(async () => (await tripRow(publicId))?.name).toBe("Control");
    await noJs.close();

    // Today is still allowed – the vote keeps running (phase 2, no «Past»).
    await endField(page).fill(isoDay(40));
    await page.getByRole("button", { name: en.tripForm.save }).click();
    await expect(page.getByRole("status").filter({ hasText: en.tripForm.saved })).toBeVisible();
    expect((await tripRange(publicId))?.range_end).toBe(isoDay(40));
    expect((await pollState(publicId))?.phase).toBe("voting");

    // Options outside the new range: real dates + info hint; still no results for Mia.
    await mia.page.goto(`/trips/${publicId}/poll`);
    await expect(cards(mia.page)).toHaveCount(3);
    for (const title of await cards(mia.page).locator("h2").allTextContents()) {
      expect(title).not.toMatch(iso);
    }
    await expect(cards(mia.page).nth(0).getByText(p.outsideRange)).toHaveCount(0);
    await expect(cards(mia.page).nth(1).getByText(p.outsideRange)).toBeVisible();
    await expect(cards(mia.page).nth(2).getByText(p.outsideRange)).toBeVisible();
    await expect(mia.page.getByText(p.voteToSee)).toHaveCount(3);
    expect(await mia.page.content()).not.toContain("tally");
    await mia.context.close();
  });

  test("a vote that ran out of time never unlocks the results for members", async ({
    page,
    browser,
  }) => {
    const { publicId, tripId, mia } = await runningVote(page, browser);
    // Time passes: the search range is over, the dates were never fixed (derived «Past»).
    await setTripRange(tripId, isoDay(-20), isoDay(-1));
    await mia.page.goto(`/trips/${publicId}/poll`);
    await expect(cards(mia.page)).toHaveCount(3);
    await expect(mia.page.getByText(p.voteToSee)).toHaveCount(3);
    const html = await mia.page.content();
    expect(html).not.toContain("tally");
    expect(html).not.toMatch(/names\\?":\{/);
    // Editing other fields of such a trip still works (an unchanged past end is kept).
    await page.goto(`/trips/${publicId}/settings`);
    await hydrated(page);
    await page.getByLabel(en.tripForm.nameLabel).fill("Renamed");
    await page.getByRole("button", { name: en.tripForm.save }).click();
    await expect(page.getByRole("status").filter({ hasText: en.tripForm.saved })).toBeVisible();
    await mia.context.close();
  });
});

test.describe("accessibility", () => {
  for (const scheme of ["light", "dark"] as const) {
    test(`axe ${scheme}: vote, create, result`, async ({ page }) => {
      test.setTimeout(60_000);
      await page.emulateMedia({ colorScheme: scheme });
      const { publicId, email } = await votingTrip(page, "organizer");
      await page.goto(`/trips/${publicId}/poll`);
      await hydrated(page);
      await expectNoSeriousAxeViolations(page, `poll ${scheme}`);
      await page.getByRole("button", { name: p.fixButton }).click();
      await expect(page.getByRole("dialog", { name: p.fix.title })).toBeVisible();
      await expectNoSeriousAxeViolations(page, `fix sheet ${scheme}`);
      await page
        .getByRole("dialog", { name: p.fix.title })
        .getByRole("button", { name: p.fix.confirm })
        .click();
      await expect(page.getByRole("heading", { name: p.result.title })).toBeVisible();
      await waitForAnimations(page);
      await expectNoSeriousAxeViolations(page, `result ${scheme}`);

      const other = await seedTrip(`Axe ${String(Date.now())}`);
      await addAccountToTrip(other.tripId, email, "Kemal");
      await makeOrganizer(other.tripId, email);
      await addMemberWithDays(other.tripId, "Jonas", { no: range(0, 9) });
      await page.goto(`/trips/${other.publicId}/poll/new`);
      await hydrated(page);
      await expectNoSeriousAxeViolations(page, `create ${scheme}`);
    });
  }
});
