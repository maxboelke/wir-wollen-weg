import { describe, expect, it } from "vitest";
import type { StorageLike } from "./pending-auth";
import { clearTripDraft, loadTripDraft, saveTripDraft, TRIP_DRAFT_KEY } from "./trip-draft-storage";
import { emptyDraft } from "./trip-input";

function memory(): StorageLike & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
    removeItem: (key) => {
      data.delete(key);
    },
  };
}

describe("trip draft storage (Flow G #4)", () => {
  const draft = { ...emptyDraft("DE"), name: "Lissabon 2027" };

  it("survives in either storage for 30 minutes", () => {
    const session = memory();
    const local = memory();
    saveTripDraft(draft, 1_000, [session, local]);
    session.data.clear(); // in-app browser lost the tab
    expect(loadTripDraft(1_000 + 29 * 60_000, [session, local])).toEqual(draft);
    expect(loadTripDraft(1_000 + 31 * 60_000, [session, local])).toBeNull();
  });

  it("rejects tampered entries and clears", () => {
    const store = memory();
    store.setItem(TRIP_DRAFT_KEY, JSON.stringify({ draft: { name: 1 }, savedAt: 1 }));
    expect(loadTripDraft(2, [store])).toBeNull();
    saveTripDraft(draft, 1, [store]);
    clearTripDraft([store]);
    expect(store.getItem(TRIP_DRAFT_KEY)).toBeNull();
  });
});
