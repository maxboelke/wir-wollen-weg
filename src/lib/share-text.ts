import type { Locale } from "@/i18n/config";
import type { Country } from "./region";

/**
 * Date format of a share text follows the TEXT language (ux-spec §9): German → the sender's
 * German-speaking region or de-DE; English → en-GB unless the sender uses en-US.
 */
export function shareTextIntl(textLocale: Locale, senderCountry: Country): string {
  if (textLocale === "de") {
    return senderCountry === "AT" || senderCountry === "CH" ? `de-${senderCountry}` : "de-DE";
  }
  return senderCountry === "US" ? "en-US" : "en-GB";
}
