import { describe, expect, it } from "vitest";
import { canEditTripInfo } from "@/lib/trip-info";
import type { MemberView } from "@/server/trips";
import { bookersOf, canBook } from "./bookers";

// R.9 I11-02: extra rights of the marking «Bucht» per role – infos and «gebucht ✓» for the
// organiser OR «Bucht»; a member without the marking gets neither (the server actions call these
// guards before every write: `saveInfoAction`, `setBookedAction`). Picking a place stays
// organiser-only (`organizer()` in the stays actions, unchanged).

const at = (day: number) => new Date(Date.UTC(2026, 9, day));
const member = (
  name: string,
  role: "organizer" | "member",
  bookerSince: Date | null,
): MemberView => ({
  userId: name,
  displayName: name,
  role,
  joinedAt: at(1),
  submittedAt: null,
  votedAt: null,
  availabilityUpdatedAt: null,
  comment: null,
  bookerSince,
});

describe("extra rights of «Bucht» (R.9 I11-02)", () => {
  it.each([
    ["member without marking", "member", null, false],
    ["member with marking («Bucht»)", "member", at(3), true],
    ["organiser without marking", "organizer", null, true],
    ["organiser with marking", "organizer", at(2), true],
  ] as const)("%s → infos + «gebucht»: %s", (_label, role, since, allowed) => {
    expect(canBook({ role, bookerSince: since })).toBe(allowed);
    expect(canEditTripInfo({ role, bookerSince: since })).toBe(allowed);
  });

  it("fails closed when the marking is unknown", () => {
    expect(canEditTripInfo({ role: "member" })).toBe(false);
  });

  it("lists «Bucht» people organiser first, then in marking order (V3/V4 texts, max 3)", () => {
    const list = [
      member("Sara", "member", at(5)),
      member("Max", "member", null),
      member("Kemal", "member", at(4)),
      member("Lena", "organizer", at(6)),
    ];
    expect(bookersOf(list).map((m) => m.displayName)).toEqual(["Lena", "Kemal", "Sara"]);
    expect(bookersOf([member("Lena", "organizer", null)])).toEqual([]);
  });
});
