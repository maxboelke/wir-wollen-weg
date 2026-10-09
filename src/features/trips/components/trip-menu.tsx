"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import styles from "./trip-cockpit.module.css";
import { TripSheet, type SheetStep, type TripSheetContext } from "./trip-sheet";

/** «⋯» round button in the cockpit → trip menu sheet (sitemap §5, W07-05 = G-05). */
export function TripMenu({ label, ...context }: { label: string } & TripSheetContext) {
  const [step, setStep] = useState<SheetStep | null>(null);
  return (
    <>
      <button
        type="button"
        className={styles.round}
        aria-label={label}
        aria-haspopup="dialog"
        onClick={() => {
          setStep({ kind: "menu" });
        }}
      >
        <Icon name="more" size={20} />
      </button>
      <TripSheet
        {...context}
        step={step}
        onStep={setStep}
        onClose={() => {
          setStep(null);
        }}
      />
    </>
  );
}
