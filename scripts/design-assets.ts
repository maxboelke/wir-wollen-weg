// Pure transformations from the designer's source assets (docs/design/assets) to the files
// the app ships. Used by scripts/sync-design-assets.ts and checked for drift by
// scripts/design-assets.test.ts – the docs folder stays the single source of truth.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { UID_TOKEN } from "../src/components/illustrations/uid-token.ts";

export { UID_TOKEN };

export const ASSET_DIR = join(import.meta.dirname, "..", "docs", "design", "assets");

export interface IllustrationSource {
  viewBox: string;
  width: number;
  height: number;
  preserveAspectRatio?: string;
  /** Inner markup without title/desc/comments; ids are prefixed with UID_TOKEN. */
  markup: string;
}

function stripComments(svg: string): string {
  return svg.replace(/<!--[\s\S]*?-->/g, "");
}

function collapseWhitespace(markup: string): string {
  return markup
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n");
}

/**
 * Icon sprite for `public/icons.svg`: same symbols, without comments, the root `<title>`
 * and the German `<title>` of each symbol (icons are always `aria-hidden` next to text,
 * and a German tooltip would show up in the English UI).
 */
export function buildIconSprite(source: string): string {
  const body = stripComments(source)
    .replace(/<title>[\s\S]*?<\/title>/g, "")
    .replace(/<svg[^>]*>/, '<svg xmlns="http://www.w3.org/2000/svg">');
  return `${collapseWhitespace(body)}\n`;
}

export function iconIds(sprite: string): string[] {
  return [...sprite.matchAll(/<symbol id="ww-icon-([a-z0-9-]+)"/g)].map((m) => m[1] ?? "");
}

/** Converts one illustration file into an inline-ready source (ids made instance-unique). */
export function buildIllustration(svg: string): IllustrationSource {
  const root = /<svg([^>]*)>/.exec(svg);
  if (!root?.[1]) throw new Error("illustration without <svg> root");
  const attr = (name: string) => new RegExp(`\\s${name}="([^"]+)"`).exec(root[1] ?? "")?.[1];
  const viewBox = attr("viewBox");
  if (!viewBox) throw new Error("illustration without viewBox");
  const [, , w, h] = viewBox.split(/\s+/).map(Number);

  let inner = svg.slice(root.index + root[0].length, svg.lastIndexOf("</svg>"));
  inner = stripComments(inner)
    .replace(/<title>[\s\S]*?<\/title>/g, "")
    .replace(/<desc>[\s\S]*?<\/desc>/g, "");

  const ids = [...inner.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1] ?? "");
  for (const id of ids) {
    inner = inner
      .replaceAll(`id="${id}"`, `id="${UID_TOKEN}${id}"`)
      .replaceAll(`url(#${id})`, `url(#${UID_TOKEN}${id})`)
      .replaceAll(`href="#${id}"`, `href="#${UID_TOKEN}${id}"`);
  }
  const preserveAspectRatio = attr("preserveAspectRatio");
  return {
    viewBox,
    width: Number(attr("width") ?? w),
    height: Number(attr("height") ?? h),
    ...(preserveAspectRatio ? { preserveAspectRatio } : {}),
    markup: collapseWhitespace(inner),
  };
}

export function buildIllustrations(dir = join(ASSET_DIR, "illustrations")) {
  const result: Record<string, IllustrationSource> = {};
  for (const file of readdirSync(dir)
    .filter((name) => name.endsWith(".svg"))
    .sort()) {
    result[file.replace(/\.svg$/, "")] = buildIllustration(readFileSync(join(dir, file), "utf8"));
  }
  return result;
}

export function readAsset(...path: string[]): string {
  return readFileSync(join(ASSET_DIR, ...path), "utf8");
}
