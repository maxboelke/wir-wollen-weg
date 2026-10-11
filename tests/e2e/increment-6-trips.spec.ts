import { expect, test, type Page, type Request } from "@playwright/test";
import de from "../../messages/de.json" with { type: "json" };
import en from "../../messages/en.json" with { type: "json" };
import { signUp } from "./helpers/auth";
import { expectNoSeriousAxeViolations } from "./helpers/axe";
import {
  addAccountToTrip,
  addMemberWithDays,
  addVoter,
  cancelState,
  isoDay,
  makeOrganizer,
  seedPoll,
  seedTrip,
  setAvailability,
  tripDayCount,
} from "./helpers/db";
import { uniqueEmail } from "./helpers/mailpit";
import { newPerson, openTripMenu } from "./helpers/trips";

// Increment 6: Q21 «Abstimmung abbrechen» (ux-spec §13.1 a), Q22 hint in phase 3 (§13.1 b),
// copy B5/B9 (§13) and A3 (§12, R-054), help (F-051) and legal pages (F-013) incl. axe
// light/dark. Only visible elements, `expect.poll` – also on 393 × 659 (WebKit iPhone 15).

test.use({ locale: "en-GB" });

const hydrated = (page: Page) => page.waitForLoadState("networkidle");
const fill = (text: string, values: Record<string, string | number>) =>
  Object.entries(values).reduce(
    (out, [key, value]) => out.replace(`{${key}}`, String(value)),
    text,
  );

/** Kemal (signed in, organiser or member) in a trip with a running vote; Zora voted. */
async function votingTrip(page: Page, role: "organizer" | "member" = "organizer") {
  const trip = await seedTrip(`Vote ${String(Date.now())}`);
  const email = await signUp(page, "Kemal", uniqueEmail("kemal"));
  await addAccountToTrip(trip.tripId, email, "Kemal");
  if (role === "organizer") await makeOrganizer(trip.tripId, email);
  await setAvailability(trip.tripId, email, { [isoDay(41)]: "no" });
  const options = await seedPoll(trip.tripId, [
    [isoDay(40), isoDay(44)],
    [isoDay(50), isoDay(54)],
  ]);
  await addVoter(trip.tripId, "Zora", options, ["yes", "no"]);
  return { ...trip, email };
}

test.describe("cancel the vote (Q21)", () => {
  test("organiser cancels in the tab «Vote»; members see the notice once; replay refused", async ({
    page,
    browser,
  }) => {
    test.slow();
    const trip = await votingTrip(page);
    const sara = await newPerson(browser, "Sara");
    await addAccountToTrip(trip.tripId, sara.email, "Sara");

    // Not on other tabs, never for members.
    await page.goto(`/trips/${trip.publicId}`);
    await hydrated(page);
    await openTripMenu(page);
    await expect(page.getByRole("dialog").getByText(en.trip.menuItems.cancelPoll)).toHaveCount(0);
    await page.keyboard.press("Escape");
    await sara.page.goto(`/trips/${trip.publicId}/poll`);
    await hydrated(sara.page);
    await openTripMenu(sara.page);
    await expect(sara.page.getByRole("dialog").getByText(en.trip.menuItems.cancelPoll)).toHaveCount(
      0,
    );
    await sara.page.keyboard.press("Escape");

    await page.goto(`/trips/${trip.publicId}/poll`);
    await hydrated(page);
    await openTripMenu(page);
    await page.getByRole("button", { name: en.trip.menuItems.cancelPoll }).click();
    const dialog = page.getByRole("dialog", { name: en.trip.dialogs.cancelPollTitle });
    await expect(dialog.getByText(en.trip.dialogs.cancelPollText)).toBeVisible();
    // The safe choice has the focus (ux-spec §13.1 a).
    await expect(
      dialog.getByRole("button", { name: en.trip.dialogs.cancelPollKeep }),
    ).toBeFocused();

    const captured = page.waitForRequest(
      (r: Request) => r.method() === "POST" && r.headers()["next-action"] !== undefined,
    );
    await dialog.getByRole("button", { name: en.trip.dialogs.cancelPollConfirm }).click();
    const request = await captured;
    await expect(page.getByRole("status").getByText(en.trip.dialogs.cancelPollDone)).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(en.poll.emptyOrgaTitle);
    await expect
      .poll(() => cancelState(trip.publicId))
      .toEqual({ phase: "collecting", options: 0, votes: 0, canceled: true, voted: 0 });
    // Everyone's days stay.
    expect(await tripDayCount(trip.tripId)).toBe(1);
    // No notice for the organiser who cancelled.
    await page.reload();
    await expect(page.getByText(/cancelled the vote/)).toHaveCount(0);

    // Sara sees the notice once.
    const notice = fill(en.poll.canceledNotice, { name: "Kemal" });
    await sara.page.goto(`/trips/${trip.publicId}/poll`);
    await expect(sara.page.getByText(notice)).toBeVisible();
    await hydrated(sara.page);
    await expect
      .poll(async () => {
        await sara.page.reload();
        return sara.page.getByText(notice).count();
      })
      .toBe(0);

    // A member replaying the organiser's request changes nothing (server-side role check).
    const headers = await request.allHeaders();
    const replay = await sara.context.request.post(request.url(), {
      headers: {
        "next-action": headers["next-action"] ?? "",
        "content-type": headers["content-type"] ?? "text/plain;charset=UTF-8",
        accept: "text/x-component",
      },
      data: request.postData() ?? "",
    });
    expect(replay.status()).toBeLessThan(500);
    expect(await replay.text()).toContain("notAllowed");
    await sara.context.close();
  });
});

test.describe("organiser hints (Q22, B5, B9, A3)", () => {
  test("phase 3: settings say the fixed dates stay untouched (Q22)", async ({ page }) => {
    const trip = await seedTrip(`Fixed ${String(Date.now())}`, { phase: "fixed" });
    const email = await signUp(page, "Kemal", uniqueEmail("fixed"));
    await addAccountToTrip(trip.tripId, email, "Kemal");
    await makeOrganizer(trip.tripId, email);
    await page.goto(`/trips/${trip.publicId}/settings`);
    await expect(page.getByText(en.tripSettings.fixedNote)).toBeVisible();
    await expect(page.getByText(en.tripSettings.recalcNote)).toHaveCount(0);
  });

  test("short picks are not dropped silently (B5); duration below the minimum is said (A3)", async ({
    page,
  }) => {
    const trip = await seedTrip(`Short ${String(Date.now())}`); // minimum 4 nights
    const email = await signUp(page, "Kemal", uniqueEmail("short"));
    await addAccountToTrip(trip.tripId, email, "Kemal");
    await makeOrganizer(trip.tripId, email);
    await addMemberWithDays(trip.tripId, "Zora", { no: [isoDay(33)] });

    await page.goto(
      `/trips/${trip.publicId}/poll/new?pick=${isoDay(35)}~${isoDay(37)},${isoDay(40)}~${isoDay(46)}`,
    );
    await expect(
      page.getByText("1 selected option is shorter than 4 nights and wasn't added."),
    ).toBeVisible();

    await page.goto(`/trips/${trip.publicId}/group`);
    await hydrated(page);
    const below = "Shorter than the organizer's minimum (at least 4 nights).";
    await expect(page.getByText(below)).toHaveCount(0);
    await page.getByLabel(en.group.filters.duration).selectOption("2");
    await expect(page.getByText(below)).toBeVisible();
  });

  test("adding an option explains the reset and offers sharing (B9)", async ({ page }) => {
    const trip = await votingTrip(page);
    await page.goto(`/trips/${trip.publicId}/poll`);
    await hydrated(page);
    await page.getByRole("button", { name: en.poll.addOption }).click();
    const sheet = page.getByRole("dialog", { name: en.poll.period.titleAdd });
    await expect(sheet.getByText(en.poll.addOptionNote)).toBeVisible();
    await sheet.getByRole("button", { name: en.poll.period.add, exact: true }).click();
    const toast = page.getByRole("status").filter({ hasText: en.poll.addOptionDone });
    await expect(toast).toBeVisible();
    await toast.getByRole("button", { name: en.poll.addOptionShare }).click();
    await expect(page.getByRole("dialog", { name: en.poll.shareTitle })).toBeVisible();
  });
});

test.describe("help, privacy, imprint (F-051, F-013)", () => {
  test("footer links, new help topics with actions, credits and legal placeholders", async ({
    page,
  }) => {
    await page.goto("/login");
    const footer = page.getByRole("contentinfo");
    await expect(footer.getByRole("link", { name: en.common.privacy })).toHaveAttribute(
      "href",
      "/en/privacy",
    );
    await expect(footer.getByRole("link", { name: en.common.imprint })).toHaveAttribute(
      "href",
      "/en/imprint",
    );
    // Privacy notice next to the e-mail field (sign-up/join), opens in a new tab.
    const notice = page.getByRole("link", { name: "privacy notice" });
    await expect(notice).toHaveAttribute("href", "/en/privacy");
    await expect(notice).toHaveAttribute("target", "_blank");

    await page.goto("/en/help#delete-account");
    const account = page.locator("details#delete-account");
    await expect(account).toHaveAttribute("open", "");
    await expect(
      account.getByRole("link", { name: en.help.topics.account.action }),
    ).toHaveAttribute("href", "/account/delete");
    for (const topic of ["group", "suggestions", "fix-dates", "retention"]) {
      await expect(page.locator(`details#${topic}`)).toHaveCount(1);
    }
    await page.getByRole("link", { name: "licences" }).click();
    await expect(page).toHaveURL(/\/en\/imprint#licenses$/);
    await expect(page.getByText(/Creative Commons BY 3\.0/)).toBeVisible();
    await expect(page.getByText(en.legal.demoNotice)).toBeVisible();
    await expect(page.getByText(/\[PLACEHOLDER: name of the operator/)).toBeVisible();

    await page.goto("/de/datenschutz");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(de.legal.privacy.title);
    await expect(page.getByText(/\[PLATZHALTER: Name Betreiber/)).toBeVisible();
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute(
      "href",
      /\/en\/privacy$/,
    );
    // Wrong-language path → counterpart in the prefix language (like /en/hilfe → /en/help).
    await page.goto("/en/datenschutz");
    await expect(page).toHaveURL(/\/en\/privacy$/);
  });

  for (const scheme of ["light", "dark"] as const) {
    test(`axe – ${scheme}: help, legal pages, delete account, goodbye`, async ({ page }) => {
      test.slow();
      await page.emulateMedia({ colorScheme: scheme });
      for (const path of ["/en/help", "/de/hilfe", "/en/privacy", "/de/impressum", "/goodbye"]) {
        await page.goto(path);
        await expectNoSeriousAxeViolations(page, `${scheme} ${path}`);
      }
      const trip = await seedTrip(`Axe ${String(Date.now())}`, { extraMembers: 1 });
      const email = await signUp(page, "Kemal", uniqueEmail("axe6"));
      await addAccountToTrip(trip.tripId, email, "Kemal");
      await makeOrganizer(trip.tripId, email);
      for (const path of ["/account", "/account/delete"]) {
        await page.goto(path);
        await expectNoSeriousAxeViolations(page, `${scheme} ${path}`);
      }
    });
  }
});
