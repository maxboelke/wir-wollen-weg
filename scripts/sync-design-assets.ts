// Copies/converts the designer's assets into the app (run after the designer changed them):
//   node scripts/sync-design-assets.ts            icon sprite, favicon.svg, illustrations
//   node scripts/sync-design-assets.ts --raster   + favicon.ico, PNG app icons (needs Chromium,
//                                                  E2E_CHROMIUM_PATH or Playwright's browser)
// scripts/design-assets.test.ts fails when the committed output drifts from docs/design/assets.
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildIconSprite, buildIllustrations, readAsset } from "./design-assets.ts";

const root = join(import.meta.dirname, "..");
const publicDir = join(root, "public");

writeFileSync(join(publicDir, "icons.svg"), buildIconSprite(readAsset("icons", "icons.svg")));
writeFileSync(join(publicDir, "favicon.svg"), readAsset("logo", "favicon.svg"));

const illustrationsFile = join(root, "src", "components", "illustrations", "illustrations.json");
mkdirSync(join(root, "src", "components", "illustrations"), { recursive: true });
writeFileSync(illustrationsFile, JSON.stringify(buildIllustrations(), null, 2));
execFileSync("pnpm", ["exec", "prettier", "--write", illustrationsFile], { stdio: "inherit" });

if (process.argv.includes("--raster")) {
  const { chromium } = await import("@playwright/test");
  const executablePath = process.env.E2E_CHROMIUM_PATH;
  const browser = await chromium.launch(executablePath ? { executablePath } : {});
  const page = await browser.newPage({ colorScheme: "light" });

  async function rasterize(svg: string, size: number): Promise<Buffer> {
    await page.setViewportSize({ width: size, height: size });
    const sized = svg.replace(/<svg([^>]*?)\swidth="\d+"\sheight="\d+"/, "<svg$1");
    await page.setContent(
      `<html><body style="margin:0;background:transparent">${sized.replace(
        "<svg ",
        `<svg width="${size}" height="${size}" `,
      )}</body></html>`,
    );
    return page.screenshot({
      omitBackground: true,
      clip: { x: 0, y: 0, width: size, height: size },
    });
  }

  const favicon16 = await rasterize(readAsset("logo", "favicon-16.svg"), 16);
  const favicon32 = await rasterize(readAsset("logo", "favicon.svg"), 32);
  writeFileSync(join(publicDir, "favicon.ico"), buildIco([favicon16, favicon32], [16, 32]));
  const appIcon = readAsset("logo", "app-icon.svg");
  writeFileSync(join(publicDir, "icon-192.png"), await rasterize(appIcon, 192));
  writeFileSync(join(publicDir, "icon-512.png"), await rasterize(appIcon, 512));
  writeFileSync(join(publicDir, "apple-touch-icon.png"), await rasterize(appIcon, 180));
  await browser.close();
}

/** ICO container with embedded PNGs (supported by all current browsers). */
function buildIco(images: Buffer[], sizes: number[]): Buffer {
  const header = Buffer.alloc(6 + 16 * images.length);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach((image, i) => {
    const entry = 6 + 16 * i;
    const size = sizes[i] ?? 0;
    header.writeUInt8(size >= 256 ? 0 : size, entry);
    header.writeUInt8(size >= 256 ? 0 : size, entry + 1);
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(image.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += image.length;
  });
  return Buffer.concat([header, ...images]);
}

console.log("[assets] icons.svg, favicon.svg and illustrations.json updated");
