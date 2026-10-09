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

/** Favicons, app icon and the per-language manifest (short_name = full name, CEO U-16). */
export function brandMetadata(locale: Locale): Pick<Metadata, "icons" | "manifest"> {
  return {
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

export const brandViewport: Viewport = {
  themeColor: "#2B2266",
  colorScheme: "light dark",
};
