import "server-only";
import type { StayFormProps } from "./components/stay-form";
import type { TripView } from "../trips/load";
import type { StaysModel } from "./load";

/** «€» / «£» / «CHF» – the currency sign of the trip in the viewer's format. */
export function currencySign(currency: string, intl: string): string {
  const part = new Intl.NumberFormat(intl, { style: "currency", currency })
    .formatToParts(1)
    .find((p) => p.type === "currency");
  return part?.value ?? currency;
}

/** Shared props of «Vorschlagen» and «Bearbeiten» (W17 F). */
export function formProps(
  view: TripView,
  model: StaysModel,
  staysHref: string,
): Omit<StayFormProps, "edit"> {
  const { format, trip } = view;
  return {
    publicId: trip.publicId,
    locale: format.locale === "de" ? "de" : "en",
    intl: format.intl,
    currency: model.currency,
    currencySign: currencySign(model.currency, format.intl),
    travellers: model.travellers,
    placeholderNames: new Intl.ListFormat(format.locale, {
      type: "conjunction",
      style: "long",
    }).format(model.placeholderNames),
    staysHref,
  };
}
