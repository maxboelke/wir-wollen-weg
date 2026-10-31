import type { Metadata, Viewport } from "next";
import { preload } from "react-dom";
import type { Locale } from "@/i18n/config";
import { MOTION_BOOTSTRAP_SCRIPT } from "@/lib/motion";

/** Latin subsets of both self-hosted fonts (design-system §5.1: preload both). */
const FONT_PRELOADS = ["/fonts/figtree-latin.woff2", "/fonts/plus-jakarta-sans-latin.woff2"];

/**
 * Shared `<head>` content of both root layouts: font preloads and the tiny inline script
 * that sets `data-motion="reduce"` before the first paint (F-052, no flash of motion).
 */
export function DocumentHead() {
  for (const href of FONT_PRELOADS) {
    preload(href, { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  }
  return <script dangerouslySetInnerHTML={{ __html: MOTION_BOOTSTRAP_SCRIPT }} />;
}

/** Product name per language (Q11) – the name under the Home Screen icon, never «Beta». */
const APP_TITLE: Record<Locale, string> = { de: "Wir wollen weg", en: "When do we go?" };

/**
 * Favicons, app icon and the per-language manifest (short_name = full name, CEO U-16), plus the
 * iOS web-app meta (W23 C.1/C.3): status bar `black-translucent` – content runs below the white
 * status-bar text, so every page has a dark brand band there (globals.css, standalone only).
 */
export function brandMetadata(
  locale: Locale,
): Pick<Metadata, "icons" | "manifest" | "appleWebApp"> {
  return {
    appleWebApp: { capable: true, title: APP_TITLE[locale], statusBarStyle: "black-translucent" },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "16x16 32x32" },
        { url: "/favicon.svg", type: "image/svg+xml" },
      ],
      apple: "/apple-touch-icon.png",
    },
    manifest: `/manifest-${locale}.webmanifest`,
  };
}

/**
 * Theme colour per scheme (W23 C.3): light = indigo-800 (brand), dark = indigo-900 (cockpit
 * background in dark mode, tokens.css – until the designer names D-75). `viewport-fit=cover`
 * so `env(safe-area-inset-*)` works on the iPhone (C.4); zoom stays allowed (ux-spec §2).
 */
export const brandViewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#2B2266" },
    { media: "(prefers-color-scheme: dark)", color: "#221B52" },
  ],
  colorScheme: "light dark",
  viewportFit: "cover",
};
