import "server-only";
import { getTranslations } from "next-intl/server";
import { COUNTRIES, SUBDIVISIONS } from "@/lib/region";
import type { RegionGroup } from "./components/trip-form";

/** Holiday regions for the select (F-016): per country «landesweit» plus its subdivisions. */
export async function regionGroups(): Promise<RegionGroup[]> {
  const [tRegions, tForm] = await Promise.all([
    getTranslations("regions"),
    getTranslations("tripForm"),
  ]);
  return COUNTRIES.map((country) => {
    const countryName = tRegions(`countries.${country}`);
    return {
      label: countryName,
      options: [
        { value: country, label: tForm("regionNationwide", { country: countryName }) },
        ...SUBDIVISIONS[country].map((code) => ({
          value: code,
          label: tForm("regionSub", {
            country: countryName,
            region: tRegions(`subdivisions.${code}` as Parameters<typeof tRegions>[0]),
          }),
        })),
      ],
    };
  });
}
