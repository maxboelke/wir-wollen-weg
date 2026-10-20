import { describe, expect, it } from "vitest";
import { basicAuthMatches, basicAuthPassword, isOpenPath, secretsEqual } from "./basic-auth";

const header = (user: string, password: string) =>
  `Basic ${Buffer.from(`${user}:${password}`, "utf8").toString("base64")}`;

describe("basicAuthPassword", () => {
  it("reads the password, any user name, colons inside the password", () => {
    expect(basicAuthPassword(header("demo", "geheim-123"))).toBe("geheim-123");
    expect(basicAuthPassword(header("", "geheim-123"))).toBe("geheim-123");
    expect(basicAuthPassword(header("anna", "a:b:c"))).toBe("a:b:c");
    expect(basicAuthPassword(header("demo", "Bärenhöhle"))).toBe("Bärenhöhle");
  });

  it("rejects missing, other schemes and malformed values", () => {
    expect(basicAuthPassword(null)).toBeUndefined();
    expect(basicAuthPassword("Bearer abc")).toBeUndefined();
    expect(basicAuthPassword("Basic !!!")).toBeUndefined();
    expect(
      basicAuthPassword(`Basic ${Buffer.from("no-colon").toString("base64")}`),
    ).toBeUndefined();
    // invalid UTF-8
    expect(basicAuthPassword(`Basic ${Buffer.from([0x61, 0x3a, 0xff]).toString("base64")}`)).toBe(
      undefined,
    );
  });
});

describe("basicAuthMatches", () => {
  it("accepts the right password only", async () => {
    expect(await basicAuthMatches(header("demo", "geheim-123"), "geheim-123")).toBe(true);
    expect(await basicAuthMatches(header("x", "geheim-123"), "geheim-123")).toBe(true);
    expect(await basicAuthMatches(header("demo", "geheim-12"), "geheim-123")).toBe(false);
    expect(await basicAuthMatches(header("demo", "geheim-1234"), "geheim-123")).toBe(false);
    expect(await basicAuthMatches(header("demo", ""), "geheim-123")).toBe(false);
    expect(await basicAuthMatches(null, "geheim-123")).toBe(false);
  });

  it("an empty expected password never matches a missing header", async () => {
    expect(await basicAuthMatches(null, "")).toBe(false);
  });
});

describe("secretsEqual", () => {
  it("compares by value (different lengths are fine)", async () => {
    expect(await secretsEqual("abc", "abc")).toBe(true);
    expect(await secretsEqual("abc", "abd")).toBe(false);
    expect(await secretsEqual("abc", "abcd")).toBe(false);
  });
});

describe("isOpenPath", () => {
  it("leaves health, retention job, robots and manifests open – nothing else", () => {
    for (const path of [
      "/api/health",
      "/api/internal/retention",
      "/robots.txt",
      "/manifest-de.webmanifest",
      "/manifest-en.webmanifest",
    ]) {
      expect(isOpenPath(path)).toBe(true);
    }
    for (const path of [
      "/",
      "/de",
      "/login",
      "/demo/postfach",
      "/api/auth/get-session",
      "/api/health/x",
      "/api/internal/retention/",
      "/i/abc",
    ]) {
      expect(isOpenPath(path)).toBe(false);
    }
  });
});
