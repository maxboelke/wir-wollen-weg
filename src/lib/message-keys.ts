/** Nested message catalog as stored in messages/<locale>.json. */
export type MessageTree = { [key: string]: string | MessageTree };

/** Flattens a message catalog into dot-separated keys → values. */
export function flattenMessages(tree: MessageTree, prefix = ""): Map<string, string> {
  const result = new Map<string, string>();
  for (const [key, value] of Object.entries(tree)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") {
      result.set(path, value);
    } else {
      for (const [childKey, childValue] of flattenMessages(value, path)) {
        result.set(childKey, childValue);
      }
    }
  }
  return result;
}

export interface CatalogIssue {
  locale: string;
  key: string;
  problem: "missing" | "empty";
}

/**
 * Compares catalogs of all locales: every key must exist in every locale
 * and no value may be empty (tech-stack.md §2.4, `pnpm i18n:check`).
 */
export function compareCatalogs(catalogs: Record<string, MessageTree>): CatalogIssue[] {
  const flat = Object.entries(catalogs).map(
    ([locale, tree]) => [locale, flattenMessages(tree)] as const,
  );
  const allKeys = new Set(flat.flatMap(([, messages]) => [...messages.keys()]));
  const issues: CatalogIssue[] = [];

  for (const [locale, messages] of flat) {
    for (const key of [...allKeys].sort()) {
      const value = messages.get(key);
      if (value === undefined) issues.push({ locale, key, problem: "missing" });
      else if (value.trim() === "") issues.push({ locale, key, problem: "empty" });
    }
  }
  return issues;
}
