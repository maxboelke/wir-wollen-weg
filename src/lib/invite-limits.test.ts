import { describe, expect, it } from "vitest";
import { INVITE_MISS_LIMIT, isOverLimit, JOIN_LIMIT, minutesUntilFree } from "./invite-limits";

describe("invite rate limits", () => {
  it("joins: 20 per trip and hour per IP (F-003)", () => {
    expect(JOIN_LIMIT).toMatchObject({ limit: 20, windowMs: 3_600_000 });
    expect(isOverLimit(19, JOIN_LIMIT)).toBe(false);
    expect(isOverLimit(20, JOIN_LIMIT)).toBe(true);
  });

  it("unknown tokens pause the IP after 20 misses in 15 minutes", () => {
    expect(INVITE_MISS_LIMIT).toMatchObject({ limit: 20, windowMs: 900_000 });
    const now = 1_000_000_000;
    expect(minutesUntilFree(now - 60_000, INVITE_MISS_LIMIT, now)).toBe(14);
    expect(minutesUntilFree(undefined, INVITE_MISS_LIMIT, now)).toBe(1);
    expect(minutesUntilFree(now - 900_000, INVITE_MISS_LIMIT, now)).toBe(1);
  });
});
