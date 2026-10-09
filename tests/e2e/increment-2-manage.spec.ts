import { expect, test, type Page, type Request } from "@playwright/test";
import en from "../../messages/en.json" with { type: "json" };
import { signUp } from "./helpers/auth";
import { memberNames, organizerName, renameInParallel, tripRow } from "./helpers/db";
import { createTripViaUi, joinSignedIn, newPerson, openTripMenu } from "./helpers/trips";

// Increment 2: F-004 roles & management (W12, Flow J), rights checked on the server, no IDOR.

/** Organizer Lena creates a trip, Ben joins via the invite link. */
async function tripWithMember(page: Page, browser: import("@playwright/test").Browser) {
  await signUp(page, "Lena");
  const name = `Team ${String(Date.now())}`;
  const publicId = await createTripViaUi(page, name);
  const token = (await tripRow(publicId))?.invite_token ?? "";
  const ben = await newPerson(browser, "Ben");
  await joinSignedIn(ben.page, token);
  return { publicId, token, name, ben };
}

test.describe("no access without membership (sitemap §4)", () => {
  test("non-members get the same «not found» as for trips that do not exist", async ({
    page,
    browser,
  }) => {
    await signUp(page, "Lena");
    const publicId = await createTripViaUi(page, `Secret ${String(Date.now())}`);
    const eve = await newPerson(browser, "Eve");
    for (const path of ["", "/invite", "/settings", "/days"]) {
      await eve.page.goto(`/trips/${publicId}${path}`);
      await expect(eve.page.getByRole("heading", { level: 1 })).toHaveText(en.trip.notFoundTitle);
      await expect(eve.page.locator("body")).not.toContainText("Secret");
    }
    await eve.page.goto("/trips/zzzzzzzzzz");
    await expect(eve.page.getByRole("heading", { level: 1 })).toHaveText(en.trip.notFoundTitle);
    await eve.context.close();
  });

  test("signed out: trip pages ask to sign in and come back", async ({ page }) => {
    await page.goto("/trips/abcdefghij/invite");
    await expect(page).toHaveURL(/\/login\?next=%2Ftrips%2Fabcdefghij%2Finvite$/);
  });
});

test.describe("organizer-only actions are enforced on the server (F-004)", () => {
  test("a member replaying the organizer's Server Action changes nothing", async ({
    page,
    browser,
  }) => {
    const { publicId, ben } = await tripWithMember(page, browser);

    // Member view: no organizer controls, settings redirect to the overview.
    await ben.page.goto(`/trips/${publicId}/settings`);
    await expect(ben.page).toHaveURL(new RegExp(`/trips/${publicId}$`));
    await openTripMenu(ben.page);
    await expect(ben.page.getByRole("dialog").getByText(en.trip.menuItems.edit)).toHaveCount(0);
    await expect(ben.page.getByRole("dialog").getByText(en.trip.menuItems.delete)).toHaveCount(0);
    await ben.page.goto(`/trips/${publicId}/invite`);
    await expect(ben.page.getByText(en.share.orgaTitle)).toHaveCount(0);

    // Capture the organizer's real requests (close joining, renew link) …
    await page.goto(`/trips/${publicId}/invite`);
    const capture = (trigger: () => Promise<void>) =>
      Promise.all([
        page.waitForRequest((r: Request) => r.method() === "POST" && !!r.headers()["next-action"]),
        trigger(),
      ]).then(([request]) => request);
    const closeJoin = await capture(() =>
      page.getByRole("switch", { name: en.share.joinOpen }).click(),
    );
    await expect.poll(async () => (await tripRow(publicId))?.join_open).toBe(false);
    await page.getByRole("switch", { name: en.share.joinOpen }).click();
    await expect.poll(async () => (await tripRow(publicId))?.join_open).toBe(true);
    const tokenBefore = (await tripRow(publicId))?.invite_token;

    // … and replay them with Ben's session: the server refuses.
    for (const request of [closeJoin]) {
      const response = await ben.context.request.post(request.url(), {
        headers: {
          "next-action": request.headers()["next-action"] ?? "",
          "content-type": request.headers()["content-type"] ?? "text/plain;charset=UTF-8",
          origin: new URL(request.url()).origin,
          accept: "text/x-component",
        },
        data: request.postData() ?? "",
      });
      expect(response.status()).toBe(200);
      expect(await response.text()).toContain("notAllowed");
    }
    expect((await tripRow(publicId))?.join_open).toBe(true);
    expect((await tripRow(publicId))?.invite_token).toBe(tokenBefore);
    await ben.context.close();
  });
});

test.describe("Flow J dialogs", () => {
  test("member renames, then leaves; the organizer must hand over first", async ({
    page,
    browser,
  }) => {
    const { publicId, name, ben } = await tripWithMember(page, browser);

    await openTripMenu(ben.page);
    await ben.page.getByRole("button", { name: en.trip.menuItems.rename }).click();
    await ben.page
      .getByRole("dialog")
      .getByLabel(en.trip.dialogs.renameLabel, { exact: true })
      .fill("Benny");
    await ben.page.getByRole("button", { name: en.common.save }).click();
    await expect(
      ben.page.getByRole("status").filter({ hasText: en.trip.dialogs.renameDone }),
    ).toBeVisible();
    expect(await memberNames(publicId)).toEqual(["Lena", "Benny"]);

    await openTripMenu(ben.page);
    await ben.page.getByRole("button", { name: en.trip.menuItems.leave }).click();
    await expect(ben.page.getByRole("heading", { name: `Leave “${name}”?` })).toBeFocused();
    await ben.page.getByRole("button", { name: en.trip.dialogs.leaveConfirm }).click();
    await expect(ben.page).toHaveURL(/\/trips$/);
    await expect(
      ben.page.getByRole("status").filter({ hasText: `You left “${name}”.` }),
    ).toBeVisible();
    expect(await memberNames(publicId)).toEqual(["Lena"]);
    await ben.page.goto(`/trips/${publicId}`);
    await expect(ben.page.getByRole("heading", { level: 1 })).toHaveText(en.trip.notFoundTitle);

    // Organizer alone: leaving means deleting.
    await page.goto(`/trips/${publicId}`);
    await openTripMenu(page);
    await page.getByRole("button", { name: en.trip.menuItems.leave }).click();
    await expect(page.getByText(en.trip.dialogs.leaveOrgaSolo)).toBeVisible();
    await expect(page.getByRole("button", { name: en.trip.dialogs.transfer })).toHaveCount(0);
    await ben.context.close();
  });

  test("parallel renames to the same name never create a duplicate (R-039)", async ({
    page,
    browser,
  }) => {
    const { publicId, ben } = await tripWithMember(page, browser);
    await page.goto(`/trips/${publicId}`);
    const dialogs = [page, ben.page];
    for (const p of dialogs) {
      await openTripMenu(p);
      await p.getByRole("button", { name: en.trip.menuItems.rename }).click();
      await p
        .getByRole("dialog")
        .getByLabel(en.trip.dialogs.renameLabel, { exact: true })
        .fill(p === page ? "Kemal" : "kemal");
    }
    // Both save at the same time.
    await Promise.all(dialogs.map((p) => p.getByRole("button", { name: en.common.save }).click()));
    await expect
      .poll(async () => (await memberNames(publicId)).filter((n) => n.toLowerCase() === "kemal"))
      .toHaveLength(1);
    // Exactly one of them gets «saved», the other one a suggestion instead.
    const saved = (p: Page) =>
      p.getByRole("status").filter({ hasText: en.trip.dialogs.renameDone }).isVisible();
    await expect
      .poll(async () => (await Promise.all(dialogs.map(saved))).filter(Boolean).length)
      .toBe(1);
    await ben.context.close();
  });

  test("the database rejects a duplicate name even without the app check (R-039)", async () => {
    // Two transactions rename two members of one trip to «Kemal»/«KEMAL» at the same time,
    // bypassing the app: exactly one succeeds, the other hits the unique index.
    const outcome = await renameInParallel(["Kemal", "KEMAL"]);
    expect(outcome.sort()).toEqual(["23505", "ok"]);
  });

  test("hand over the organizer role, remove a member", async ({ page, browser }) => {
    const { publicId, ben, token } = await tripWithMember(page, browser);
    const cara = await newPerson(browser, "Cara");
    await joinSignedIn(cara.page, token);

    // Remove Cara from the overview (row «⋯»), renewing the link.
    await page.goto(`/trips/${publicId}`);
    await page.getByRole("button", { name: "Actions for Cara" }).click();
    await page.getByRole("button", { name: en.trip.dialogs.removeAction }).click();
    await expect(page.getByRole("heading", { name: "Remove Cara?" })).toBeVisible();
    await page.getByLabel(en.trip.dialogs.removeRenew).check();
    await page.getByRole("button", { name: en.trip.dialogs.removeConfirm }).click();
    await expect(page.getByRole("status").filter({ hasText: "Cara was removed." })).toBeVisible();
    expect(await memberNames(publicId)).toEqual(["Lena", "Ben"]);
    expect((await tripRow(publicId))?.invite_token).not.toBe(token);
    await cara.page.goto(`/trips/${publicId}`);
    await expect(cara.page.getByRole("heading", { level: 1 })).toHaveText(en.trip.notFoundTitle);

    // Hand over via «Leave trip» (Flow J): Ben becomes organizer, Lena stays a member.
    await openTripMenu(page);
    await page.getByRole("button", { name: en.trip.menuItems.leave }).click();
    await expect(page.getByText(en.trip.dialogs.leaveOrgaText)).toBeVisible();
    await page.getByRole("button", { name: en.trip.dialogs.transfer }).click();
    await page.getByRole("radio", { name: /Ben/ }).check();
    await page.getByRole("button", { name: en.trip.dialogs.transferConfirm }).click();
    await expect(
      page.getByRole("status").filter({ hasText: "Ben is now the organizer." }),
    ).toBeVisible();
    expect(await organizerName(publicId)).toBe("Ben");
    await page.goto(`/trips/${publicId}/settings`);
    await expect(page).toHaveURL(new RegExp(`/trips/${publicId}$`));
    await ben.page.goto(`/trips/${publicId}/settings`);
    await expect(ben.page.getByRole("heading", { level: 1 })).toHaveText(en.tripSettings.title);
    await cara.context.close();
    await ben.context.close();
  });

  test("edit the trip, then delete it by typing its name", async ({ page, browser }) => {
    const { publicId, name, ben } = await tripWithMember(page, browser);
    await page.goto(`/trips/${publicId}/settings`);
    await page.getByLabel(en.tripForm.nameLabel).fill(`${name} (edited)`);
    await page.getByRole("button", { name: en.tripForm.save }).click();
    await expect(page.getByRole("status").filter({ hasText: en.tripForm.saved })).toBeVisible();
    expect((await tripRow(publicId))?.name).toBe(`${name} (edited)`);

    await page.getByRole("button", { name: en.trip.dialogs.deleteConfirm }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("heading", { name: en.trip.dialogs.deleteTitle })).toBeVisible();
    const confirm = dialog.getByRole("button", { name: en.trip.dialogs.deleteConfirm });
    await dialog.getByRole("textbox").fill("wrong name");
    await expect(confirm).toHaveAttribute("aria-disabled", "true");
    // Case and outer spaces are ignored (ux-spec §5.2).
    await dialog.getByRole("textbox").fill(`  ${name.toUpperCase()} (EDITED) `);
    await expect(confirm).not.toHaveAttribute("aria-disabled", "true");
    await confirm.click();
    await expect(page).toHaveURL(/\/trips$/);
    await expect(page.getByRole("status").filter({ hasText: "was deleted" })).toBeVisible();
    expect(await tripRow(publicId)).toBeUndefined();
    await ben.page.goto(`/trips/${publicId}`);
    await expect(ben.page.getByRole("heading", { level: 1 })).toHaveText(en.trip.notFoundTitle);
    await ben.context.close();
  });
});
