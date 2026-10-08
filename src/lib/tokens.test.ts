import { describe, expect, it } from "vitest";
import { generateInviteToken } from "./tokens";

describe("generateInviteToken", () => {
  it("creates 256-bit base64url tokens", () => {
    const token = generateInviteToken();
    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(Buffer.from(token, "base64url")).toHaveLength(32);
  });

  it("is unique", () => {
    const tokens = new Set(Array.from({ length: 100 }, generateInviteToken));
    expect(tokens.size).toBe(100);
  });
});
