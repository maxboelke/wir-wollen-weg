"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useId, useState, useTransition } from "react";
import { Banner } from "@/components/ui/banner";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { RadioGroup } from "@/components/ui/radio-group";
import type { DeletionChoice } from "@/lib/account-deletion";
import { formatExact } from "@/lib/costs";
import { formatDate, isoDateInZone } from "@/lib/dates";
import { deleteAccountAction } from "../actions";
import { ReauthStep } from "./reauth-step";
import styles from "./account.module.css";

export interface OrganizedTrip {
  publicId: string;
  name: string;
  memberCount: number;
  /** Other members, longest first – the first one is pre-selected (W13). */
  successors: { userId: string; displayName: string; joinedAt: string }[];
}

interface DeleteAccountFlowProps {
  email: string;
  canUsePassword: boolean;
  organized: OrganizedTrip[];
  /** Trips only this person is in – deleted together with the account. */
  solo: string[];
  /** Number of trips where the person is a member (not organiser). */
  memberOf: number;
  intl: string;
  /** Trips with an open own balance (W19 D.10) – informs, does not block. */
  openCosts?: { name: string; href: string; cents: number; currency: string }[] | undefined;
}

/**
 * W13 «Konto löschen» (F-043, Flow I.3): 1) what gets deleted, 2) per organised trip with
 * other members «Orga übergeben an …» (longest member pre-selected) or «Reise für alle
 * löschen», 3) trips that go with the account, 4) confirm it's you (code or password),
 * 5) last dialog «Konto endgültig löschen?» → /goodbye. The server checks everything again.
 */
export function DeleteAccountFlow({
  email,
  canUsePassword,
  organized,
  solo,
  memberOf,
  intl,
  openCosts = [],
}: DeleteAccountFlowProps) {
  const t = useTranslations("account.delete");
  const tAccount = useTranslations("account");
  const tCommon = useTranslations("common");
  const tCosts = useTranslations("costsLeave");
  const router = useRouter();
  const id = useId();
  const [choices, setChoices] = useState<Record<string, DeletionChoice>>({});
  const [confirmed, setConfirmed] = useState(false);
  const [reauthExpired, setReauthExpired] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [error, setError] = useState<"planOutdated" | "generic" | null>(null);
  const [pending, startTransition] = useTransition();

  /** Current choice of a trip – new trips (after a reload) start with the hand-over. */
  function choiceOf(trip: OrganizedTrip): DeletionChoice {
    const chosen = choices[trip.publicId];
    if (chosen?.action === "delete") return chosen;
    const valid = trip.successors.find(
      (s) => chosen?.action === "transfer" && s.userId === chosen.to,
    );
    return { action: "transfer", to: (valid ?? trip.successors[0])?.userId ?? "" };
  }

  function submit() {
    setError(null);
    const plan = Object.fromEntries(organized.map((trip) => [trip.publicId, choiceOf(trip)]));
    startTransition(async () => {
      const result = await deleteAccountAction(plan);
      // Success redirects to /goodbye and resolves without a result.
      if (!result.error) return;
      setSheetOpen(false);
      if (result.error === "reauthExpired") {
        setConfirmed(false);
        setReauthExpired(true);
        return;
      }
      setError(result.error === "planOutdated" ? "planOutdated" : "generic");
      if (result.error === "planOutdated") router.refresh();
    });
  }

  return (
    <div className={styles.page}>
      <Link className={`${styles.textLink} ${styles.backLink}`} href="/account">
        {tAccount("back")}
      </Link>
      <h1>{t("title")}</h1>

      {error ? (
        <Banner tone="danger" role="alert">
          {error === "planOutdated" ? t("planOutdated") : tCommon("genericError")}
        </Banner>
      ) : null}

      <Card as="section" aria-labelledby={`${id}-what`} className={styles.card}>
        <h2 id={`${id}-what`} className={styles.cardTitle}>
          {t("whatTitle")}
        </h2>
        <p>{t("whatText")}</p>
        {memberOf > 0 ? <p className={styles.muted}>{t("memberOf", { count: memberOf })}</p> : null}
        {openCosts.length > 0 ? (
          <div data-open-costs="">
            <p>{tCosts("accountTitle", { count: openCosts.length })}</p>
            <ul>
              {openCosts.map((trip) => {
                const amount = formatExact(Math.abs(trip.cents), trip.currency, intl);
                return (
                  <li key={trip.href}>
                    <Link href={trip.href}>
                      {trip.cents < 0
                        ? tCosts("accountOwe", { trip: trip.name, amount })
                        : tCosts("accountOwed", { trip: trip.name, amount })}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </Card>

      {organized.length > 0 ? (
        <Card as="section" aria-labelledby={`${id}-orga`} className={styles.card}>
          <h2 id={`${id}-orga`} className={styles.cardTitle}>
            {t("organizedTitle")}
          </h2>
          <p className={styles.muted}>{t("organizedLead")}</p>
          {organized.map((trip) => {
            const choice = choiceOf(trip);
            const selectId = `${id}-${trip.publicId}-to`;
            return (
              <div key={trip.publicId} className={styles.tripChoice} data-trip={trip.publicId}>
                <RadioGroup
                  legend={
                    <span className={styles.tripChoiceTitle}>
                      {t("tripMembers", { trip: trip.name, count: trip.memberCount })}
                    </span>
                  }
                  name={`${id}-${trip.publicId}`}
                  value={choice.action}
                  onChange={(value) => {
                    setChoices((current) => ({
                      ...current,
                      [trip.publicId]:
                        value === "delete"
                          ? { action: "delete" }
                          : { action: "transfer", to: trip.successors[0]?.userId ?? "" },
                    }));
                  }}
                  options={[
                    { value: "transfer", label: t("transfer") },
                    { value: "delete", label: t("deleteTrip"), hint: t("deleteTripHint") },
                  ]}
                />
                {choice.action === "transfer" ? (
                  <div>
                    <label className={styles.label} htmlFor={selectId}>
                      {t("newOrga")}
                    </label>
                    <select
                      id={selectId}
                      className={styles.select}
                      value={choice.to}
                      onChange={(event) => {
                        setChoices((current) => ({
                          ...current,
                          [trip.publicId]: { action: "transfer", to: event.target.value },
                        }));
                      }}
                    >
                      {trip.successors.map((successor) => (
                        <option key={successor.userId} value={successor.userId}>
                          {t("successor", {
                            name: successor.displayName,
                            date: formatDate(isoDateInZone(new Date(successor.joinedAt)), intl, {
                              weekday: false,
                              year: false,
                            }),
                          })}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}
              </div>
            );
          })}
        </Card>
      ) : null}

      {solo.length > 0 ? (
        <Card as="section" aria-labelledby={`${id}-solo`} className={styles.card}>
          <h2 id={`${id}-solo`} className={styles.cardTitle}>
            {t("soloTitle")}
          </h2>
          <ul className={styles.list}>
            {solo.map((name, index) => (
              <li key={`${name}-${String(index)}`}>{name}</li>
            ))}
          </ul>
        </Card>
      ) : null}

      <Card as="section" className={styles.card}>
        {confirmed ? (
          <p className={styles.confirmed} role="status">
            <Icon name="check" size={20} />
            {t("confirmedYou")}
          </p>
        ) : (
          <ReauthStep
            currentEmail={email}
            canUsePassword={canUsePassword}
            expired={reauthExpired}
            onConfirmed={() => {
              setReauthExpired(false);
              setConfirmed(true);
            }}
          />
        )}
      </Card>

      <div className={styles.form}>
        {confirmed ? null : <p className={styles.muted}>{t("confirmFirst")}</p>}
        <Button
          variant="danger"
          size="md"
          icon="trash"
          className={styles.backLink}
          aria-disabled={!confirmed || undefined}
          aria-haspopup="dialog"
          onClick={() => {
            setSheetOpen(true);
          }}
        >
          {t("submit")}
        </Button>
      </div>

      <BottomSheet
        open={sheetOpen}
        onClose={() => {
          setSheetOpen(false);
        }}
        title={t("dialogTitle")}
        closeLabel={tCommon("close")}
      >
        <div className={styles.form}>
          <p>{t("dialogText")}</p>
          <div className={styles.actions}>
            <Button
              variant="secondary"
              size="md"
              data-autofocus=""
              onClick={() => {
                setSheetOpen(false);
              }}
            >
              {tCommon("cancel")}
            </Button>
            <Button variant="danger" size="md" loading={pending} onClick={submit}>
              {t("dialogConfirm")}
            </Button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
