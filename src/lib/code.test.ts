import { describe, expect, it } from "vitest";
import { normalizeCode } from "./code";

describe("normalizeCode", () => {
  it.each([
    ["123456", "123456"],
    ["123 456", "123456"],
    ["123-456", "123456"],
    [" 12a3456789", "123456"],
    ["12", "12"],
  ])("normalises %j → %j", (input, expected) => {
    expect(normalizeCode(input)).toBe(expected);
  });
});
