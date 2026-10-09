import { describe, expect, it } from "vitest";
import { flashValue, parseFlash } from "./flash";

describe("flash cookie", () => {
  it("round-trips kind and detail (also URL-encoded once more by the cookie layer)", () => {
    const value = flashValue("trip-left", "Lissabon: 2027 · „Sommer“");
    expect(parseFlash(value)).toEqual({ kind: "trip-left", detail: "Lissabon: 2027 · „Sommer“" });
    expect(parseFlash(encodeURIComponent(value))).toEqual({
      kind: "trip-left",
      detail: "Lissabon: 2027 · „Sommer“",
    });
    expect(parseFlash("signed-out")).toEqual({ kind: "signed-out", detail: "" });
  });

  it("ignores unknown kinds and garbage", () => {
    expect(parseFlash("evil:x")).toBeNull();
    expect(parseFlash("%E0%A4%A")).toBeNull();
    expect(parseFlash(undefined)).toBeNull();
  });
});
