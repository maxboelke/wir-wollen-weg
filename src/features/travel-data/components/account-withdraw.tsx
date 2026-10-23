"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { withdrawAction } from "../actions";
import styles from "./travel-data.module.css";

export interface AccountRelease {
  publicId: string;
  tripName: string;
  requestId: string;
  purpose: string;
  /** The asking «Bucht» person – null when they left. */
  requesterName: string | null;
}

/**
 * «Freigabe zurückziehen …» in the account (CEO 2026-10-23, W20 H.17): while the dates of a trip
 * are open again the area is not reachable, but withdrawing must stay possible (Art. 7 Abs. 3
 * DSGVO). Hard deletes the values and the access log at once.
 */
export function AccountTravelWithdraw({
  releases,
  formerName,
}: {
  releases: AccountRelease[];
  formerName: string;
}) {
  const t = useTranslations("account.privacy");
  const tTravel = useTranslations("travelData");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState<AccountRelease | null>(null);
  const [last, setLast] = useState<AccountRelease | null>(null);
  if (open && open !== last) setLast(open);
  const [busy, setBusy] = useState(false);
  if (releases.length === 0) return null;
  const name = (r: AccountRelease) => r.requesterName ?? formerName;
  return (
    <div className={styles.stack} data-account-travel="">
      <h3 className={styles.h4}>{t("travelTitle")}</h3>
      <p className={styles.small}>{t("travelHint")}</p>
      <ul className={styles.statusList}>
        {releases.map((r) => (
          <li key={r.requestId}>
            <span>{t("travelRow", { trip: r.tripName, name: name(r), purpose: r.purpose })}</span>
            <button
              type="button"
              className={styles.textButton}
              aria-haspopup="dialog"
              onClick={() => {
                setOpen(r);
              }}
            >
              {t("travelWithdraw")}
            </button>
          </li>
        ))}
      </ul>
      <BottomSheet
        open={open !== null}
        onClose={() => {
          setOpen(null);
        }}
        title={tTravel("revoke.title")}
        closeLabel={tCommon("close")}
      >
        {last ? (
          <div className={styles.stack}>
            <p className={styles.text}>{tTravel("revoke.body", { name: name(last) })}</p>
            <div className={styles.actions}>
              <Button
                variant="secondary"
                size="md"
                data-autofocus=""
                onClick={() => {
                  setOpen(null);
                }}
              >
                {tCommon("cancel")}
              </Button>
              <Button
                variant="danger"
                size="md"
                loading={busy}
                onClick={() => {
                  setBusy(true);
                  void withdrawAction(last.publicId, last.requestId)
                    .then((result) => {
                      toast({ message: result.ok ? tTravel("revoke.done") : tTravel("generic") });
                      setOpen(null);
                      router.refresh();
                    })
                    .finally(() => {
                      setBusy(false);
                    });
                }}
              >
                {tTravel("revoke.confirm")}
              </Button>
            </div>
          </div>
        ) : null}
      </BottomSheet>
    </div>
  );
}
