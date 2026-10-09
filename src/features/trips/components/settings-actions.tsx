"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TripSheet, type SheetStep, type TripSheetContext } from "./trip-sheet";

/** W12 buttons that open a management dialog (transfer organiser role, delete trip). */
export function SettingsAction({
  kind,
  label,
  context,
}: {
  kind: "transfer" | "delete";
  label: string;
  context: TripSheetContext;
}) {
  const [step, setStep] = useState<SheetStep | null>(null);
  return (
    <>
      <Button
        variant={kind === "delete" ? "dangerQuiet" : "secondary"}
        size="md"
        icon={kind === "delete" ? "trash" : "crown"}
        aria-haspopup="dialog"
        onClick={() => {
          setStep({ kind });
        }}
      >
        {label}
      </Button>
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
