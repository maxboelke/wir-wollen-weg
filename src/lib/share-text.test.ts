import { createTranslator } from "next-intl";
import { describe, expect, it } from "vitest";
import de from "../../messages/de.json" with { type: "json" };
import en from "../../messages/en.json" with { type: "json" };
import { directShareLinks } from "./clipboard";
import { shareTextIntl } from "./share-text";

const LINK = "https://example.org/i/abcdefghijklmnopqrstuvwxyz0123456789ABCDEFG";

describe("invite share texts (ux-spec §10.3, §10.6)", () => {
  const tDe = createTranslator({ locale: "de", messages: de, namespace: "share.text" });
  const tEn = createTranslator({ locale: "en", messages: en, namespace: "share.text" });

  it("carry the product name of the text language", () => {
    expect(tDe("inviteNoDeadline", { trip: "Lissabon 2027", link: LINK })).toBe(
      `Wir wollen weg: Lissabon 2027! Trag ein, wann du kannst – dauert 2 Minuten: ${LINK}`,
    );
    expect(tEn("invite", { trip: "Lisbon 2027", link: LINK, deadline: "Fri 14 May" })).toBe(
      `When do we go? Lisbon 2027 – add your dates by Fri 14 May, takes 2 minutes: ${LINK}`,
    );
  });

  it("never put punctuation right after «When do we go?»", () => {
    for (const text of Object.values(en.share.text)) {
      expect(text).not.toMatch(/When do we go\?[.!,:?]/);
    }
  });

  it("stay within 300 characters with an 80-character trip name", () => {
    const text = tDe("invite", { trip: "x".repeat(80), link: LINK, deadline: "Fr., 14. Mai" });
    expect(text.length).toBeLessThanOrEqual(300);
  });

  it("format dates in the text language (sender region where it fits)", () => {
    expect(shareTextIntl("de", "AT")).toBe("de-AT");
    expect(shareTextIntl("de", "US")).toBe("de-DE");
    expect(shareTextIntl("en", "US")).toBe("en-US");
    expect(shareTextIntl("en", "DE")).toBe("en-GB");
  });

  it("direct share links encode the text; Telegram gets the link separately", () => {
    const text = `Wir wollen weg: Lissabon 2027! Trag ein – ${LINK}`;
    const links = directShareLinks(text, "Einladung", LINK);
    expect(links.whatsapp).toBe(`https://wa.me/?text=${encodeURIComponent(text)}`);
    expect(new URL(links.telegram).searchParams.get("url")).toBe(LINK);
    expect(new URL(links.telegram).searchParams.get("text")).not.toContain(LINK);
    expect(links.email.startsWith("mailto:?subject=Einladung&body=")).toBe(true);
  });
});

describe("remind texts (ux-spec §14.1, §14.2)", () => {
  const catalogs = { de, en } as const;
  const TRIP = "Lissabon 2027";
  const values = {
    name: "Kemal",
    names: "Kemal, Sara und Jonas",
    orga: "Lena",
    trip: TRIP,
    link: LINK,
    deadline: "Fr., 14. Mai",
    // Places to stay (Increment 9, W16 v2.14): `stay-rate` / `stay-book`.
    count: 3,
    booker: "Lena",
    stay: "Kamena Kuća – Steinhaus",
    // Costs (Increment 10, W16 v2.15): `settle`, `settle-all`, `settleOther`.
    amount: "1.234,56 €",
    to: "Lena",
    // Travel details (Increment 11, W16 v2.16): `travelData`, `travelDataAll`, `travelDataJoin`.
    purpose: "Fähre Split – Hvar",
  };

  it("name the person, carry the link and stay ≤ 300 characters (typical trip name)", () => {
    for (const locale of ["de", "en"] as const) {
      const messages = catalogs[locale];
      const t = createTranslator({ locale, messages, namespace: "share.remind" });
      for (const key of Object.keys(messages.share.remind) as (keyof typeof en.share.remind)[]) {
        const text = t(key, values);
        expect(text).toContain(LINK);
        expect(text).not.toContain("@");
        expect(text.length, `${locale}.${key}`).toBeLessThanOrEqual(300);
      }
    }
  });

  it("cost reminders name the own amount and never payment details (R.8 I10-09)", () => {
    const t = createTranslator({ locale: "de", messages: de, namespace: "share.remind" });
    expect(t("settle", values)).toBe(
      `Hey Kemal, laut Abrechnung von ${TRIP} bekomme ich noch 1.234,56 € von dir. Danke! ${LINK}`,
    );
    const tEn = createTranslator({ locale: "en", messages: en, namespace: "share.remind" });
    expect(tEn("settleAll", { ...values, count: 1 })).toBe(
      `Hey all, one payment is still open for ${TRIP} – take a quick look: ${LINK}`,
    );
    for (const key of ["settle", "settleAll", "settleOther"] as const) {
      expect(t(key, values)).not.toMatch(/IBAN|PayPal/);
    }
  });

  it("use «Hey {name}» for single reminders (no @, F-015)", () => {
    const t = createTranslator({ locale: "de", messages: de, namespace: "share.remind" });
    expect(t("p1", values)).toBe(
      `Hey Kemal, du fehlst noch bei ${TRIP}! Trag kurz ein, wann du kannst – dauert 2 Minuten: ${LINK}`,
    );
    expect(t("nudgeP1All", values)).toBe(
      `Hey Lena, alle haben ihre Tage für ${TRIP} eingetragen – du kannst jetzt die Abstimmung starten: ${LINK}`,
    );
  });
});
