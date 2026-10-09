"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Enter } from "@/components/enter";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { EmailAccessForm } from "@/features/auth/components/email-access-form";
import { formatDateRange, isIsoDate } from "@/lib/dates";
import { loadPendingAuth } from "@/lib/pending-auth";
import { loadTripDraft, saveTripDraft } from "@/lib/trip-draft-storage";
import type { TripDraft } from "@/lib/trip-input";
import { createTrip, createTripFormAction, createTripWithName } from "../actions";
import { TripForm, type RegionGroup } from "./trip-form";
import styles from "./create-trip-flow.module.css";

export const CREATE_TRIP_PATH = "/trips/new";

interface CreateTripFlowProps {
  signedIn: boolean;
  initial: TripDraft;
  today: string;
  intl: string;
  regions: RegionGroup[];
  codeIllustration: ReactNode;
}

/**
 * Flow G (W05): the form works without an account – «Reise anlegen» then shows a summary of
 * the trip and the sign-in steps (e-mail → code → name for new accounts). The draft is kept
 * in storage (reload, in-app browser) and the trip is created right after signing in.
 */
export function CreateTripFlow({
  signedIn,
  initial,
  today,
  intl,
  regions,
  codeIllustration,
}: CreateTripFlowProps) {
  const t = useTranslations("tripForm");
  const [draft, setDraft] = useState<TripDraft>(initial);
  const [formKey, setFormKey] = useState(0);
  const [mode, setMode] = useState<"form" | "auth">("form");
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Restore after a reload / app switch: the draft, and – if a code is on its way – the
  // sign-in step (the code step itself is restored by EmailAccessForm, A.4).
  useEffect(() => {
    const stored = loadTripDraft();
    if (!stored) return;
    /* eslint-disable react-hooks/set-state-in-effect -- storage is only readable after mounting */
    setDraft(stored);
    setFormKey((key) => key + 1);
    if (!signedIn && loadPendingAuth()?.origin === CREATE_TRIP_PATH) setMode("auth");
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [signedIn]);

  if (mode === "auth") {
    const nights =
      draft.preferredNights && draft.preferredNights !== draft.minNights
        ? t("nightsRange", { min: draft.minNights, max: draft.preferredNights })
        : t("nights", { count: Number(draft.minNights) });
    const range =
      isIsoDate(draft.rangeStart) && isIsoDate(draft.rangeEnd)
        ? formatDateRange(draft.rangeStart, draft.rangeEnd, intl, { today })
        : "";
    return (
      <Enter className={styles.auth}>
        <h1 className={styles.heading}>{t("titleNew")}</h1>
        <Card as="section" aria-label={t("summaryLabel")} className={styles.summary}>
          <p className={styles.summaryName}>{draft.name.trim()}</p>
          <p className={styles.summaryMeta}>
            <Icon name="calendar" size={16} />
            <span>
              {range}
              {range ? " · " : ""}
              {nights}
            </span>
          </p>
          <button
            type="button"
            className={styles.edit}
            onClick={() => {
              setMode("form");
              requestAnimationFrame(() => headingRef.current?.focus());
            }}
          >
            {t("edit")}
          </button>
        </Card>
        <EmailAccessForm
          variant="createTrip"
          returnTo={CREATE_TRIP_PATH}
          codeIllustration={codeIllustration}
          onNameSubmit={(name) => createTripWithName(draft, name)}
          onSignedIn={async () => {
            const result = await createTrip(draft);
            return { error: result.errors ? "tripInvalid" : "generic" };
          }}
        />
      </Enter>
    );
  }

  return (
    <div className={styles.auth}>
      <h1 ref={headingRef} tabIndex={-1} className={styles.heading}>
        {t("titleNew")}
      </h1>
      <TripForm
        key={formKey}
        mode="create"
        initial={draft}
        today={today}
        intl={intl}
        regions={regions}
        action={createTripFormAction}
        onDraftChange={(next) => {
          setDraft(next);
          saveTripDraft(next);
        }}
        interceptSubmit={
          signedIn
            ? undefined
            : (valid) => {
                setDraft(valid);
                saveTripDraft(valid);
                setMode("auth");
                return true;
              }
        }
      />
    </div>
  );
}
