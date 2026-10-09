import { randomBytes } from "node:crypto";
import { expect, test } from "@playwright/test";
import en from "../../messages/en.json" with { type: "json" };
import { openJoinForm, signUp } from "./helpers/auth";
import { addTripMembers, fillJoinLimit, memberNames, seedTrip, tripRow } from "./helpers/db";
import { uniqueEmail, waitForAccessMail } from "./helpers/mailpit";
import { createTripViaUi, joinSignedIn } from "./helpers/trips";

// Increment 2: F-002 invite link, F-003 join in the invite flow (W03 B, Flow A.3).

const randomToken = () => randomBytes(32).toString("base64url");

test.describe("F-003 preview and join", () => {
  test("preview shows only trip facts, the organizer's first name and the count", async ({
    page,
  }) => {
    const trip = await seedTrip(`Preview ${String(Date.now())}`, {
      extraMembers: 3,
      description: "Sun, pastéis, surfing.",
    });
    await page.goto(`/i/${trip.token}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/^Preview /);
    await expect(page.getByText("by Lena")).toBeVisible();
    await expect(page.getByText("4 people are already in")).toBeVisible();
    await expect(page.getByText("4–5 nights")).toBeVisible();
    await expect(page.getByText("Sun, pastéis, surfing.")).toBeVisible();
    // No other names, no surname of the organizer.
    await expect(page.locator("body")).not.toContainText("Member 1");
    await expect(page.locator("body")).not.toContainText("Berg");
    // Link preview: trip + product name in the trip's language (sitemap §4).
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      "content",
      /^Preview \d+ · When do we go\?$/,
    );
  });

  test("signed out: e-mail → code → name joins and lands in the trip with «You're in!»", async ({
    page,
  }) => {
    const trip = await seedTrip(`Join ${String(Date.now())}`);
    const email = uniqueEmail("kemal");
    await page.goto(`/i/${trip.token}`);
    await openJoinForm(page);
    await expect(page.getByLabel(en.auth.emailLabel)).toBeVisible();
    await page.getByLabel(en.auth.emailLabel).fill(email);
    await page.getByRole("button", { name: en.auth.sendCode }).click();
    const mail = await waitForAccessMail(email);
    await page.getByLabel(en.auth.codeLabel).fill(mail.code);
    await page.getByLabel(en.auth.nameLabel).fill("Kemal");
    await page.getByRole("button", { name: en.invite.confirmJoin }).click();

    await expect(page).toHaveURL(new RegExp(`/trips/${trip.publicId}$`));
    await expect(page.getByRole("status").filter({ hasText: en.trip.welcomeTitle })).toBeVisible();
    const members = page.getByRole("region", { name: /Who's in\? \(2\)/ });
    await expect(members.getByText("Kemal")).toBeVisible();
    await expect(members.getByText(en.trip.status.open).first()).toBeVisible();
    expect(await memberNames(trip.publicId)).toEqual(["Lena Berg", "Kemal"]);

    // Opening the link again: straight to the trip, no preview (Flow A.3).
    await page.goto(`/i/${trip.token}`);
    await expect(page).toHaveURL(new RegExp(`/trips/${trip.publicId}$`));
  });

  test("signed in: one tap; a taken name gets a suggestion", async ({ page }) => {
    const trip = await seedTrip(`Tap ${String(Date.now())}`);
    await signUp(page, "Lena Berg");
    await page.goto(`/i/${trip.token}`);
    await expect(page.getByText(/Signed in as Lena Berg/)).toBeVisible();
    await expect(page.getByText("You’re joining as Lena Berg.")).toBeVisible();
    await page.getByRole("button", { name: en.invite.joinCta, exact: true }).click();
    await expect(
      page.getByText("Someone in this trip already has this name. How about “Lena B.”?"),
    ).toBeVisible();
    await page.getByRole("button", { name: en.invite.useSuggestion }).click();
    await expect(page.getByLabel(en.invite.nameForTrip)).toHaveValue("Lena B.");
    await page.getByRole("button", { name: en.invite.joinCta, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/trips/${trip.publicId}`));
    expect(await memberNames(trip.publicId)).toContain("Lena B.");
  });

  test("«Not you? Sign out» signs out and stays on the invite", async ({ page }) => {
    const trip = await seedTrip(`Swap ${String(Date.now())}`);
    await signUp(page, "Otto");
    await page.goto(`/i/${trip.token}`);
    await page.getByRole("button", { name: en.invite.notYou }).click();
    await expect(page.getByRole("button", { name: en.invite.notYou })).toHaveCount(0);
    await expect(page).toHaveURL(new RegExp(`/i/${trip.token}$`));
    await expect(page.getByRole("status").filter({ hasText: en.common.signedOut })).toBeVisible();
    await openJoinForm(page);
    await expect(page.getByLabel(en.auth.emailLabel)).toBeVisible();
  });
});

test.describe("F-003 blocked states", () => {
  test("joining closed: hint, no form", async ({ page }) => {
    const trip = await seedTrip(`Closed ${String(Date.now())}`, { joinOpen: false });
    await page.goto(`/i/${trip.token}`);
    await expect(
      page.getByText("Lena has closed joining for now. Ask in your group chat."),
    ).toBeVisible();
    await expect(page.getByLabel(en.auth.emailLabel)).toHaveCount(0);
    await expect(page.getByRole("link", { name: en.invite.planOwn })).toBeVisible();
  });

  test("full at 30 members – also when it fills up while the page is open", async ({ page }) => {
    const full = await seedTrip(`Full ${String(Date.now())}`, { extraMembers: 29 });
    await page.goto(`/i/${full.token}`);
    await expect(
      page.getByText("This trip is full (30 of 30). Ask Lena whether a spot opens up."),
    ).toBeVisible();
    await expect(page.getByLabel(en.auth.emailLabel)).toHaveCount(0);

    const almost = await seedTrip(`Almost ${String(Date.now())}`, { extraMembers: 28 });
    await signUp(page, "Late Larry");
    await page.goto(`/i/${almost.token}`);
    const join = page.getByRole("button", { name: en.invite.joinCta, exact: true });
    await expect(join).toBeVisible();
    await addTripMembers(almost.tripId, 1); // someone else was faster
    await join.click();
    await expect(page.getByText(en.auth.errors.joinFull)).toBeVisible();
    expect(await memberNames(almost.publicId)).toHaveLength(30);
  });

  test("invalid and renewed links share one message", async ({ page, browser }) => {
    await page.goto(`/i/${randomToken()}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(en.invite.invalidTitle);

    // Renew as organizer: the old link stops working, the new one works.
    await signUp(page, "Rita");
    const publicId = await createTripViaUi(page, `Renew ${String(Date.now())}`);
    const oldToken = (await tripRow(publicId))?.invite_token ?? "";
    await page.getByRole("button", { name: en.share.renew }).click();
    await page.getByRole("button", { name: en.share.renewConfirm }).click();
    await expect(page.getByRole("status").filter({ hasText: en.share.renewed })).toBeVisible();
    const newToken = (await tripRow(publicId))?.invite_token ?? "";
    expect(newToken).not.toBe(oldToken);
    expect(newToken).toMatch(/^[\w-]{43}$/);
    await expect(page.getByLabel(en.share.linkTitle)).toHaveValue(new RegExp(`/i/${newToken}$`));
    await expect(page.getByLabel(en.share.messageLabel)).toHaveValue(new RegExp(`/i/${newToken}$`));

    const guest = await browser.newContext({ locale: "en-GB" });
    const tab = await guest.newPage();
    await tab.goto(`/i/${oldToken}`);
    await expect(tab.getByRole("heading", { level: 1 })).toHaveText(en.invite.invalidTitle);
    await tab.goto(`/i/${newToken}`);
    await expect(tab.getByRole("heading", { level: 1 })).toHaveText(/^Renew /);
    await guest.close();
  });
});

test.describe("security: invite rate limits", () => {
  test("after 20 unknown tokens the IP pauses – even for a valid link", async ({ page }) => {
    const trip = await seedTrip(`Scan ${String(Date.now())}`);
    // Own client IP for this test (x-forwarded-for without proxy in dev/CI).
    const ip = `203.0.113.${String(1 + Math.floor(Math.random() * 250))}`;
    await page.context().setExtraHTTPHeaders({ "x-forwarded-for": ip });
    for (let i = 0; i < 20; i++) {
      const response = await page.request.get(`/i/${randomToken()}`, {
        headers: { "x-forwarded-for": ip },
      });
      expect(await response.text()).toContain(en.invite.invalidTitle);
    }
    await page.goto(`/i/${trip.token}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(en.invite.rateLimitedTitle);
    await expect(page.locator("body")).not.toContainText(/^Scan /);
  });

  test("join limit: max. 20 joins per trip and hour per IP (F-003)", async ({ page }) => {
    const trip = await seedTrip(`Burst ${String(Date.now())}`);
    const ip = `203.0.113.${String(1 + Math.floor(Math.random() * 250))}`;
    await fillJoinLimit(trip.tripId, ip, 20); // 20 joins from this IP within the hour
    await signUp(page, "Burst Larry");
    await page.context().setExtraHTTPHeaders({ "x-forwarded-for": ip });
    await page.goto(`/i/${trip.token}`);
    await page.getByRole("button", { name: en.invite.joinCta, exact: true }).click();
    await expect(page.getByText(/Lots of people are joining right now/)).toBeVisible();
    expect(await memberNames(trip.publicId)).toEqual(["Lena Berg"]);

    // Another IP is not affected.
    await page.context().setExtraHTTPHeaders({ "x-forwarded-for": "203.0.113.251" });
    await joinSignedIn(page, trip.token);
    expect(await memberNames(trip.publicId)).toContain("Burst Larry");
  });
});
