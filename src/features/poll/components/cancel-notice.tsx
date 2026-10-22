"use client";

import { useEffect, useRef } from "react";
import { Banner } from "@/components/ui/banner";
import { pollCancelSeenAction, reopenSeenAction } from "../actions";
import styles from "./poll.module.css";

/**
 * One-off notice «{Name} hat die Abstimmung abgebrochen. Eine neue folgt.» (Q21, ux-spec
 * §13.1 a): rendered by the server only while due; once shown, it is marked as seen for this
 * membership (across devices), so the next visit is quiet.
 */
export function CancelNotice({
  publicId,
  text,
  kind = "cancel",
}: {
  publicId: string;
  text: string;
  /** "reopen": «{orga} hat den Termin wieder geöffnet» after «Festlegung aufheben» (§14.4). */
  kind?: "cancel" | "reopen" | undefined;
}) {
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    const seen = kind === "reopen" ? reopenSeenAction : pollCancelSeenAction;
    void seen(publicId).catch(() => undefined);
  }, [publicId, kind]);
  return (
    <Banner tone="info" role="status" className={styles.cancelNotice}>
      {text}
    </Banner>
  );
}
