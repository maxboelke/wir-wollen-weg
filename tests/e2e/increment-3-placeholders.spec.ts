import { expect, test } from "@playwright/test";
import en from "../../messages/en.json" with { type: "json" };
import { expectNoSeriousAxeViolations } from "./helpers/axe";
import { openJoinForm, signUp } from "./helpers/auth";
import { memberNames, placeholderRows, placeholderToken, tripRow } from "./helpers/db";
import { uniqueEmail, waitForAccessMail } from "./helpers/mailpit";
import { createTripViaUi, newPerson } from "./helpers/trips";

// Increment 3: F-007 placeholders – organiser adds expected people (W06), each with a
// personal link; whoever joins through it takes the placeholder over (Flow A.3).

test.use({ locale: "en-GB" });
const ph = en.placeholders;

test("organiser adds a placeholder; signing up via its link pre-fills the name and claims it", async ({
  page,
  browser,
}) => {
  await signUp(page, "Lena", uniqueEmail("lena"));
  const publicId = await createTripViaUi(page, `Placeholder ${String(Date.now())}`);
  await page.getByLabel(ph.nameLabel).fill("Kemal");
  await page.getByRole("button", { name: ph.add }).click();
  await expect(page.locator("#placeholders").getByText("Kemal", { exact: true })).toBeVisible();
  // Names are unique together with the members.
  await page.getByLabel(ph.nameLabel).fill("lena");
  await page.getByRole("button", { name: ph.add }).click();
  await expect(page.getByText(/already has this name/)).toBeVisible();
  await expectNoSeriousAxeViolations(page, "invite page with placeholders");

  // Overview: «Who's in? (1 + 1 placeholders)» with «not joined yet».
  await page.goto(`/trips/${publicId}`);
  await expect(page.getByRole("heading", { name: "Who's in? (1 + 1 placeholders)" })).toBeVisible();
  await expect(page.getByText(en.trip.status.placeholder)).toBeVisible();

  const token = await placeholderToken(publicId, "Kemal");
  if (!token) throw new Error("no placeholder token");
  const context = await browser.newContext({ locale: "en-GB" });
  const guest = await context.newPage();
  await guest.goto(`/i/${token}`);
  await expect(guest.getByText("Hi Kemal! Lena has invited you.")).toBeVisible();
  await openJoinForm(guest);
  const email = uniqueEmail("kemal");
  await guest.getByLabel(en.auth.emailLabel).fill(email);
  await guest.getByRole("button", { name: en.auth.sendCode }).click();
  const mail = await waitForAccessMail(email);
  await guest.getByLabel(en.auth.codeLabel).fill(mail.code);
  await expect(guest.getByLabel(en.auth.nameLabel)).toHaveValue("Kemal");
  await guest.getByRole("button", { name: en.invite.confirmJoin }).click();
  // After joining: «My dates» with the welcome hint.
  await expect(guest).toHaveURL(new RegExp(`/trips/${publicId}/days$`));
  await expect(guest.getByText(en.days.welcome.title)).toBeVisible();

  expect(await memberNames(publicId)).toEqual(["Lena", "Kemal"]);
  expect(await placeholderRows(publicId)).toEqual([{ display_name: "Kemal", claimed: true }]);

  // The used link: hint + normal join for someone else.
  const other = await newPerson(browser, "Sara");
  await other.page.goto(`/i/${token}`);
  await expect(other.page.getByText(en.invite.placeholderUsed)).toBeVisible();
  await expect(other.page.getByText("You’re joining as Sara.")).toBeVisible();
  await other.context.close();
  await context.close();
});

test("renew link also renews placeholder links; removing a placeholder kills its link", async ({
  page,
}) => {
  await signUp(page, "Lena", uniqueEmail("lena2"));
  const publicId = await createTripViaUi(page, `Renew ${String(Date.now())}`);
  for (const name of ["Jonas", "Mia"]) {
    await page.getByLabel(ph.nameLabel).fill(name);
    await page.getByRole("button", { name: ph.add }).click();
    await expect(page.locator("#placeholders").getByText(name, { exact: true })).toBeVisible();
  }
  const jonas = await placeholderToken(publicId, "Jonas");
  await page.getByRole("button", { name: en.share.renew }).click();
  await page.getByRole("button", { name: en.share.renewConfirm }).click();
  await expect(page.getByText(en.share.renewed)).toBeVisible();
  expect(await placeholderToken(publicId, "Jonas")).not.toBe(jonas);
  await page.goto(`/i/${jonas ?? ""}`);
  await expect(page.getByRole("heading", { name: en.invite.invalidTitle })).toBeVisible();

  await page.goto(`/trips/${publicId}/invite`);
  const mia = await placeholderToken(publicId, "Mia");
  await page.getByRole("button", { name: ph.actions.replace("{name}", "Mia") }).click();
  await page.getByRole("button", { name: ph.remove }).click();
  await page.getByRole("dialog").getByRole("button", { name: ph.remove }).click();
  await expect(page.getByText("Mia was removed.")).toBeVisible();
  await page.goto(`/i/${mia ?? ""}`);
  await expect(page.getByRole("heading", { name: en.invite.invalidTitle })).toBeVisible();
  expect((await tripRow(publicId))?.name).toMatch(/^Renew/);
});
