import { describe, expect, it } from "vitest";
import { runningTrips, startTrip, type StartCandidate } from "./start-trip";

const trip = (
  publicId: string,
  fixedStart: string | null,
  fixedEnd: string | null,
  phase = "fixed",
): StartCandidate => ({ publicId, name: publicId.toUpperCase(), phase, fixedStart, fixedEnd });

describe("startTrip (W16 v2.18)", () => {
  const summer = trip("summer", "2027-06-10", "2027-06-17");

  it("exactly one running trip → its cockpit", () => {
    expect(startTrip([summer], "2027-06-12")).toEqual({ kind: "trip", publicId: "summer" });
  });

  it("the arrival day counts, the day before does not (client decision)", () => {
    expect(startTrip([summer], "2027-06-10")).toEqual({ kind: "trip", publicId: "summer" });
    expect(startTrip([summer], "2027-06-09")).toEqual({ kind: "list" });
  });

  it("the departure day counts, the day after does not («Danach»)", () => {
    expect(startTrip([summer], "2027-06-17")).toEqual({ kind: "trip", publicId: "summer" });
    expect(startTrip([summer], "2027-06-18")).toEqual({ kind: "list" });
  });

  it("no fixed dates or another phase → no candidate", () => {
    expect(startTrip([trip("a", null, null, "collecting")], "2027-06-12")).toEqual({
      kind: "list",
    });
    // Dates cleared again (phase 2) – the old dates no longer count.
    expect(startTrip([trip("b", "2027-06-10", "2027-06-17", "voting")], "2027-06-12")).toEqual({
      kind: "list",
    });
  });

  it("two overlapping trips → no automatic choice", () => {
    const weekend = trip("weekend", "2027-06-12", "2027-06-13");
    expect(startTrip([summer, weekend], "2027-06-12")).toEqual({ kind: "list" });
    expect(startTrip([summer, weekend], "2027-06-14")).toEqual({
      kind: "trip",
      publicId: "summer",
    });
  });

  it("no trips → list", () => {
    expect(startTrip([], "2027-06-12")).toEqual({ kind: "list" });
  });
});

describe("runningTrips", () => {
  it("day x of y, ordered by arrival", () => {
    const list = runningTrips(
      [trip("late", "2027-06-12", "2027-06-13"), trip("early", "2027-06-10", "2027-06-17")],
      "2027-06-12",
    );
    expect(list).toEqual([
      { publicId: "early", name: "EARLY", day: 3, total: 8 },
      { publicId: "late", name: "LATE", day: 1, total: 2 },
    ]);
  });

  it("a window before the arrival is only a parameter (0 by default)", () => {
    const next = trip("next", "2027-06-13", "2027-06-20");
    expect(runningTrips([next], "2027-06-12")).toEqual([]);
    expect(runningTrips([next], "2027-06-12", 1)).toEqual([
      { publicId: "next", name: "NEXT", day: 1, total: 8 },
    ]);
  });
});
