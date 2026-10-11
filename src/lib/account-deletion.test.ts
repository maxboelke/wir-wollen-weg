import { describe, expect, it } from "vitest";
import {
  parseDeletionChoices,
  resolveDeletionPlan,
  soloTrips,
  successorsOf,
  tripsNeedingChoice,
  type DeletionTripState,
} from "./account-deletion";

const SARA = "0190a000-0000-7000-8000-000000000001";
const JONAS = "0190a000-0000-7000-8000-000000000002";

const at = (iso: string) => new Date(`${iso}T10:00:00Z`);

const organised: DeletionTripState = {
  tripId: "t-lisbon",
  publicId: "lisbon2027",
  name: "Lissabon 2027",
  role: "organizer",
  others: [
    { userId: JONAS, displayName: "Jonas", joinedAt: at("2026-05-04") },
    { userId: SARA, displayName: "Sara", joinedAt: at("2026-05-02") },
  ],
};
const solo: DeletionTripState = {
  tripId: "t-solo",
  publicId: "testreise1",
  name: "Testreise",
  role: "organizer",
  others: [],
};
const member: DeletionTripState = {
  tripId: "t-member",
  publicId: "jgatim2027",
  name: "JGA Tim",
  role: "member",
  others: [{ userId: SARA, displayName: "Sara", joinedAt: at("2026-01-01") }],
};

describe("account deletion plan (F-043, Flow I.3)", () => {
  it("sorts successors by joining date – the longest member is suggested", () => {
    expect(successorsOf(organised).map((o) => o.displayName)).toEqual(["Sara", "Jonas"]);
  });

  it("groups trips: decision needed, deleted with the account", () => {
    const trips = [organised, solo, member];
    expect(tripsNeedingChoice(trips).map((t) => t.name)).toEqual(["Lissabon 2027"]);
    expect(soloTrips(trips).map((t) => t.name)).toEqual(["Testreise"]);
  });

  it("hands over, deletes solo trips and leaves member trips", () => {
    const plan = resolveDeletionPlan([organised, solo, member], {
      lisbon2027: { action: "transfer", to: JONAS },
    });
    expect(plan).toEqual({
      ok: true,
      steps: [
        { kind: "transfer", tripId: "t-lisbon", to: JONAS },
        { kind: "deleteTrip", tripId: "t-solo", publicId: "testreise1", name: "Testreise" },
        { kind: "leave", tripId: "t-member" },
      ],
    });
  });

  it("deletes an organised trip for everybody when chosen", () => {
    const plan = resolveDeletionPlan([organised], { lisbon2027: { action: "delete" } });
    expect(plan).toEqual({
      ok: true,
      steps: [
        { kind: "deleteTrip", tripId: "t-lisbon", publicId: "lisbon2027", name: "Lissabon 2027" },
      ],
    });
  });

  it("is outdated when a trip needs a choice but has none (e.g. someone joined a solo trip)", () => {
    expect(resolveDeletionPlan([organised], {})).toEqual({ ok: false, reason: "planOutdated" });
  });

  it("is outdated when the chosen successor is no longer a member", () => {
    const left = { ...organised, others: organised.others.filter((o) => o.userId !== JONAS) };
    expect(resolveDeletionPlan([left], { lisbon2027: { action: "transfer", to: JONAS } })).toEqual({
      ok: false,
      reason: "planOutdated",
    });
  });

  it("never transfers to someone of another trip (choices are per trip)", () => {
    const other = {
      ...organised,
      others: [{ userId: "x", displayName: "Xenia", joinedAt: at("2026-05-01") }],
    };
    expect(resolveDeletionPlan([other], { lisbon2027: { action: "transfer", to: SARA } })).toEqual({
      ok: false,
      reason: "planOutdated",
    });
  });

  it("inactivity deletion hands the role to the longest member automatically", () => {
    const plan = resolveDeletionPlan([organised, solo], "auto");
    expect(plan.ok && plan.steps[0]).toEqual({ kind: "transfer", tripId: "t-lisbon", to: SARA });
  });

  it("ignores inherited properties as choices", () => {
    expect(resolveDeletionPlan([{ ...organised, publicId: "toString" }], {})).toEqual({
      ok: false,
      reason: "planOutdated",
    });
  });
});

describe("parseDeletionChoices (untrusted input)", () => {
  it("accepts transfer and delete per public id", () => {
    expect(
      parseDeletionChoices({
        lisbon2027: { action: "transfer", to: SARA.toUpperCase() },
        testreise1: { action: "delete" },
      }),
    ).toEqual({
      lisbon2027: { action: "transfer", to: SARA },
      testreise1: { action: "delete" },
    });
  });

  it("rejects malformed input", () => {
    expect(parseDeletionChoices(null)).toBeNull();
    expect(parseDeletionChoices([])).toBeNull();
    expect(parseDeletionChoices({ "../x": { action: "delete" } })).toBeNull();
    expect(parseDeletionChoices({ lisbon2027: { action: "transfer", to: "1 or 1=1" } })).toBeNull();
    expect(parseDeletionChoices({ lisbon2027: { action: "keep" } })).toBeNull();
    expect(parseDeletionChoices({ lisbon2027: "delete" })).toBeNull();
  });

  it("accepts an empty plan (nothing organised)", () => {
    expect(parseDeletionChoices({})).toEqual({});
  });
});
