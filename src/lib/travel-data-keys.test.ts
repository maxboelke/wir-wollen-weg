import { randomBytes } from "node:crypto";
import { describe, expect, it } from "vitest";
import { startupProblems, type StartupInput } from "./app-env";
import {
  keySource,
  parseKeyRing,
  travelDataEnabled,
  travelDataStartupProblems,
} from "./travel-data-keys";

const key = () => randomBytes(32).toString("base64");
const SECRET = "2GSch3KwWnrE+aK8SXEai5haWtcO7EpJiKm7162z8s4=";

describe("TRAVEL_DATA_KEYS format (deployment.md §0.11.2)", () => {
  it("accepts 1–3 entries, first = active, spaces trimmed", () => {
    const a = key();
    const b = key();
    const parsed = parseKeyRing(` t202701:${a} , t202606:${b} `);
    expect(parsed.ok && parsed.keys.map((k) => k.kid)).toEqual(["t202701", "t202606"]);
    expect(parsed.ok && parsed.warning).toBeNull();
  });

  it("warns (count only) with more than 3 entries", () => {
    const parsed = parseKeyRing([1, 2, 3, 4].map((n) => `k${String(n)}:${key()}`).join(","));
    expect(parsed.ok && parsed.warning).toMatch(/4 entries/);
  });

  it.each([
    ["no colon", `t202701${key()}`],
    ["empty id", `:${key()}`],
    ["bad id", `T2027:${key()}`],
    ["too long id", `${"a".repeat(17)}:${key()}`],
    ["reserved id demo", `demo:${key()}`],
    ["16 bytes", `t1:${randomBytes(16).toString("base64")}`],
    ["not base64", "t1:%%%%"],
    ["duplicate id", `t1:${key()},t1:${key()}`],
  ])("rejects %s without echoing the value", (_name, raw) => {
    const parsed = parseKeyRing(raw);
    expect(parsed.ok).toBe(false);
    if (!parsed.ok) expect(parsed.problem).not.toContain(raw.split(":")[1] ?? "§§");
  });

  it("rejects the same key under two ids", () => {
    const a = key();
    expect(parseKeyRing(`t1:${a},t2:${a}`).ok).toBe(false);
  });
});

describe("feature switch TRAVEL_DATA_ENABLED (§0.11.1)", () => {
  it("is on by default in development/ci/demo/preview and off in staging/production", () => {
    for (const appEnv of ["development", "ci", "demo", "preview"]) {
      expect(travelDataEnabled(appEnv, { BETTER_AUTH_SECRET: SECRET })).toBe(true);
    }
    for (const appEnv of ["staging", "production"]) {
      expect(travelDataEnabled(appEnv, { BETTER_AUTH_SECRET: SECRET })).toBe(false);
      expect(
        travelDataEnabled(appEnv, { TRAVEL_DATA_KEYS: `t1:${key()}`, BETTER_AUTH_SECRET: SECRET }),
      ).toBe(false);
    }
  });

  it("explicit false switches it off everywhere; a typo is off (and refused at start)", () => {
    expect(
      travelDataEnabled("development", { TRAVEL_DATA_ENABLED: "false", BETTER_AUTH_SECRET: SECRET }),
    ).toBe(false);
    expect(
      travelDataEnabled("development", { TRAVEL_DATA_ENABLED: "ture", BETTER_AUTH_SECRET: SECRET }),
    ).toBe(false);
  });

  it("fails closed without any key", () => {
    expect(travelDataEnabled("development", {})).toBe(false);
    expect(keySource("preview", {}).kind).toBe("none");
  });

  it("production on with its own key", () => {
    expect(
      travelDataEnabled("production", { TRAVEL_DATA_ENABLED: "true", TRAVEL_DATA_KEYS: `t1:${key()}` }),
    ).toBe(true);
    expect(keySource("production", { BETTER_AUTH_SECRET: SECRET }).kind).toBe("none");
  });
});

/** One test per row of the start guard table, deployment.md §0.11.3. */
describe("start guard (deployment.md §0.11.3)", () => {
  const base: StartupInput = {
    appEnv: "development",
    authUrl: "http://localhost:3000",
    previewPassword: undefined,
    mailTransport: "smtp",
    onVercel: false,
    placeholders: [],
  };
  const prod: StartupInput = { ...base, appEnv: "production", authUrl: "https://example.org" };

  it("row 1: invalid TRAVEL_DATA_ENABLED is refused in every mode", () => {
    for (const appEnv of ["development", "demo", "preview", "staging", "production"]) {
      expect(travelDataStartupProblems(appEnv, { TRAVEL_DATA_ENABLED: "yes" })).toHaveLength(1);
    }
  });

  it("row 2: a set but broken TRAVEL_DATA_KEYS is refused in every mode (no fallback)", () => {
    for (const appEnv of ["development", "ci", "demo", "preview", "production"]) {
      const problems = travelDataStartupProblems(appEnv, {
        TRAVEL_DATA_KEYS: "demo:abc",
        BETTER_AUTH_SECRET: SECRET,
      });
      expect(problems.length).toBeGreaterThan(0);
      expect(problems.join(" ")).not.toContain("abc");
    }
  });

  it("row 3: staging/production with the area on and no own key are refused", () => {
    for (const appEnv of ["staging", "production"]) {
      const problems = travelDataStartupProblems(appEnv, {
        TRAVEL_DATA_ENABLED: "true",
        BETTER_AUTH_SECRET: SECRET,
      });
      expect(problems).toHaveLength(1);
      expect(problems[0]).toContain("TRAVEL_DATA_KEYS");
      expect(problems[0]).not.toContain(SECRET);
    }
    expect(
      startupProblems({ ...prod, env: { TRAVEL_DATA_ENABLED: "true", BETTER_AUTH_SECRET: SECRET } }),
    ).toHaveLength(1);
  });

  it("row 4: staging/production with the area off and no key start fine", () => {
    expect(travelDataStartupProblems("production", { BETTER_AUTH_SECRET: SECRET })).toEqual([]);
    expect(
      travelDataStartupProblems("staging", { TRAVEL_DATA_ENABLED: "false", BETTER_AUTH_SECRET: SECRET }),
    ).toEqual([]);
    expect(startupProblems({ ...prod, env: { BETTER_AUTH_SECRET: SECRET } })).toEqual([]);
  });

  it("row 5: demo-like modes without TRAVEL_DATA_KEYS derive the key and start fine", () => {
    for (const appEnv of ["development", "ci", "demo", "preview"]) {
      expect(travelDataStartupProblems(appEnv, { BETTER_AUTH_SECRET: SECRET })).toEqual([]);
      expect(keySource(appEnv, { BETTER_AUTH_SECRET: SECRET }).kind).toBe("derived");
    }
  });

  it("row 6: demo-like modes without any secret start with the area off", () => {
    expect(travelDataStartupProblems("development", {})).toEqual([]);
    expect(travelDataEnabled("development", {})).toBe(false);
  });

  it("row 7: a key equal to BETTER_AUTH_SECRET (or its base64) is refused in staging/production", () => {
    const ascii = "a".repeat(32);
    const asBase64 = Buffer.from(ascii, "utf8").toString("base64");
    expect(
      travelDataStartupProblems("production", {
        TRAVEL_DATA_ENABLED: "true",
        TRAVEL_DATA_KEYS: `t1:${asBase64}`,
        BETTER_AUTH_SECRET: ascii,
      }),
    ).toHaveLength(1);
    expect(
      travelDataStartupProblems("staging", {
        TRAVEL_DATA_ENABLED: "true",
        TRAVEL_DATA_KEYS: `t1:${SECRET}`,
        BETTER_AUTH_SECRET: SECRET,
      }),
    ).toHaveLength(1);
    expect(
      travelDataStartupProblems("production", {
        TRAVEL_DATA_ENABLED: "true",
        TRAVEL_DATA_KEYS: `t1:${key()}`,
        BETTER_AUTH_SECRET: SECRET,
      }),
    ).toEqual([]);
  });
});
