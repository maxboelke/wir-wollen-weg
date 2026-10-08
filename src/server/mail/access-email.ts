import { createTranslator } from "next-intl";
import type { Locale } from "@/i18n/config";
import de from "../../../messages/de.json";
import en from "../../../messages/en.json";

export interface AccessEmailInput {
  locale: Locale;
  /** 6-digit one-time code (never logged). */
  code: string;
  /** Absolute magic-link URL. */
  magicLinkUrl: string;
  /** Trip name when the request comes from an invite (/i/<token>). */
  tripName?: string | undefined;
}

export interface RenderedEmail {
  subject: string;
  text: string;
  html: string;
}

const catalogs = { de, en } as const;

/**
 * Renders the single sign-in mail containing code AND magic link
 * (tech-stack.md §3.2, ux-spec.md §10.5). Plain string template for the spike;
 * Increment 1 moves this to a React Email template.
 */
export function renderAccessEmail({
  locale,
  code,
  magicLinkUrl,
  tripName,
}: AccessEmailInput): RenderedEmail {
  const t = createTranslator({ locale, messages: catalogs[locale], namespace: "mail" });

  const subject = t("subject", { code });
  const tripLine = tripName ? t("tripLine", { trip: tripName }) : undefined;

  const text = [
    ...(tripLine ? [tripLine, ""] : []),
    t("codeIntro"),
    code,
    "",
    t("linkIntro"),
    magicLinkUrl,
    "",
    t("validity"),
  ].join("\n");

  const html = `<!doctype html>
<html lang="${locale}">
<body style="font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;line-height:1.5">
${tripLine ? `<p>${escapeHtml(tripLine)}</p>` : ""}
<p>${escapeHtml(t("codeIntro"))}</p>
<p style="font-size:32px;font-weight:700;letter-spacing:4px;font-variant-numeric:tabular-nums">${escapeHtml(code)}</p>
<p>${escapeHtml(t("linkIntro"))} <a href="${escapeHtml(magicLinkUrl)}">${escapeHtml(t("linkText"))}</a></p>
<p style="color:#555">${escapeHtml(t("validity"))}</p>
</body>
</html>`;

  return { subject, text, html };
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
