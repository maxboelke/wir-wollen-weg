import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ICON_NAMES } from "../src/components/ui/icon-names";
import {
  buildIconSprite,
  buildIllustration,
  buildIllustrations,
  iconIds,
  readAsset,
  UID_TOKEN,
} from "./design-assets";

const root = join(import.meta.dirname, "..");
const read = (...path: string[]) => readFileSync(join(root, ...path), "utf8");

describe("design assets are in sync with docs/design/assets", () => {
  it("public/icons.svg matches the designer's sprite", () => {
    expect(read("public", "icons.svg")).toBe(buildIconSprite(readAsset("icons", "icons.svg")));
  });

  it("every IconName exists in the sprite and vice versa", () => {
    const ids = iconIds(read("public", "icons.svg"));
    expect([...ICON_NAMES].sort()).toEqual([...ids].sort());
  });

  it("illustrations.json matches the designer's illustrations", () => {
    const committed = JSON.parse(
      read("src", "components", "illustrations", "illustrations.json"),
    ) as unknown;
    expect(committed).toEqual(buildIllustrations());
  });

  it("favicon and app icons exist", () => {
    expect(read("public", "favicon.svg")).toBe(readAsset("logo", "favicon.svg"));
    for (const file of ["favicon.ico", "icon-192.png", "icon-512.png", "apple-touch-icon.png"]) {
      expect(existsSync(join(root, "public", file)), file).toBe(true);
    }
  });

  it("ships the OFL licence next to the self-hosted fonts", () => {
    expect(read("public", "fonts", "OFL-Figtree.txt")).toContain("SIL Open Font License");
    expect(read("public", "fonts", "OFL-PlusJakartaSans.txt")).toContain("SIL Open Font License");
  });
});

describe("buildIllustration", () => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 20" aria-hidden="true">
    <title>Titel</title><desc>Beschreibung</desc><!-- note -->
    <defs><clipPath id="wwx-clip"><rect width="1" height="1"/></clipPath></defs>
    <g data-anim="sun" clip-path="url(#wwx-clip)"><use href="#wwx-clip"/></g>
  </svg>`;
  const result = buildIllustration(svg);

  it("keeps data-anim layers and drops title, desc and comments", () => {
    expect(result.markup).toContain('data-anim="sun"');
    expect(result.markup).not.toMatch(/Titel|Beschreibung|note/);
  });

  it("prefixes ids and their references with the instance placeholder", () => {
    expect(result.markup).toContain(`id="${UID_TOKEN}wwx-clip"`);
    expect(result.markup).toContain(`url(#${UID_TOKEN}wwx-clip)`);
    expect(result.markup).toContain(`href="#${UID_TOKEN}wwx-clip"`);
  });

  it("falls back to the viewBox size", () => {
    expect([result.width, result.height]).toEqual([10, 20]);
  });
});
