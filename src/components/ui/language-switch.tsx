import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import { Icon } from "./icon";
import styles from "./language-switch.module.css";

export type LanguageSwitchTone = "light" | "onBrand";

/** Look of the one-tap language switch: globe + target language, ≥ 44 × 44 (D-16, §9.19). */
export function languageSwitchClassName(tone: LanguageSwitchTone = "light"): string {
  return cx(styles.switch, tone === "onBrand" && styles.onBrand);
}

export function LanguageSwitchContent({ children }: { children: ReactNode }) {
  return (
    <>
      <Icon name="language" size={20} />
      <span>{children}</span>
    </>
  );
}
