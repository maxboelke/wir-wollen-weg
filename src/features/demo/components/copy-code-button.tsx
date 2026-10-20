"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { copyText } from "@/lib/clipboard";

/** «Code kopieren» on the demo inbox (online preview) – with a polite status announcement. */
export function CopyCodeButton({ code }: { code: string }) {
  const t = useTranslations("demoInbox");
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");

  useEffect(() => {
    if (status !== "copied") return;
    const timer = window.setTimeout(() => {
      setStatus("idle");
    }, 2000);
    return () => {
      window.clearTimeout(timer);
    };
  }, [status]);

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        icon={status === "copied" ? "check" : "copy"}
        onClick={() => {
          void copyText(code).then((ok) => {
            setStatus(ok ? "copied" : "failed");
          });
        }}
      >
        {status === "copied" ? t("copied") : t("copyCode")}
      </Button>
      <span className="visually-hidden" role="status">
        {status === "copied" ? t("copied") : status === "failed" ? t("copyFailed") : ""}
      </span>
    </>
  );
}
