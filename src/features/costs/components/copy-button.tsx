"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { copyText } from "@/lib/clipboard";

/** «Kopieren» (ux-spec §4.5, W19-13 / G-11): 2 s «Kopiert ✓», announcement via the caller. */
export function CopyButton({
  text,
  label,
  name,
  done,
}: {
  text: string;
  label: string;
  name: string;
  done: () => void;
}) {
  const t = useTranslations("payInfo");
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => {
      setCopied(false);
    }, 2000);
    return () => {
      window.clearTimeout(timer);
    };
  }, [copied]);
  return (
    <Button
      variant="text"
      size="sm"
      icon={copied ? "check" : "copy"}
      aria-label={name}
      onClick={() => {
        void copyText(text).then((ok) => {
          if (ok) {
            setCopied(true);
            done();
          }
        });
      }}
    >
      {copied ? t("copied") : label}
    </Button>
  );
}
