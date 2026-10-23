import "server-only";
import { getTranslations } from "next-intl/server";
import { locales, type Locale } from "@/i18n/config";
import { formatExact } from "@/lib/costs";
import { shareTextIntl } from "@/lib/share-text";
import type { CostsRaw } from "@/server/costs/db";
import type { TripView } from "../trips/load";
import { costsPath } from "../trips/paths";
import { inviteLink, tripLink } from "../trips/share-texts";
import { costsModel, proposalOf, type CostPersonView } from "./load";
import type { CostRemindData, CostRemindRow } from "./remind-types";

async function perLocale(render: (locale: Locale) => Promise<string>) {
  const entries = await Promise.all(
    locales.map(async (locale) => [locale, await render(locale)] as const),
  );
  return Object.fromEntries(entries) as Record<Locale, string>;
}

/** Name of a person in a sentence (lower-case «ehemaliges Mitglied», numbered if several). */
export async function personNameIn(locale: Locale, person: CostPersonView | undefined) {
  if (person?.name) return person.name;
  const t = await getTranslations({ locale, namespace: "costs" });
  const no = person?.formerNo ?? null;
  return no === null ? t("formerInline") : t("formerInlineNo", { n: no });
}

/**
 * Texts of the cost reminders (W16 v2.15): `settle` – the viewer reminds the people who owe
 * them (own amount only); `settle-all` – the organiser sees all open rows. Never IBAN/payment
 * details, titles or single expenses (R.8 I10-09). Placeholders: their personal link – only for
 * the organiser (F-007: personal links never reach member views); members send the trip's
 * invite link instead.
 */
export async function costRemindData(
  view: TripView,
  raw: CostsRaw,
): Promise<CostRemindData | null> {
  const { trip, isOrganizer, format, placeholders } = view;
  if (raw.closed) return null;
  const model = costsModel(view, raw);
  const { transfers } = proposalOf(raw);
  if (transfers.length === 0) return null;
  const byKey = new Map(model.people.map((p) => [p.key, p]));
  const balancesLink = tripLink(costsPath(trip.publicId, "balances"));
  const linkFor = (person: CostPersonView | undefined) => {
    if (person?.kind !== "placeholder") return balancesLink;
    const placeholder = isOrganizer
      ? placeholders.find((p) => p.id === person.avatarId)
      : undefined;
    return placeholder ? inviteLink(placeholder.inviteToken) : inviteLink(trip.inviteToken);
  };
  const row = async (
    from: string,
    to: string,
    cents: number,
    all: boolean,
  ): Promise<CostRemindRow> => {
    const debtor = byKey.get(from);
    const recipient = byKey.get(to);
    const canRemind = debtor !== undefined && debtor.kind !== "former" && !debtor.me;
    return {
      key: from,
      name: await personNameIn(format.locale, debtor),
      to: await personNameIn(format.locale, recipient),
      amount: formatExact(cents, trip.currency, format.intl),
      texts: canRemind
        ? await perLocale(async (locale) => {
            const t = await getTranslations({ locale, namespace: "share.remind" });
            const amount = formatExact(cents, trip.currency, shareTextIntl(locale, format.country));
            const name = await personNameIn(locale, debtor);
            return all
              ? t("settleOther", {
                  name,
                  trip: trip.name,
                  amount,
                  to: await personNameIn(locale, recipient),
                  link: linkFor(debtor),
                })
              : t("settle", { name, trip: trip.name, amount, link: linkFor(debtor) });
          })
        : null,
    };
  };
  const mine = await Promise.all(
    transfers
      .filter((t) => t.to === model.myParty && byKey.get(t.from)?.kind !== "former")
      .map((t) => row(t.from, t.to, t.cents, false)),
  );
  const all = isOrganizer
    ? await Promise.all(
        transfers
          .filter((t) => {
            const kind = byKey.get(t.from)?.kind;
            return kind === "member" || kind === "placeholder";
          })
          .map((t) => row(t.from, t.to, t.cents, true)),
      )
    : [];
  return {
    tripName: trip.name,
    defaultLocale: format.locale,
    mine,
    all,
    allTexts: isOrganizer
      ? await perLocale(async (locale) => {
          const t = await getTranslations({ locale, namespace: "share.remind" });
          return t("settleAll", { trip: trip.name, count: transfers.length, link: balancesLink });
        })
      : null,
  };
}

/**
 * «Abrechnung teilen» (W19 D.11): «Abrechnung {trip}:\n{A} → {B}: {Betrag}\n…\nDetails: {link}» –
 * names (the viewer by name, former members as «ehemaliges Mitglied»), never payment details,
 * titles or single expenses (R.8 I10-08).
 */
export async function costShareTexts(
  view: TripView,
  raw: CostsRaw,
): Promise<Record<Locale, string>> {
  const { trip, format } = view;
  const model = costsModel(view, raw);
  const { transfers } = proposalOf(raw);
  const byKey = new Map(model.people.map((p) => [p.key, p]));
  const link = tripLink(costsPath(trip.publicId, "balances"));
  return perLocale(async (locale) => {
    const t = await getTranslations({ locale, namespace: "costs" });
    if (transfers.length === 0) return t("shareSquare", { trip: trip.name, link });
    const intl = shareTextIntl(locale, format.country);
    const lines = await Promise.all(
      transfers.map(
        async (tr) =>
          `${await personNameIn(locale, byKey.get(tr.from))} → ${await personNameIn(locale, byKey.get(tr.to))}: ${formatExact(tr.cents, trip.currency, intl)}`,
      ),
    );
    return t("shareText", { trip: trip.name, lines: lines.join("\n"), link });
  });
}
