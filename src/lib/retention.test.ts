import { describe, expect, it } from "vitest";
import {
  accountDeletionDate,
  addMonths,
  effectiveDeletionDate,
  inNoticeWindow,
  retentionAction,
  tripDeletionDate,
} from "./retention";

const d = (iso: string) => new Date(`${iso}T00:00:00Z`);

describe("retention rules (F-013, F-043)", () => {
  it("adds calendar months and clamps the day", () => {
    expect(addMonths(d("2026-01-31"), 1).toISOString().slice(0, 10)).toBe("2026-02-28");
    expect(addMonths(d("2024-10-11"), 24).toISOString().slice(0, 10)).toBe("2026-10-11");
    expect(addMonths(d("2026-10-11"), -24).toISOString().slice(0, 10)).toBe("2024-10-11");
  });

  it("deletes fixed trips 90 days after the end – whatever the activity", () => {
    const due = tripDeletionDate({
      phase: "fixed",
      fixedEnd: "2026-07-10",
      lastActivity: d("2026-10-01"),
    });
    expect(due).toEqual({ at: d("2026-10-08"), reason: "afterTrip" });
  });

  it("deletes trips without fixed dates 12 months after the last activity", () => {
    const due = tripDeletionDate({
      phase: "voting",
      fixedEnd: null,
      lastActivity: new Date("2025-10-11T15:00:00Z"),
    });
    expect(due.reason).toBe("inactive");
    expect(due.at.toISOString()).toBe("2026-10-11T15:00:00.000Z");
  });

  it("a trip far in the future is never deleted for inactivity once fixed", () => {
    const due = tripDeletionDate({
      phase: "fixed",
      fixedEnd: "2028-08-01",
      lastActivity: d("2025-01-01"),
    });
    expect(due.at > d("2028-08-01")).toBe(true);
  });

  it("sends the notice 14 days before, deletes only when due and the notice is old enough", () => {
    const due = d("2026-10-25");
    expect(retentionAction(due, null, d("2026-10-10"), 14)).toBe("none");
    expect(retentionAction(due, null, d("2026-10-11"), 14)).toBe("notice");
    expect(retentionAction(due, d("2026-10-11"), d("2026-10-20"), 14)).toBe("none");
    expect(retentionAction(due, d("2026-10-11"), d("2026-10-25"), 14)).toBe("delete");
  });

  it("a late notice postpones the deletion – never earlier than 14 days after it", () => {
    const due = d("2026-10-01");
    // The job did not run before: first the notice …
    expect(retentionAction(due, null, d("2026-10-11"), 14)).toBe("notice");
    // … then nothing until 14 days later.
    expect(retentionAction(due, d("2026-10-11"), d("2026-10-24"), 14)).toBe("none");
    expect(retentionAction(due, d("2026-10-11"), d("2026-10-25"), 14)).toBe("delete");
    expect(effectiveDeletionDate(due, d("2026-10-11"), 14)).toEqual(d("2026-10-25"));
    expect(effectiveDeletionDate(due, null, 14)).toEqual(due);
  });

  it("resets a notice when activity moved the date out of the window", () => {
    expect(retentionAction(d("2027-10-01"), d("2026-09-20"), d("2026-10-11"), 14)).toBe(
      "resetNotice",
    );
  });

  it("shows the banner within the notice window only", () => {
    expect(inNoticeWindow(d("2026-10-25"), d("2026-10-10"))).toBe(false);
    expect(inNoticeWindow(d("2026-10-25"), d("2026-10-11"))).toBe(true);
  });

  it("deletes accounts after 24 months without use", () => {
    expect(accountDeletionDate(d("2024-10-11"))).toEqual(d("2026-10-11"));
    const due = accountDeletionDate(d("2024-10-11"));
    expect(retentionAction(due, null, d("2026-09-11"), 30)).toBe("notice");
    expect(retentionAction(due, null, d("2026-09-10"), 30)).toBe("none");
  });
});
