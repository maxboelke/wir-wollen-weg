// Verifies that all message catalogs have identical keys and no empty values.
// Runs with plain Node 24 (built-in TypeScript type stripping): `pnpm i18n:check`.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { compareCatalogs, type MessageTree } from "../src/lib/message-keys.ts";

const dir = join(import.meta.dirname, "..", "messages");
const catalogs: Record<string, MessageTree> = {};
for (const file of readdirSync(dir).filter((name) => name.endsWith(".json"))) {
  catalogs[file.replace(/\.json$/, "")] = JSON.parse(
    readFileSync(join(dir, file), "utf8"),
  ) as MessageTree;
}

const issues = compareCatalogs(catalogs);
if (issues.length > 0) {
  for (const { locale, key, problem } of issues) {
    console.error(`[i18n] ${locale}: ${problem} key "${key}"`);
  }
  process.exit(1);
}
console.log(`[i18n] OK – ${Object.keys(catalogs).join(", ")} have identical keys.`);
