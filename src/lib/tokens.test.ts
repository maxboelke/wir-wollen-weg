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

describe("public trip ids and token shapes", () => {
  it("public ids: 10 characters without look-alikes", async () => {
    const { generatePublicId, isPublicIdShape } = await import("./tokens");
    const ids = Array.from({ length: 200 }, generatePublicId);
    for (const id of ids) {
      expect(id).toMatch(/^[23456789abcdefghijkmnpqrstuvwxyz]{10}$/);
      expect(isPublicIdShape(id)).toBe(true);
    }
    expect(new Set(ids).size).toBe(200);
    expect(isPublicIdShape("0000000000")).toBe(false);
    expect(isPublicIdShape("../../etc")).toBe(false);
  });

  it("invite tokens: shape check before any lookup (≥ 128 bit)", async () => {
    const { isInviteTokenShape } = await import("./tokens");
    expect(isInviteTokenShape(generateInviteToken())).toBe(true);
    expect(isInviteTokenShape("short")).toBe(false);
    expect(isInviteTokenShape("a".repeat(21))).toBe(false);
    expect(isInviteTokenShape("a".repeat(22))).toBe(true);
    expect(isInviteTokenShape("abc/def+ghi=jklmnopqrstu")).toBe(false);
  });
});
