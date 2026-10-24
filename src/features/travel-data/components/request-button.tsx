"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { buttonClassName } from "@/components/ui/button-styles";
import { Icon } from "@/components/ui/icon";
import { useToast } from "@/components/ui/toast";
import styles from "./travel-data.module.css";

/**
 * `[+ Anfrage]` in the head (W20 H.3/H.4): outline button; below 400 px only the icon with the
 * name «Reisedaten anfragen». With 3 open requests `aria-disabled` – tapping explains why.
 */
export function RequestButton({ href, limitReached }: { href: string; limitReached: boolean }) {
  const t = useTranslations("travelData.request");
  const toast = useToast();
  const content = (
    <>
      <Icon name="plus" size={20} />
      <span className={styles.headActionLabel}>{t("ctaShort").replace(/^\+\s*/, "")}</span>
    </>
  );
  if (limitReached) {
    return (
      <button
        type="button"
        className={buttonClassName({ variant: "secondary", size: "sm" })}
        aria-disabled="true"
        aria-label={t("cta")}
        onClick={() => {
          toast({ message: t("limit") });
        }}
      >
        {content}
      </button>
    );
  }
  return (
    <Link
      className={buttonClassName({ variant: "secondary", size: "sm" })}
      href={href}
      aria-label={t("cta")}
      data-travel-new=""
    >
      {content}
    </Link>
  );
}
