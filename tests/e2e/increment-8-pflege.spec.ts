import { expect, test } from "@playwright/test";
import en from "../../messages/en.json" with { type: "json" };
import { signUp } from "./helpers/auth";
import {
  addAccountToTrip,
  addMemberWithDays,
  isoDay,
  makeOrganizer,
  markPollCanceled,
  markSubmitted,
  seedTrip,
  setDeadline,
} from "./helpers/db";
import { uniqueEmail } from "./helpers/mailpit";

// Pflege-Paket next to Increment 8: F-017 rest (to-do «start the vote» after the deadline for
// adding dates) and the Q21 notice also on the overview. Accounts: en-GB.

test.use({ locale: "en-GB" });

test("F-017 rest: organiser sees «start the vote» in My trips once the deadline has passed", async ({
  page,
}) => {
  const trip = await seedTrip(`Deadline ${String(Date.now())}`);
  const email = await signUp(page, "Kai", uniqueEmail("kai"));
  await addAccountToTrip(trip.tripId, email, "Kai");
  await makeOrganizer(trip.tripId, email);
  await markSubmitted(trip.tripId, email);
  await addMemberWithDays(trip.tripId, "Zora", {}, false);
  await page.goto("/trips");
  await expect(page.getByText(en.trips.todo.startVoteDeadline)).toHaveCount(0);
  await setDeadline(trip.tripId, isoDay(-1));
  await page.goto("/trips");
  await expect(page.getByText(en.trips.todo.startVoteDeadline)).toBeVisible();
  await expect(
    page.getByRole("link", { name: en.trips.action.startVoteDeadline }).first(),
  ).toHaveAttribute("href", `/trips/${trip.publicId}/poll/new`);
});

test("Q21: the cancel notice also shows on the overview – once", async ({ page }) => {
  const trip = await seedTrip(`Cancel ${String(Date.now())}`);
  const email = await signUp(page, "Kai", uniqueEmail("kai"));
  await addAccountToTrip(trip.tripId, email, "Kai");
  await markSubmitted(trip.tripId, email);
  await markPollCanceled(trip.tripId);
  await page.goto(`/trips/${trip.publicId}`);
  const notice = page.getByText(en.poll.canceledNotice.replace("{name}", "Lena Berg"));
  await expect(notice).toBeVisible();
  await page.waitForLoadState("networkidle");
  await page.reload();
  await expect(page.getByRole("heading", { level: 1, name: /Cancel/ })).toBeVisible();
  await expect(notice).toHaveCount(0);
});
