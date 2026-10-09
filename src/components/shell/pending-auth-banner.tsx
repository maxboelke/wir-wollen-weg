"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Banner } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import { clearPendingAuth, loadPendingAuth, type PendingAuth } from "@/lib/pending-auth";
import { DISTANCE, DURATION, enter } from "@/lib/motion";
import styles from "./pending-auth-banner.module.css";

/**
 * A.4 rule 3: if an in-app browser reloads some other page in the middle of signing in,
 * every page offers the way back – «Du warst gerade dabei, „Lissabon 2027“ beizutreten.
 * [Weiter]». Not shown on the page where the flow itself restores (G-09 motion).
 */
export function PendingAuthBanner() {
  const t = useTranslations("pending");
  const pathname = usePathname();
  const [pending, setPending] = useState<PendingAuth | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = loadPendingAuth();
    const originPath = stored?.origin.split("?")[0];
    // Reading browser storage is only possible after mounting.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPending(stored && originPath !== pathname ? stored : null);
  }, [pathname]);

  useEffect(() => {
    if (pending) enter(ref.current, { y: -DISTANCE.sm, duration: DURATION.base });
  }, [pending]);

  if (!pending) return null;
  return (
    <div ref={ref} className={styles.wrap}>
      <Banner
        tone="info"
        role="status"
        action={
          <span className={styles.actions}>
            <Link className={styles.continue} href={pending.origin}>
              {t("continue")}
            </Link>
            <Button
              variant="text"
              size="sm"
              onClick={() => {
                clearPendingAuth();
                setPending(null);
              }}
            >
              {t("dismiss")}
            </Button>
          </span>
        }
      >
        {pending.tripName ? t("join", { trip: pending.tripName }) : t("signIn")}
      </Banner>
    </div>
  );
}
