import { describe, expect, it } from "vitest";
import { demoInboxHref, normalizeInboxFilter } from "./demo-inbox";

describe("demo inbox helpers", () => {
  it("normalises the address filter", () => {
    expect(normalizeInboxFilter(" Anna@Demo.Test ")).toBe("anna@demo.test");
    expect(normalizeInboxFilter(["b@demo.test", "c@demo.test"])).toBe("b@demo.test");
    expect(normalizeInboxFilter("")).toBeUndefined();
    expect(normalizeInboxFilter("anna")).toBeUndefined();
    expect(normalizeInboxFilter(undefined)).toBeUndefined();
    expect(normalizeInboxFilter(`${"a".repeat(250)}@x.de`)).toBeUndefined();
  });

  it("builds the link, filtered when an address is known", () => {
    expect(demoInboxHref()).toBe("/demo/postfach");
    expect(demoInboxHref("Anna+1@demo.test")).toBe("/demo/postfach?to=anna%2B1%40demo.test");
  });
});
