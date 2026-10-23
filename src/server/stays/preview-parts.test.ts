import { describe, expect, it } from "vitest";
import { decodeHtml, parsePageMeta } from "./html-meta";
import { sniffImageType } from "./image-type";
import {
  PREVIEW_TOKEN_TTL_MS,
  previewTokenKey,
  signPreviewToken,
  verifyPreviewToken,
} from "./preview-token";

describe("parsePageMeta (R.7 I9-03)", () => {
  const page = "https://www.booking.com/hotel/hr/villa.html";
  it("prefers Open Graph, decodes entities, resolves the image relatively", () => {
    const meta = parsePageMeta(
      `<!doctype html><html><head><title>Fallback</title>
       <meta property="og:title" content="Villa Mare &amp; Pool &#8211; Split">
       <meta property="og:site_name" content="Booking.com">
       <meta property="og:image" content="/images/villa.jpg">
       </head><body><meta property="og:title" content="ignored"></body></html>`,
      page,
    );
    expect(meta).toEqual({
      title: "Villa Mare & Pool – Split",
      siteName: "Booking.com",
      imageUrl: "https://www.booking.com/images/villa.jpg",
    });
  });
  it("falls back to twitter:title and <title>; cleans and cuts", () => {
    expect(parsePageMeta("<title>  Haus\u0007 am See  </title>", page).title).toBe("Haus am See");
    expect(
      parsePageMeta(`<meta name="twitter:title" content="Tw"><title>T</title>`, page).title,
    ).toBe("Tw");
    expect(parsePageMeta(`<title>${"a".repeat(200)}</title>`, page).title).toHaveLength(80);
  });
  it("never takes a non-https or internal image URL", () => {
    for (const image of [
      "http://cdn.example.com/a.jpg",
      "https://127.0.0.1/a.jpg",
      "javascript:alert(1)",
      "data:image/png;base64,AAAA",
      "https://localhost/a.jpg",
    ]) {
      expect(parsePageMeta(`<meta property="og:image" content="${image}">`, page).imageUrl).toBe(
        null,
      );
    }
  });
  it("stops at </head> and never runs scripts", () => {
    const meta = parsePageMeta(
      `<head><script>throw new Error("x")</script></head><title>Body title</title>`,
      page,
    );
    expect(meta.title).toBeNull();
  });
  it("decodes the declared charset", () => {
    expect(decodeHtml(Buffer.from([0x4b, 0xfc, 0x73, 0x74, 0x65]), "iso-8859-1")).toBe("Küste");
    expect(decodeHtml(Buffer.from("Küste"), "nonsense-charset")).toBe("Küste");
  });
});

describe("sniffImageType (magic bytes, R.7 I9-04)", () => {
  const pad = (bytes: number[]) => Uint8Array.from([...bytes, ...Array<number>(16).fill(0)]);
  const ascii = (text: string) => Array.from({ length: text.length }, (_, i) => text.charCodeAt(i));
  it.each([
    [[0xff, 0xd8, 0xff, 0xe0], "image/jpeg"],
    [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], "image/png"],
    [ascii("GIF89a"), "image/gif"],
    [[...ascii("RIFF"), 0, 0, 0, 0, ...ascii("WEBP")], "image/webp"],
    [[0, 0, 0, 0x1c, ...ascii("ftypavif")], "image/avif"],
  ])("%j → %s", (bytes, type) => {
    expect(sniffImageType(pad(bytes))).toBe(type);
  });
  it("rejects SVG, HTML and short data", () => {
    expect(sniffImageType(pad(ascii("<svg xmlns")))).toBeNull();
    expect(sniffImageType(pad(ascii("<!doctype html>")))).toBeNull();
    expect(sniffImageType(Uint8Array.from([0xff, 0xd8, 0xff]))).toBeNull();
  });
});

describe("preview token (R.7 I9-03, R-076 encrypted)", () => {
  const key = previewTokenKey("a-test-secret-with-enough-length-0123456789");
  const now = 1_800_000_000_000;
  const claims = {
    trip: "trip-1",
    url: "booking.com/hotel/x",
    image: "https://cdn.example.com/a.jpg",
    site: "Booking.com",
    exp: now + PREVIEW_TOKEN_TTL_MS,
  };
  const flip = (token: string, index: number) => {
    const raw = Buffer.from(token, "base64url");
    raw[index] = (raw[index] ?? 0) ^ 0x01;
    return raw.toString("base64url");
  };

  it("round-trips and binds the token to its trip", () => {
    const back = verifyPreviewToken(key, signPreviewToken(key, claims), now);
    expect(back).toEqual(claims);
    // Callers compare the trip (actions.ts) or check membership of it (image route).
    expect(back?.trip).toBe("trip-1");
    const other = verifyPreviewToken(
      key,
      signPreviewToken(key, { ...claims, trip: "trip-2" }),
      now,
    );
    expect(other?.trip).toBe("trip-2");
  });

  it("reveals neither link, image URL nor site name (access logs, R.7 I9-10)", () => {
    const token = signPreviewToken(key, claims);
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    const decoded = Buffer.from(token, "base64url").toString("latin1");
    for (const secret of ["booking.com", "cdn.example.com", "Booking.com", "trip-1", "exp"]) {
      expect(token).not.toContain(secret);
      expect(decoded).not.toContain(secret);
    }
  });

  it("uses a fresh IV per token", () => {
    expect(signPreviewToken(key, claims)).not.toBe(signPreviewToken(key, claims));
  });

  it("rejects manipulation (IV, ciphertext, tag, truncation)", () => {
    const token = signPreviewToken(key, claims);
    const length = Buffer.from(token, "base64url").length;
    expect(verifyPreviewToken(key, flip(token, 0), now)).toBeNull();
    expect(verifyPreviewToken(key, flip(token, 14), now)).toBeNull();
    expect(verifyPreviewToken(key, flip(token, length - 1), now)).toBeNull();
    expect(verifyPreviewToken(key, token.slice(0, -4), now)).toBeNull();
    expect(verifyPreviewToken(key, `${token}.x`, now)).toBeNull();
  });

  it("rejects old signed (plain) tokens, other keys, expiry and garbage", () => {
    const token = signPreviewToken(key, claims);
    const plain = Buffer.from(JSON.stringify(claims)).toString("base64url");
    expect(verifyPreviewToken(key, plain, now)).toBeNull();
    expect(
      verifyPreviewToken(previewTokenKey("other-secret-0123456789012345678901"), token, now),
    ).toBeNull();
    expect(verifyPreviewToken(key, token, now + PREVIEW_TOKEN_TTL_MS + 1)).toBeNull();
    expect(verifyPreviewToken(key, "", now)).toBeNull();
    expect(verifyPreviewToken(key, "abc", now)).toBeNull();
    expect(verifyPreviewToken(key, 42, now)).toBeNull();
    const tooLong = signPreviewToken(key, { ...claims, exp: now + 2 * PREVIEW_TOKEN_TTL_MS });
    expect(verifyPreviewToken(key, tooLong, now)).toBeNull();
  });
});
