import { describe, expect, it } from "vitest";
import { AVATAR_TONES, avatarTone, initials } from "./avatar";

describe("avatarTone", () => {
  it("is stable and within 1…8", () => {
    const ids = Array.from({ length: 200 }, (_, i) => `member-${i}`);
    for (const id of ids) {
      const tone = avatarTone(id);
      expect(tone).toBe(avatarTone(id));
      expect(tone).toBeGreaterThanOrEqual(1);
      expect(tone).toBeLessThanOrEqual(AVATAR_TONES);
    }
    // all tones are used
    expect(new Set(ids.map(avatarTone)).size).toBe(AVATAR_TONES);
  });
});

describe("initials", () => {
  it.each([
    ["Lena", "LE"],
    ["Anna Schmidt", "AS"],
    ["  kemal  ", "KE"],
    ["Łukasz Nowak", "ŁN"],
    ["", "?"],
  ])("%s → %s", (name, expected) => {
    expect(initials(name)).toBe(expected);
  });
});
