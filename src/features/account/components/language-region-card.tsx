"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useId, useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { FieldLabel } from "@/components/ui/field";
import { RadioGroup } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/toast";
import { chooseLanguage } from "@/features/locale/actions";
import { locales, type Locale } from "@/i18n/config";
import {
  COUNTRIES,
  firstDayOfWeek,
  formatLongDate,
  PREVIEW_DATE,
  SUBDIVISIONS,
  weekdayName,
  type Country,
  type WeekStart,
} from "@/lib/region";
import { updateRegion } from "../actions";
import styles from "./account.module.css";

interface LanguageRegionCardProps {
  locale: Locale;
  country: Country;
  subdivision: string | null;
  weekStart: WeekStart;
}

/**
 * W13 «Sprache & Region» (Flow I.1 #2, F-046): language and region are separate. Everything
 * saves immediately; the region shows a live preview via `Intl`. Language: no snackbar, the
 * page simply switches and focus stays on the radio (Flow F.3).
 */
export function LanguageRegionCard(props: LanguageRegionCardProps) {
  const t = useTranslations("account.language");
  const tCommon = useTranslations("common");
  const tRegions = useTranslations("regions");
  const router = useRouter();
  const toast = useToast();
  const id = useId();
  const [, startTransition] = useTransition();
  const [locale, setLocale] = useState(props.locale);
  const [country, setCountry] = useState(props.country);
  const [subdivision, setSubdivision] = useState(props.subdivision);
  const [weekStart, setWeekStart] = useState(props.weekStart);

  function saveRegion(next: {
    country: Country;
    subdivision: string | null;
    weekStart: WeekStart;
  }) {
    setCountry(next.country);
    setSubdivision(next.subdivision);
    setWeekStart(next.weekStart);
    startTransition(async () => {
      const result = await updateRegion(next);
      if (result.ok) toast({ message: tCommon("saved") });
    });
  }

  const subdivisions = SUBDIVISIONS[country];
  const autoDay = weekdayName(firstDayOfWeek("auto", country), locale);

  return (
    <Card as="section" aria-labelledby={`${id}-title`} className={styles.card}>
      <h2 id={`${id}-title`} className={styles.cardTitle}>
        {t("title")}
      </h2>
      <RadioGroup
        legend={t("languageLegend")}
        name="locale"
        layout="row"
        value={locale}
        options={locales.map((value) => ({
          value,
          label: tCommon(`languages.${value}`),
          lang: value,
        }))}
        onChange={(next) => {
          setLocale(next);
          startTransition(async () => {
            await chooseLanguage(next);
            router.refresh();
          });
        }}
      />
      <div className={styles.form}>
        <div>
          <FieldLabel htmlFor={`${id}-country`}>{t("countryLabel")}</FieldLabel>
          <select
            id={`${id}-country`}
            className={styles.select}
            value={country}
            onChange={(event) => {
              const next = event.target.value as Country;
              saveRegion({ country: next, subdivision: null, weekStart });
            }}
          >
            {COUNTRIES.map((code) => (
              <option key={code} value={code}>
                {tRegions(`countries.${code}`)}
              </option>
            ))}
          </select>
        </div>
        {subdivisions.length > 0 ? (
          <div>
            <FieldLabel htmlFor={`${id}-subdivision`}>{t("subdivisionLabel")}</FieldLabel>
            <select
              id={`${id}-subdivision`}
              className={styles.select}
              value={subdivision ?? ""}
              onChange={(event) => {
                saveRegion({ country, subdivision: event.target.value || null, weekStart });
              }}
            >
              <option value="">{t("subdivisionNone")}</option>
              {subdivisions.map((code) => (
                <option key={code} value={code}>
                  {tRegions(`subdivisions.${code}` as Parameters<typeof tRegions>[0])}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        <RadioGroup
          legend={t("weekStartLegend")}
          name="weekStart"
          value={weekStart}
          options={[
            { value: "auto", label: t("weekStartAuto", { day: autoDay }) },
            { value: "mon", label: t("weekStartMon") },
            { value: "sun", label: t("weekStartSun") },
          ]}
          onChange={(next) => {
            saveRegion({ country, subdivision, weekStart: next });
          }}
        />
        {/* Server and browser ICU may differ in punctuation ("Fri 2 July" / "Fri, 2 July"). */}
        <p className={styles.preview} aria-live="polite" suppressHydrationWarning>
          {t("preview", { date: formatLongDate(PREVIEW_DATE, locale, country) })}
        </p>
      </div>
    </Card>
  );
}
