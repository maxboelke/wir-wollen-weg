"use client";

import { useEffect, useRef } from "react";
import { Banner } from "@/components/ui/banner";
import { pollCancelSeenAction } from "../actions";
import styles from "./poll.module.css";

/**
 * One-off notice «{Name} hat die Abstimmung abgebrochen. Eine neue folgt.» (Q21, ux-spec
 * §13.1 a): rendered by the server only while due; once shown, it is marked as seen for this
 * membership (across devices), so the next visit is quiet.
 */
export function CancelNotice({ publicId, text }: { publicId: string; text: string }) {
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    void pollCancelSeenAction(publicId).catch(() => undefined);
  }, [publicId]);
  return (
    <Banner tone="info" role="status" className={styles.cancelNotice}>
      {text}
    </Banner>
  );
}
