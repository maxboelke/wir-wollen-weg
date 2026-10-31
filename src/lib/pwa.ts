/**
 * PWA helpers (W23 B, C) – pure, testable without a browser: platform detection for the install
 * guide, the «paste invite link» parser and the feedback text.
 */

export type InstallPlatform = "ios" | "android" | "desktop";

/** Recognised in-app browsers that cannot install a web app (W23 B.1). */
const IN_APP_TOKENS: readonly { pattern: RegExp; name: string }[] = [
  { pattern: /Instagram/i, name: "Instagram" },
  { pattern: /FBAN|FBAV|FB_IAB/i, name: "Facebook" },
  { pattern: /LinkedInApp/i, name: "LinkedIn" },
  { pattern: /Snapchat/i, name: "Snapchat" },
  { pattern: /musical_ly|BytedanceWebview|TikTok/i, name: "TikTok" },
  { pattern: /Line\//, name: "LINE" },
];

export interface PlatformInfo {
  platform: InstallPlatform;
  /** Name of a recognised in-app browser (B.4), or null. */
  inApp: string | null;
  /** Generic Android webview (`; wv)`) – no name to show. */
  webview: boolean;
}

/**
 * Best-effort detection (never blocking, W23 B.1). iPadOS reports a desktop Safari UA – then a
 * touch screen decides (`maxTouchPoints`).
 */
export function detectPlatform(userAgent: string, maxTouchPoints = 0): PlatformInfo {
  const ios =
    /iPhone|iPad|iPod/i.test(userAgent) || (/Macintosh/i.test(userAgent) && maxTouchPoints > 1);
  const android = /Android/i.test(userAgent);
  const inApp = IN_APP_TOKENS.find((token) => token.pattern.test(userAgent))?.name ?? null;
  return {
    platform: ios ? "ios" : android ? "android" : "desktop",
    inApp,
    webview: android && /; wv\)/.test(userAgent),
  };
}

/**
 * «Einladungslink einfügen» (W23 C.8): finds the first URL of THIS origin in pasted text whose
 * path is `/i/<token>` or `/trips/<id>…` and returns the internal path – null otherwise.
 */
export function internalLinkFromText(text: string, origin: string): string | null {
  let expected: URL;
  try {
    expected = new URL(origin);
  } catch {
    return null;
  }
  for (const match of text.matchAll(/https?:\/\/[^\s<>"'„“”«»]+/gi)) {
    let url: URL;
    try {
      url = new URL(match[0].replace(/[.,;:!?)\]]+$/, ""));
    } catch {
      continue;
    }
    if (url.origin !== expected.origin) continue;
    if (/^\/i\/[A-Za-z0-9_-]{16,64}\/?$/.test(url.pathname)) return url.pathname.replace(/\/$/, "");
    if (/^\/trips\/[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_/-]*)?$/.test(url.pathname)) {
      return `${url.pathname}${url.search}`;
    }
  }
  return null;
}

/** Device label for the feedback text (no model, no OS version – W23 D.2). */
export function feedbackDevice(
  userAgent: string,
  maxTouchPoints = 0,
): "iphone" | "android" | "computer" {
  const { platform } = detectPlatform(userAgent, maxTouchPoints);
  return platform === "ios" ? "iphone" : platform === "android" ? "android" : "computer";
}

/**
 * Area of the current view for the feedback text: the page title without the trip name and
 * without the product suffix («Meine Tage · Sommer 2027 · Wir wollen weg» → «Meine Tage»).
 * Pages whose title STARTS with personal content get a fixed label instead: the invite page
 * `/i/<token>` is titled with the trip name, travel-details pages may start with a person's name.
 */
export function feedbackArea(
  title: string,
  product: string,
  pathname = "/",
  labels: { invite: string; travelData: string } = { invite: product, travelData: product },
): string {
  if (pathname.startsWith("/i/")) return labels.invite;
  if (/^\/trips\/[^/]+\/travel-data(?:\/|$)/.test(pathname)) return labels.travelData;
  const parts = title
    .split(" · ")
    .map((part) => part.trim())
    .filter((part) => part && part !== product);
  return parts[0] ?? product;
}

/** Build-time app version shown in the account and the feedback text (W23 D.1). */
export const APP_VERSION = "0.1";
