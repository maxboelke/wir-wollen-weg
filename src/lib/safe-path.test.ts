import { describe, expect, it } from "vitest";
import { inviteTokenFromPath, toSafeInternalPath } from "./safe-path";

describe("toSafeInternalPath", () => {
  it.each(["/trips", "/i/abc?step=code", "/trips/x#days"])("keeps internal path %s", (path) => {
    expect(toSafeInternalPath(path)).toBe(path);
  });

  it.each([
    "https://evil.example/",
    "//evil.example",
    "/\\evil.example",
    "/..//evil.example",
    "/.//evil.example",
    "/%2e%2e//evil.example",
    "/a/..//evil.example/path",
    "javascript:alert(1)",
    "trips",
    "/\u0000x",
    "",
    null,
    undefined,
  ])("rejects %s", (path) => {
    expect(toSafeInternalPath(path, "/fallback")).toBe("/fallback");
  });
});

describe("inviteTokenFromPath", () => {
  const token = "A".repeat(43);
  it("extracts the token from /i/<token>", () => {
    expect(inviteTokenFromPath(`/i/${token}`)).toBe(token);
    expect(inviteTokenFromPath(`/i/${token}?step=code`)).toBe(token);
  });

  it("returns null for other paths", () => {
    expect(inviteTokenFromPath("/trips")).toBeNull();
    expect(inviteTokenFromPath("/i/short")).toBeNull();
  });
});
