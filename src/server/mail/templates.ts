import { createTranslator } from "next-intl";
import type { Locale } from "@/i18n/config";
import de from "../../../messages/de.json";
import en from "../../../messages/en.json";

/**
 * Transactional mails (F-040–F-042, ux-spec §10.5) in the "Reise-Cockpit" look.
 *
 * Deliberately plain, robust HTML instead of React Email: tables + inline styles are what
 * every mail client (Outlook desktop, Gmail app, Apple Mail, webmail) renders the same; no
 * runtime/build dependency, no external images or fonts, no tracking (F-042). All texts
 * come from messages/*.json; every mail has a plain-text part with the code on its own
 * line (OS code detection, E2E helper).
 */
export interface RenderedEmail {
  subject: string;
  text: string;
  html: string;
}

const catalogs = { de, en } as const;

// Colours from docs/design/tokens.css (light theme; mails do not follow dark mode reliably).
const C = {
  bg: "#f4f2fb", // mist-50
  surface: "#ffffff",
  indigo: "#2b2266", // indigo-800
  mint: "#52e5b8", // mint-400 (only on indigo)
  lavender: "#ece6ff", // lavender-100
  lavenderText: "#cfc9f2", // lavender-250 on indigo
  text: "#1e1a3d", // ink-900
  muted: "#57527a", // ink-700
  border: "#d9d5f2", // ink-100
} as const;

const FONT = "'Plus Jakarta Sans','Figtree','Segoe UI',Roboto,Helvetica,Arial,sans-serif";

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function translator(locale: Locale) {
  return createTranslator({ locale, messages: catalogs[locale], namespace: "mail" });
}

type Block =
  | { kind: "text"; text: string; muted?: boolean }
  | { kind: "code"; code: string }
  | { kind: "button"; label: string; href: string; intro: string };

function renderBlock(block: Block): string {
  switch (block.kind) {
    case "text":
      return `<p style="margin:0 0 16px;font-size:16px;line-height:1.5;color:${block.muted ? C.muted : C.text}">${escapeHtml(block.text)}</p>`;
    case "code":
      return `<p style="margin:0 0 20px"><span style="display:inline-block;padding:12px 20px;border:2px solid ${C.indigo};border-radius:14px;background:${C.lavender};color:${C.indigo};font-family:${FONT};font-size:32px;font-weight:800;letter-spacing:6px;font-variant-numeric:tabular-nums">${escapeHtml(block.code)}</span></p>`;
    case "button":
      return `<p style="margin:0 0 8px;font-size:16px;line-height:1.5;color:${C.text}">${escapeHtml(block.intro)}</p>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px"><tr><td style="border-radius:16px;background:${C.indigo}"><a href="${escapeHtml(block.href)}" style="display:inline-block;padding:14px 24px;border-radius:16px;color:#ffffff;font-family:${FONT};font-size:16px;font-weight:700;text-decoration:none">${escapeHtml(block.label)}</a></td></tr></table>`;
  }
}

function blockText(block: Block): string[] {
  switch (block.kind) {
    case "text":
      return [block.text, ""];
    case "code":
      return [block.code, ""];
    case "button":
      return [block.intro, block.href, ""];
  }
}

interface Layout {
  locale: Locale;
  subject: string;
  /** Hidden preview line in the inbox list. */
  preheader: string;
  heading: string;
  blocks: Block[];
}

function render({ locale, subject, preheader, heading, blocks }: Layout): RenderedEmail {
  const t = translator(locale);
  const lead = t("wordmarkLead");
  const accent = t("wordmarkAccent");
  const signature = t("signature");
  const text = [heading, "", ...blocks.flatMap(blockText), signature].join("\n");

  const html = `<!doctype html>
<html lang="${locale}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:${C.bg};font-family:${FONT};color:${C.text}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.bg}">
<tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px">
<tr><td style="padding:20px 24px;border-radius:24px 24px 0 0;background:${C.indigo}">
<span style="font-family:${FONT};font-size:20px;font-weight:800;color:#ffffff">${escapeHtml(lead)}</span>${accent ? ` <span style="font-family:${FONT};font-size:20px;font-weight:800;color:${C.mint}">${escapeHtml(accent)}</span>` : ""}
</td></tr>
<tr><td style="padding:28px 24px 12px;border-radius:0 0 24px 24px;background:${C.surface}">
<h1 style="margin:0 0 16px;font-family:${FONT};font-size:24px;line-height:1.25;font-weight:800;color:${C.text}">${escapeHtml(heading)}</h1>
${blocks.map(renderBlock).join("\n")}
</td></tr>
<tr><td style="padding:16px 24px;font-size:13px;line-height:1.5;color:${C.muted}">${escapeHtml(signature)}</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
  return { subject, text, html };
}

export interface AccessEmailInput {
  locale: Locale;
  /** 6-digit one-time code (never logged). */
  code: string;
  /** Absolute magic-link URL (landing page, Flow H.5). */
  magicLinkUrl: string;
  /** Trip name when the request comes from an invite (/i/<token>). */
  tripName?: string | undefined;
}

/** Sign-in / sign-up: code AND magic link in ONE mail (tech-stack §3.2, ux-spec §10.5). */
export function renderAccessEmail({
  locale,
  code,
  magicLinkUrl,
  tripName,
}: AccessEmailInput): RenderedEmail {
  const t = translator(locale);
  return render({
    locale,
    subject: t("access.subject", { code }),
    preheader: t("access.validity"),
    heading: tripName ? t("access.tripLine", { trip: tripName }) : t("access.heading"),
    blocks: [
      { kind: "text", text: t("access.codeIntro") },
      { kind: "code", code },
      {
        kind: "button",
        intro: t("access.linkIntro"),
        label: t("access.linkText"),
        href: magicLinkUrl,
      },
      { kind: "text", text: t("access.validity"), muted: true },
    ],
  });
}

/** "Forgot password" (Flow H.3): code to set a new password. */
export function renderPasswordResetEmail({
  locale,
  code,
}: {
  locale: Locale;
  code: string;
}): RenderedEmail {
  const t = translator(locale);
  return render({
    locale,
    subject: t("reset.subject", { code }),
    preheader: t("reset.intro"),
    heading: t("reset.heading"),
    blocks: [
      { kind: "text", text: t("reset.intro") },
      { kind: "code", code },
      { kind: "text", text: t("reset.passwordless") },
      { kind: "text", text: t("validity"), muted: true },
    ],
  });
}

/** Re-authentication before sensitive account changes (Flow I.2 step 1). */
export function renderReauthEmail({
  locale,
  code,
}: {
  locale: Locale;
  code: string;
}): RenderedEmail {
  const t = translator(locale);
  return render({
    locale,
    subject: t("reauth.subject", { code }),
    preheader: t("reauth.intro"),
    heading: t("reauth.heading"),
    blocks: [
      { kind: "text", text: t("reauth.intro") },
      { kind: "code", code },
      { kind: "text", text: t("validity"), muted: true },
    ],
  });
}

/** Code to the NEW address when changing the e-mail (Flow I.2 step 3). */
export function renderChangeEmailEmail({
  locale,
  code,
  newEmail,
}: {
  locale: Locale;
  code: string;
  newEmail: string;
}): RenderedEmail {
  const t = translator(locale);
  return render({
    locale,
    subject: t("changeEmail.subject", { code }),
    preheader: t("changeEmail.intro", { email: newEmail }),
    heading: t("changeEmail.heading"),
    blocks: [
      { kind: "text", text: t("changeEmail.intro", { email: newEmail }) },
      { kind: "code", code },
      { kind: "text", text: t("validity"), muted: true },
    ],
  });
}

/** Masks an address for notices: "kemal@neu.de" → "k•••@neu.de". */
export function maskEmail(email: string): string {
  const [local = "", domain = ""] = email.split("@");
  return `${local.slice(0, 1)}•••@${domain}`;
}

/** Info to the OLD address after an e-mail change (F-042). */
export function renderEmailChangedEmail({
  locale,
  newEmail,
  contact,
}: {
  locale: Locale;
  newEmail: string;
  contact: string;
}): RenderedEmail {
  const t = translator(locale);
  return render({
    locale,
    subject: t("emailChanged.subject"),
    preheader: t("emailChanged.text", { email: maskEmail(newEmail) }),
    heading: t("emailChanged.heading"),
    blocks: [
      { kind: "text", text: t("emailChanged.text", { email: maskEmail(newEmail) }) },
      { kind: "text", text: t("emailChanged.notYou", { contact }) },
    ],
  });
}
