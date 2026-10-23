import { Parser } from "htmlparser2";
import { checkStayUrl, cleanLine, cutText, STAY_LIMITS } from "@/lib/stays";

/**
 * Open-Graph metadata of a fetched page (R.7 I9-03, deployment.md §0.8 Nr. 8): only `<title>`
 * and `<meta>` in the `<head>` – parsing stops at `</head>` or `<body>`; nothing is executed
 * or loaded. Entities are decoded by the parser, control characters removed, texts cut to the
 * field lengths. The image URL is resolved against the page URL and must pass the same link
 * rules (https, host name …) – it is checked again by the fetcher when the image is loaded.
 */

export interface PageMeta {
  title: string | null;
  siteName: string | null;
  imageUrl: string | null;
}

/** Decodes the body with the declared charset (UTF-8 if unknown/unsupported). */
export function decodeHtml(body: Buffer, charset: string | null): string {
  try {
    return new TextDecoder(charset ?? "utf-8").decode(body);
  } catch {
    return new TextDecoder("utf-8").decode(body);
  }
}

export function parsePageMeta(html: string, pageUrl: string): PageMeta {
  const meta = new Map<string, string>();
  let title = "";
  let inTitle = false;
  const state = { done: false };
  const parser = new Parser(
    {
      onopentag(name, attributes) {
        if (state.done) return;
        if (name === "body") {
          state.done = true;
          return;
        }
        if (name === "title") inTitle = true;
        if (name === "meta") {
          const key = (attributes.property ?? attributes.name ?? "").trim().toLowerCase();
          const content = attributes.content;
          if (key && content !== undefined && !meta.has(key)) meta.set(key, content);
        }
      },
      ontext(text) {
        if (inTitle && !state.done) title += text;
      },
      onclosetag(name) {
        if (name === "title") inTitle = false;
        if (name === "head") state.done = true;
      },
    },
    { decodeEntities: true, lowerCaseTags: true, lowerCaseAttributeNames: true },
  );
  // Feed in slices so a huge head does not keep the parser busy after `</head>`.
  for (let i = 0; i < html.length && !state.done; i += 16_384)
    parser.write(html.slice(i, i + 16_384));
  parser.end();

  const text = (value: string | undefined, max: number) => {
    const cleaned = cleanLine(value);
    return cleaned ? cutText(cleaned, max) : null;
  };
  const imageRaw =
    meta.get("og:image:secure_url") ?? meta.get("og:image") ?? meta.get("twitter:image") ?? "";
  let imageUrl: string | null = null;
  if (imageRaw.trim()) {
    try {
      const resolved = new URL(imageRaw.trim(), pageUrl).href;
      const check = checkStayUrl(resolved);
      imageUrl = check.ok ? check.url : null;
    } catch {
      imageUrl = null;
    }
  }
  return {
    title:
      text(meta.get("og:title"), STAY_LIMITS.title) ??
      text(meta.get("twitter:title"), STAY_LIMITS.title) ??
      text(title, STAY_LIMITS.title),
    siteName: text(meta.get("og:site_name"), STAY_LIMITS.siteName),
    imageUrl,
  };
}
