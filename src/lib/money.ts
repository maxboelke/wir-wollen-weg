/**
 * The ONE money formatter of the app (W19 E.0 #7, Increment 11a). Amounts follow the APP
 * language – «630,00 €» / «1.200,00 €» in German, «€630.00» / «€1,200.00» in English – and never
 * the account or browser region: `de-CH` would print «EUR 630.00» and «1'200.00», `de-AT`
 * «€ 630,00». Dates keep the region (ux-spec §9); money does not.
 *
 * Every cost/price render path (cost pages, cockpit, mails, reminders, share texts, stays,
 * account deletion, leave dialogs) goes through these functions – directly or via the
 * re-exports `formatExact` (src/lib/costs.ts) and `formatMoney` (src/lib/stays.ts).
 */

export type MoneyLocale = "de-DE" | "en-GB";

/**
 * Formatting locale for money from a UI language or a BCP 47 tag («de», «de-CH», «en-US» …):
 * German → de-DE, everything else → en-GB.
 */
export function moneyLocale(localeOrTag: string): MoneyLocale {
  return localeOrTag.toLowerCase().startsWith("de") ? "de-DE" : "en-GB";
}

const cache = new Map<string, Intl.NumberFormat>();

function formatter(locale: MoneyLocale, currency: string, decimals: 0 | 2): Intl.NumberFormat {
  const key = `${locale}|${currency}|${String(decimals)}`;
  let format = cache.get(key);
  if (!format) {
    format = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    cache.set(key, format);
  }
  return format;
}

/** Exact amount, always two decimals («86,00 €» / «€86.00») – costs, balances, transfers. */
export function formatMoneyExact(cents: number, currency: string, localeOrTag: string): string {
  return formatter(moneyLocale(localeOrTag), currency, 2).format(cents / 100);
}

/** Price: decimals only when there are cents («2.050 €» / «1.840,50 €» / «£2,050»). */
export function formatMoneyShort(cents: number, currency: string, localeOrTag: string): string {
  return formatter(moneyLocale(localeOrTag), currency, cents % 100 === 0 ? 0 : 2).format(
    cents / 100,
  );
}

/** Currency sign and its position in the app language («€» after the number in German). */
export function currencySymbol(
  currency: string,
  localeOrTag: string,
): { symbol: string; before: boolean } {
  const parts = formatter(moneyLocale(localeOrTag), currency, 2).formatToParts(1);
  const index = parts.findIndex((p) => p.type === "currency");
  const integer = parts.findIndex((p) => p.type === "integer");
  return { symbol: parts[index]?.value ?? currency, before: index < integer };
}
