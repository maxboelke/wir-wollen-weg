"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { FeedbackConfig } from "@/lib/beta-config";
import { Feedback } from "./feedback";

/** «Feedback geben» as a button (help page, W23 D.2). */
export function FeedbackButton({ config, label }: { config: FeedbackConfig; label: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => {
          setOpen(true);
        }}
      >
        {label}
      </Button>
      <Feedback
        config={config}
        open={open}
        onClose={() => {
          setOpen(false);
        }}
      />
    </>
  );
}
