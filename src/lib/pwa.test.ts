import { describe, expect, it } from "vitest";
import { detectPlatform, feedbackArea, feedbackDevice, internalLinkFromText } from "./pwa";

const IPHONE =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";
const IPAD_DESKTOP =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15";
const ANDROID =
  "Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36";

describe("detectPlatform (W23 B.1)", () => {
  it("recognises iPhone, iPadOS desktop UA with touch, Android and desktop", () => {
    expect(detectPlatform(IPHONE).platform).toBe("ios");
    expect(detectPlatform(IPAD_DESKTOP, 5).platform).toBe("ios");
    expect(detectPlatform(IPAD_DESKTOP, 0).platform).toBe("desktop");
    expect(detectPlatform(ANDROID).platform).toBe("android");
  });

  it("names known in-app browsers and flags Android web views", () => {
    expect(detectPlatform(`${IPHONE} Instagram 300.0`).inApp).toBe("Instagram");
    expect(detectPlatform(`${IPHONE} [FBAN/FBIOS;FBAV/400]`).inApp).toBe("Facebook");
    expect(detectPlatform(IPHONE).inApp).toBeNull();
    expect(detectPlatform(ANDROID.replace("Pixel 7)", "Pixel 7; wv)")).webview).toBe(true);
  });
});

describe("internalLinkFromText (W23 C.8)", () => {
  const origin = "https://app.wirwollenweg.de";
  const token = "AbCdEfGhIjKlMnOpQrStUv";

  it("finds the first own invite or trip link, also inside a chat message", () => {
    expect(internalLinkFromText(`${origin}/i/${token}`, origin)).toBe(`/i/${token}`);
    expect(internalLinkFromText(`Hey! Mach mit: ${origin}/i/${token}. Bis dann`, origin)).toBe(
      `/i/${token}`,
    );
    expect(internalLinkFromText(`${origin}/trips/01ab/poll`, origin)).toBe("/trips/01ab/poll");
  });

  it("rejects other origins, other paths and junk", () => {
    expect(internalLinkFromText(`https://evil.example/i/${token}`, origin)).toBeNull();
    expect(internalLinkFromText(`${origin}/account`, origin)).toBeNull();
    expect(internalLinkFromText(`${origin}/i/kurz`, origin)).toBeNull();
    expect(internalLinkFromText("kein Link", origin)).toBeNull();
    expect(internalLinkFromText(`http://app.wirwollenweg.de/i/${token}`, origin)).toBeNull();
  });
});

describe("feedback text parts (W23 D.2)", () => {
  it("area = view name without trip name and product", () => {
    expect(feedbackArea("Meine Tage · Sommer in Lissabon · Wir wollen weg", "Wir wollen weg")).toBe(
      "Meine Tage",
    );
    expect(feedbackArea("Wir wollen weg", "Wir wollen weg")).toBe("Wir wollen weg");
  });

  it("device without model or OS version", () => {
    expect(feedbackDevice(IPHONE)).toBe("iphone");
    expect(feedbackDevice(ANDROID)).toBe("android");
    expect(feedbackDevice("Mozilla/5.0 (X11; Linux x86_64)")).toBe("computer");
  });
});
