import { expect, test, type Page } from "@playwright/test";
import en from "../../messages/en.json" with { type: "json" };
import { expectNoSeriousAxeViolations } from "./helpers/axe";
import { signUp } from "./helpers/auth";
import {
  addAccountToTrip,
  addPlaceholder,
  addStays,
  addVoter,
  isoDay,
  makeOrganizer,
  ratingsOf,
  rateStays,
  seedPoll,
  seedTrip,
  setFixedDates,
  setLastFixedRange,
  stayRows,
  stayTripState,
} from "./helpers/db";
import { uniqueEmail } from "./helpers/mailpit";

// Increment 9 (F-031 «Unterkünfte», features.md R.7, W17 F, W18 E): area, suggesting without
// a network (placeholder card), ranking lock (Q33 – no foreign data in HTML/RSC), picking,
// «gebucht», «ohne App erledigt», new dates, rights. Accounts: en-GB. Only visible elements and
// `expect.poll` – holds on 393 × 659 (WebKit in CI).

test.use({ locale: "en-GB" });

const s = en.stays;
const f = en.stayForm;
const fill = (text: string, values: Record<string, string | number>) =>
  Object.entries(values).reduce(
    (out, [key, value]) => out.replaceAll(`{${key}}`, String(value)),
    text,
  );
/** ICU plural texts of the catalogue for a count («# places are …»). */
const plural = (text: string, count: number) =>
  text.replace(
    /\{(\w+), plural, one \{([^}]*)\} other \{([^}]*)\}\}/g,
    (_m, _k, one: string, other: string) =>
      (count === 1 ? one : other).replaceAll("#", String(count)),
  );
const hydrated = (page: Page) => page.waitForLoadState("networkidle");

/** Kai (signed in) in Lena Berg's fixed trip with «Member 1»; optionally Kai organises. */
async function stayTrip(page: Page, options: { role?: "member" | "organizer" } = {}) {
  const name = `Stays ${String(Date.now())}`;
  const trip = await seedTrip(name, { extraMembers: 1 });
  const email = await signUp(page, "Kai", uniqueEmail("kai"));
  await addAccountToTrip(trip.tripId, email, "Kai");
  if (options.role === "organizer") await makeOrganizer(trip.tripId, email);
  await setFixedDates(trip.tripId, 41, 48);
  return { ...trip, email, name };
}

test.describe("W18 – area and suggesting", () => {
  test("empty area → suggest without a preview (placeholder card) → in the own stack", async ({
    page,
  }) => {
    const trip = await stayTrip(page);
    await addPlaceholder(trip.tripId, "Mia");
    await page.goto(`/trips/${trip.publicId}/stays`);
    await hydrated(page);
    await expect(page).toHaveTitle(new RegExp(fill(s.pageTitle, { trip: trip.name })));
    await expect(page.getByRole("heading", { level: 2, name: s.empty.title })).toBeVisible();
    await expectNoSeriousAxeViolations(page, "stays empty");

    await page.locator("main").getByRole("link", { name: s.empty.action }).click();
    await expect(page).toHaveURL(/\/stays\/new$/);
    await hydrated(page);
    // Link without a scheme → https:// is added silently; *.example never resolves → «no preview».
    const link = page.getByLabel(f.link);
    await link.fill("ferienhaus.example/haus-am-meer");
    await link.blur();
    await expect(link).toHaveValue("https://ferienhaus.example/haus-am-meer");
    await expect(
      page.getByText(fill(f.preview.none, { domain: "ferienhaus.example" })),
    ).toBeVisible({ timeout: 10_000 });
    // No focus jump into the title field (W17 F.1).
    await expect(page.getByLabel(f.name)).not.toBeFocused();

    await page.getByLabel(f.name).fill("Haus am Meer");
    await page.getByLabel(f.price).fill("1,840");
    // 4 travellers (Lena Berg, Member 1, Kai + placeholder Mia): 1840 / 4 = 460.
    await expect(page.getByText(/≈ €460 per person \(4 travellers incl\. Mia\)/)).toBeVisible();
    await expectNoSeriousAxeViolations(page, "stay form");
    await page.getByRole("button", { name: f.submit }).click();

    await expect(page).toHaveURL(new RegExp(`/trips/${trip.publicId}/stays`));
    await expect(page.getByText(f.added)).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 2, name: plural(s.prompt.title, 1) }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: fill(s.prompt.cta, { count: 1 }) })).toBeVisible();
    await expect
      .poll(async () => (await stayRows(trip.tripId)).map((r) => r.title))
      .toEqual(["Haus am Meer"]);
  });

  test("validation: http link, duplicate link (own) blocks adding", async ({ page }) => {
    const trip = await stayTrip(page);
    await addStays(trip.tripId, [
      { title: "Villa", url: "https://booking.example/hotel/villa", by: { email: trip.email } },
    ]);
    await page.goto(`/trips/${trip.publicId}/stays/new`);
    await hydrated(page);
    const link = page.getByLabel(f.link);
    await link.fill("http://booking.example/hotel/villa");
    await link.blur();
    await expect(page.getByText(f.error.linkInvalid)).toBeVisible();
    // Same place with tracking parameters → recognised as duplicate.
    await link.fill("https://www.booking.example/hotel/villa?utm_source=x&aid=1");
    await link.blur();
    await expect(page.getByText(f.duplicateOwn)).toBeVisible({ timeout: 10_000 });
    await page.getByLabel(f.name).fill("Villa again");
    await expect(page.getByRole("button", { name: f.submit })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });
});

test.describe("Q33 – ranking visibility (server-side)", () => {
  async function ratedTrip(page: Page, role: "member" | "organizer") {
    const trip = await stayTrip(page, { role });
    const ids = await addStays(trip.tripId, [
      { title: "Villa Mare", by: { name: "Member 1" }, priceEuro: 900 },
      { title: "Casa Azul", by: { name: "Member 1" } },
      { title: "Haus Galeb", by: null, note: "Terrasse" },
    ]);
    const [villa = "", casa = "", galeb = ""] = ids;
    await rateStays(
      trip.tripId,
      { name: "Lena Berg" },
      { [villa]: "like", [casa]: "nope", [galeb]: "like" },
    );
    await rateStays(
      trip.tripId,
      { name: "Member 1" },
      {
        [villa]: "like",
        [casa]: "like",
        [galeb]: "nope",
      },
    );
    return { ...trip, ids };
  }

  test("member with open suggestions: lock, no numbers or names in HTML/RSC", async ({ page }) => {
    const trip = await ratedTrip(page, "member");
    await rateStays(trip.tripId, { email: trip.email }, { [trip.ids[0] ?? ""]: "like" });
    await page.goto(`/trips/${trip.publicId}/stays`);
    await hydrated(page);
    await expect(page.getByText(s.locked.title)).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 2, name: fill(s.all.title, { count: 3 }) }),
    ).toBeVisible();
    await expect(page.getByText(new RegExp(`by ${s.row.formerMember}`))).toBeVisible();
    // The own rating is pressed, the others are «not rated».
    const villa = page.getByRole("group", { name: fill(s.rate.group, { title: "Villa Mare" }) });
    await expect(villa.getByRole("button", { name: s.rate.like })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    // Network/RSC: nothing about other people's ratings (R.7 I9-06) – no counts, no names of
    // likers (the message catalogue itself contains the KEY «likedBy», so look for data).
    const data = /\\?"(likes|nopes)\\?":\d|\\?"likedBy\\?":\{|♥ (from )?Lena Berg/;
    const html = await (await page.request.get(`/trips/${trip.publicId}/stays`)).text();
    expect(html).not.toMatch(data);
    const rsc = await (
      await page.request.get(`/trips/${trip.publicId}/stays`, { headers: { RSC: "1" } })
    ).text();
    expect(rsc).not.toMatch(data);
    // The cockpit shows no favourite to a locked member either.
    const cockpit = await (await page.request.get(`/trips/${trip.publicId}`)).text();
    expect(cockpit).not.toMatch(/Villa Mare \(\d ♥\)/);
    // … nor who has rated how much (remind lists only once the ranking is free, Q33).
    expect(cockpit).not.toMatch(/\\?"left\\?":\d/);
    await expectNoSeriousAxeViolations(page, "stays locked");
  });

  test("member rates everything → ranking free: ♥ with names, ✕ as numbers; take back locks again", async ({
    page,
  }) => {
    const trip = await ratedTrip(page, "member");
    await page.goto(`/trips/${trip.publicId}/stays`);
    await hydrated(page);
    for (const [title, button] of [
      ["Villa Mare", s.rate.like],
      ["Casa Azul", s.rate.nope],
      ["Haus Galeb", s.rate.like],
    ] as const) {
      const group = page.getByRole("group", { name: fill(s.rate.group, { title }) });
      await group.getByRole("button", { name: button }).click();
      await expect(group.getByRole("button", { name: button })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
    }
    await expect
      .poll(async () => Object.keys(await ratingsOf(trip.tripId, trip.email)))
      .toHaveLength(3);
    // Unlock only on the next load (W18 E.6.1).
    await page.reload();
    await hydrated(page);
    await expect(page.getByText(s.locked.title)).toHaveCount(0);
    const ranking = page.getByRole("list").filter({ hasText: "Villa Mare" }).first();
    const first = ranking.getByRole("listitem").first();
    await expect(first.getByRole("heading", { level: 3 })).toContainText("Villa Mare");
    await expect(first.getByText(s.ranking.first)).toBeVisible();
    await expect(first.getByText("♥ 3")).toBeVisible();
    await expect(first.getByText("✕ 0")).toBeVisible();
    await expect(first.getByText(/♥ from Lena Berg, Member 1,? and you/)).toBeVisible();
    // ✕ never with names.
    await expect(page.getByText(/✕ from/)).toHaveCount(0);

    // Taking a rating back locks the ranking again (snackbar, unlock state on next load).
    const casa = page.getByRole("group", { name: fill(s.rate.group, { title: "Casa Azul" }) });
    await casa.getByRole("button", { name: s.rate.nope }).click();
    await expect(page.getByText(s.rate.clearedLocked)).toBeVisible();
    await page.reload();
    await expect(page.getByText(s.locked.title)).toBeVisible();
  });

  test("organiser always sees the ranking (also with own open suggestions)", async ({ page }) => {
    const trip = await ratedTrip(page, "organizer");
    await page.goto(`/trips/${trip.publicId}/stays`);
    await hydrated(page);
    await expect(page.getByText(s.locked.title)).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 2, name: s.ranking.title })).toBeVisible();
    // Positive control of the payload check above: the organiser's page carries the counts.
    const html = await (await page.request.get(`/trips/${trip.publicId}/stays`)).text();
    expect(html).toMatch(/\\?"likes\\?":\d/);
    // «Based on 2 of 3 – still waiting for you.» → the organiser is open herself.
    await expect(page.getByText(/Based on 2 of 3 – still waiting for you\./)).toBeVisible();
    await expect(page.getByRole("link", { name: fill(s.prompt.cta, { count: 3 }) })).toBeVisible();
  });
});

test.describe("W18 E.7 – picking, booked, unpicking, UX-9", () => {
  test("organiser picks with confirmation, marks as booked (+ undo), cockpit tile, unpicks", async ({
    page,
  }) => {
    const trip = await stayTrip(page, { role: "organizer" });
    const [villa = "", casa = ""] = await addStays(trip.tripId, [
      { title: "Villa Mare", priceEuro: 1200, by: { name: "Member 1" } },
      { title: "Casa Azul", by: { name: "Lena Berg" } },
    ]);
    await rateStays(trip.tripId, { email: trip.email }, { [villa]: "like", [casa]: "nope" });
    await page.goto(`/trips/${trip.publicId}/stays`);
    await hydrated(page);
    await page.getByRole("button", { name: fill(s.fixName, { title: "Villa Mare" }) }).click();
    const sheet = page.getByRole("dialog", {
      name: fill(s.fixSheet.title, { title: "Villa Mare" }),
    });
    await expect(sheet.getByText(plural(s.fixSheet.open, 2))).toBeVisible();
    await sheet.getByRole("button", { name: s.fix }).click();

    const chosen = page.getByRole("heading", { level: 2, name: s.chosen.title });
    await expect(chosen).toBeVisible();
    await expect(chosen).toBeFocused();
    await expect(page.getByText(fill(s.fixed.toast, { title: "Villa Mare" }))).toBeVisible();
    await expect(page.getByText(s.chosen.notBooked)).toBeVisible();
    // Swiping and suggesting are over; ratings become text.
    await expect(page.getByRole("link", { name: s.suggestName })).toHaveCount(0);
    await expect(page.getByText(fill(s.row.myRating, { rating: "♥" })).first()).toBeVisible();

    await page.getByRole("button", { name: s.chosen.markBooked }).click();
    const unbook = page.getByRole("button", { name: s.chosen.unbook });
    await expect(unbook).toBeFocused();
    await expect(page.getByText(s.chosen.bookedToast)).toBeVisible();
    await expect.poll(async () => (await stayRows(trip.tripId))[0]?.booked).toBe(true);
    await expectNoSeriousAxeViolations(page, "stays chosen booked");

    // Cockpit: V3 done → tile «Place to stay. Villa Mare · booked ✓».
    await page.goto(`/trips/${trip.publicId}`);
    await expect(
      page.getByRole("link", { name: "Place to stay. Villa Mare · booked ✓" }),
    ).toBeVisible();

    await page.goto(`/trips/${trip.publicId}/stays`);
    await hydrated(page);
    await page.getByRole("button", { name: s.unfix.action }).click();
    const unfix = page.getByRole("dialog", { name: s.unfix.title });
    await expect(unfix.getByText(s.unfix.booked)).toBeVisible();
    await unfix.getByRole("button", { name: s.unfix.confirm }).click();
    await expect(page.getByText(s.unfix.done)).toBeVisible();
    await expect.poll(async () => (await stayRows(trip.tripId)).some((r) => r.chosen)).toBe(false);
    // Ratings stay.
    expect(Object.keys(await ratingsOf(trip.tripId, trip.email))).toHaveLength(2);
  });

  test("member sees «Lena Berg is booking it», cannot pick/book; swipe shows «already picked»", async ({
    page,
  }) => {
    const trip = await stayTrip(page);
    await addStays(trip.tripId, [{ title: "Villa Mare", chosen: true }, { title: "Casa Azul" }]);
    await page.goto(`/trips/${trip.publicId}/stays`);
    await hydrated(page);
    await expect(page.getByText(fill(s.chosen.waitMember, { bookers: "Lena Berg" }))).toBeVisible();
    await expect(page.getByRole("button", { name: s.chosen.markBooked })).toHaveCount(0);
    await expect(page.getByRole("button", { name: s.unfix.action })).toHaveCount(0);
    await expect(page.getByRole("button", { name: s.fix })).toHaveCount(0);
    // Member sees the ranking after the pick (everybody, Q33).
    await expect(page.getByRole("heading", { level: 2, name: s.ranking.title })).toBeVisible();
    await page.goto(`/trips/${trip.publicId}/stays/swipe`);
    await expect(page.getByRole("heading", { name: s.swipe.fixedTitle })).toBeVisible();
    // Suggesting is closed: redirect with a snackbar.
    await page.goto(`/trips/${trip.publicId}/stays/new`);
    await expect(page).toHaveURL(new RegExp(`/trips/${trip.publicId}/stays$`));
  });

  test("UX-9: organiser ticks «already sorted» in the cockpit, member sees it, undo", async ({
    page,
  }) => {
    const trip = await stayTrip(page, { role: "organizer" });
    await page.goto(`/trips/${trip.publicId}`);
    await hydrated(page);
    // Rule 9: no suggestions → «Up next» with the text action.
    await expect(
      page.getByRole("link", { name: /Up next: Place to stay\. No suggestions yet/ }),
    ).toBeVisible();
    await page.getByRole("button", { name: en.route.v3.withoutApp }).click();
    const dialog = page.getByRole("dialog", { name: s.withoutApp.title });
    await dialog.getByRole("button", { name: s.withoutApp.confirm }).click();
    await expect(page.getByText(en.route.v3.withoutAppDone)).toBeVisible();
    await expect.poll(async () => (await stayTripState(trip.tripId))?.without_app).toBe(true);
    await expect(
      page.getByRole("link", { name: "Place to stay. Sorted outside the app" }),
    ).toBeVisible();
    await page.goto(`/trips/${trip.publicId}/stays`);
    await expect(page.getByText(fill(s.withoutApp.notice, { orga: "Kai" }))).toBeVisible();
    await page.getByRole("button", { name: s.withoutApp.undo }).click();
    await expect.poll(async () => (await stayTripState(trip.tripId))?.without_app).toBe(false);
  });
});

test.describe("W18 E.8 – new dates", () => {
  test("fixed anew with another range: «booked» reset, notice for all, organiser dismisses", async ({
    page,
  }) => {
    const name = `Redate ${String(Date.now())}`;
    const trip = await seedTrip(name);
    const email = await signUp(page, "Kai", uniqueEmail("kai"));
    await addAccountToTrip(trip.tripId, email, "Kai");
    await makeOrganizer(trip.tripId, email);
    const options = await seedPoll(trip.tripId, [
      [isoDay(40), isoDay(45)],
      [isoDay(50), isoDay(55)],
    ]);
    await addVoter(trip.tripId, "Zora", options, ["no", "yes"]);
    await addVoter(trip.tripId, "Uli", options, ["no", "yes"]);
    // The trip had been fixed on option 1 (booked a place), then unfixed.
    await setLastFixedRange(trip.tripId, isoDay(40), isoDay(45));
    await addStays(trip.tripId, [
      { title: "Villa Mare", chosen: true, booked: true, minutesAgo: 600 },
    ]);
    await page.goto(`/trips/${trip.publicId}/poll`);
    await hydrated(page);
    await page.getByRole("button", { name: en.poll.fixButton }).click();
    const sheet = page.getByRole("dialog", { name: en.poll.fix.title });
    await sheet.getByRole("button", { name: en.poll.fix.confirm }).click();
    await expect(page).toHaveURL(new RegExp(`/trips/${trip.publicId}$`));
    await expect.poll(async () => (await stayRows(trip.tripId))[0]?.booked).toBe(false);
    await expect
      .poll(async () => stayTripState(trip.tripId))
      .toMatchObject({ dates_changed: true, booking_reset: true });

    // Cockpit: V3 «New dates – rebook Villa Mare …» (rule 5).
    await expect(page.getByText(fill(en.route.v3.rebook, { title: "Villa Mare" }))).toBeVisible();
    await page.goto(`/trips/${trip.publicId}/stays`);
    await hydrated(page);
    await expect(page.getByText(/Your dates have changed/)).toBeVisible();
    await expect(page.getByText(s.datesChangedUnbooked)).toBeVisible();
    await page.getByRole("button", { name: s.datesChangedClose }).click();
    await expect(page.getByText(/Your dates have changed/)).toHaveCount(0);
    await expect.poll(async () => (await stayTripState(trip.tripId))?.notice_dismissed).toBe(true);
  });
});

test.describe("R.7 I9-10 – leaving, deletion, export", () => {
  test("leaving: own ratings deleted, own suggestion stays as «former member»; export; cascade", async ({
    page,
  }) => {
    const trip = await stayTrip(page);
    const [mine = "", other = ""] = await addStays(trip.tripId, [
      { title: "Kais Haus", by: { email: trip.email }, priceEuro: 700, note: "Mit Garten" },
      { title: "Lenas Villa", by: { name: "Lena Berg" } },
    ]);
    await rateStays(trip.tripId, { email: trip.email }, { [mine]: "like", [other]: "nope" });

    // Data export (F-013): own suggestions and own ratings only.
    const exported = (await (await page.request.get("/account/export")).json()) as {
      trips: { name: string; myStaySuggestions: { title: string }[]; myStayRatings: unknown[] }[];
    };
    const entry = exported.trips.find((t) => t.name === trip.name);
    expect(entry?.myStaySuggestions.map((x) => x.title)).toEqual(["Kais Haus"]);
    expect(entry?.myStayRatings).toHaveLength(2);

    await page.goto(`/trips/${trip.publicId}`);
    await hydrated(page);
    await page.getByRole("button", { name: en.trip.menu }).click();
    await page.getByRole("button", { name: en.trip.menuItems.leave }).click();
    await page.getByRole("button", { name: en.trip.dialogs.leaveConfirm }).click();
    await expect(page).toHaveURL(/\/trips$/);
    await expect
      .poll(async () => stayRows(trip.tripId))
      .toEqual([
        { title: "Kais Haus", chosen: false, booked: false, ratings: 0, author: null },
        expect.objectContaining({ title: "Lenas Villa", ratings: 0 }),
      ]);
  });
});

test.describe("rights, proxy, CSP", () => {
  test("non-member: area 404; image proxy and preview reject foreign trips", async ({ page }) => {
    const other = await seedTrip(`Foreign ${String(Date.now())}`);
    await setFixedDates(other.tripId, 41, 48);
    const [foreign = ""] = await addStays(other.tripId, [{ title: "Hidden" }]);
    await signUp(page, "Kai", uniqueEmail("kai"));
    const response = await page.goto(`/trips/${other.publicId}/stays`);
    expect(response?.status()).toBe(404);
    const image = await page.request.get(`/api/stays/image?s=${foreign}`);
    expect(image.status()).toBe(404);
    expect(image.headers()["content-security-policy"]).toBe("default-src 'none'; sandbox");
    expect(image.headers()["x-content-type-options"]).toBe("nosniff");
    const preview = await page.request.post("/api/stays/preview", {
      data: { trip: other.publicId, url: "https://booking.example/x" },
      headers: { origin: new URL(page.url()).origin },
    });
    expect(preview.status()).toBe(404);
    // Without an Origin the JSON endpoint refuses (CSRF).
    const noOrigin = await page.request.post("/api/stays/preview", {
      data: { trip: other.publicId, url: "https://booking.example/x" },
      headers: { origin: "https://evil.example" },
    });
    expect(noOrigin.status()).toBe(403);
  });

  test("R-077: no link preview once a place is picked or 30 suggestions exist", async ({
    page,
  }) => {
    const trip = await stayTrip(page);
    const dup = "https://ferienhaus.example/r077-dup";
    await addStays(trip.tripId, [{ title: "Villa Mare", url: dup }]);
    const ask = async (url: string) => {
      const response = await page.request.post("/api/stays/preview", {
        data: { trip: trip.publicId, url },
        headers: { origin: new URL(page.url()).origin },
      });
      expect(response.status()).toBe(200);
      return (await response.json()) as { ok: boolean; duplicate?: unknown };
    };
    // Open: the duplicate is reported (the route got past the gate).
    expect((await ask(dup)).duplicate).toBeDefined();
    // 30 suggestions: neutral refusal, the gate comes before the duplicate check and the fetch.
    await addStays(
      trip.tripId,
      Array.from({ length: 29 }, (_, i) => ({ title: `Place ${String(i)}` })),
    );
    expect(await ask(dup)).toEqual({ ok: false });
    expect(await ask("https://booking.example/new")).toEqual({ ok: false });

    const second = await seedTrip(`Picked ${String(Date.now())}`, { extraMembers: 1 });
    await addAccountToTrip(second.tripId, trip.email, "Kai");
    await setFixedDates(second.tripId, 41, 48);
    await addStays(second.tripId, [
      { title: "Villa Mare", url: dup, chosen: true },
      { title: "Casa Azul" },
    ]);
    const picked = await page.request.post("/api/stays/preview", {
      data: { trip: second.publicId, url: dup },
      headers: { origin: new URL(page.url()).origin },
    });
    expect(await picked.json()).toEqual({ ok: false });
    // A tampered or plain preview token never reaches the image fetcher.
    const forged = await page.request.get("/api/stays/image?t=eyJ0cmlwIjoieCJ9");
    expect(forged.status()).toBe(404);
  });

  test("CSP stage 1 on pages; no request to third-party hosts on the area", async ({ page }) => {
    const trip = await stayTrip(page);
    await addStays(trip.tripId, [{ title: "Villa Mare" }]);
    const hosts = new Set<string>();
    page.on("request", (request) => hosts.add(new URL(request.url()).host));
    const response = await page.goto(`/trips/${trip.publicId}/stays`);
    await hydrated(page);
    const csp = response?.headers()["content-security-policy"] ?? "";
    expect(csp).toContain("img-src 'self' data: blob:");
    expect(csp).toContain("frame-ancestors 'none'");
    expect([...hosts]).toEqual([new URL(page.url()).host]);
  });
});

test.describe("W18 E.11 – 360 px, 200 % text", () => {
  test("ranking and rows fit 360 px at 200 % text without horizontal scrolling", async ({
    page,
  }) => {
    const trip = await stayTrip(page, { role: "organizer" });
    await addStays(trip.tripId, [
      {
        title: "Kamena Kuća – Steinhaus mit sehr langem Namen über zwei Zeilen hinweg",
        priceEuro: 2050,
        note: "5 Min. zum Zlatni Rat",
      },
      { title: "Casa Azul" },
    ]);
    await page.setViewportSize({ width: 360, height: 640 });
    await page.goto(`/trips/${trip.publicId}/stays`);
    await hydrated(page);
    await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
    // Nothing in the area sticks out (1.4.10) – the footer's language switch is out of scope.
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            [...document.querySelectorAll("main *")].filter(
              (element) => element.getBoundingClientRect().right > 361,
            ).length,
        ),
      )
      .toBe(0);
    await expectNoSeriousAxeViolations(page, "stays 200%");
  });
});
