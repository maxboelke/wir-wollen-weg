/**
 * Copy to the clipboard with fallbacks (F-002, ux-spec §4.5). The async Clipboard API needs a
 * secure context (HTTPS or localhost) and may be blocked in in-app browsers; the demo runs
 * on http://<LAN-IP>. Order: Clipboard API → `execCommand("copy")` on a temporary textarea →
 * `false` (the caller then selects the visible text so people can copy by hand).
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== "undefined" && "clipboard" in navigator && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // permission denied / not focused – try the legacy path
  }
  return legacyCopy(text);
}

function legacyCopy(text: string): boolean {
  if (typeof document === "undefined") return false;
  const active = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  // Off-screen but selectable; 16 px so iOS does not zoom.
  area.style.cssText = "position:fixed;top:0;left:-9999px;font-size:16px;opacity:0";
  document.body.append(area);
  area.select();
  area.setSelectionRange(0, text.length);
  let ok = false;
  try {
    // Deprecated but still the only synchronous fallback outside secure contexts.
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- no other fallback without a secure context
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  area.remove();
  active?.focus({ preventScroll: true });
  return ok;
}

/** Web Share API usable? (Secure context, supported, and the text can be shared.) */
export function canShareText(text: string): boolean {
  if (typeof navigator === "undefined" || typeof navigator.share !== "function") return false;
  if (typeof navigator.canShare === "function") {
    try {
      return navigator.canShare({ text });
    } catch {
      return false;
    }
  }
  return true;
}

/** Direct links when Web Share is missing (ux-spec §4.5; Signal has no reliable share URL). */
export function directShareLinks(text: string, subject: string, link: string) {
  const encoded = encodeURIComponent(text);
  // Telegram needs the link as `url` – keep it out of the text so it does not appear twice.
  const withoutLink = text
    .replace(link, "")
    .replace(/[\s:]+$/, "")
    .trim();
  return {
    whatsapp: `https://wa.me/?text=${encoded}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(withoutLink)}`,
    email: `mailto:?subject=${encodeURIComponent(subject)}&body=${encoded}`,
  };
}
