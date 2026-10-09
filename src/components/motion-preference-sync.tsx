"use client";

import { useEffect } from "react";
import {
  motionCookieReduces,
  setMotionPreference,
  syncMotionAttribute,
  watchSystemMotion,
} from "@/lib/motion";

/**
 * Keeps `<html data-motion>` in sync when the system setting changes while the page is
 * open (the inline head script handles the first paint). Signed in, the account choice
 * (F-043/F-052, set on another device) wins and is copied into this browser's cookie, so
 * the next first paint is right without the server. Renders nothing.
 */
export function MotionPreferenceSync({ account }: { account?: boolean | undefined }) {
  useEffect(() => {
    if (account !== undefined && motionCookieReduces(document.cookie) !== account) {
      setMotionPreference(account);
    }
    syncMotionAttribute();
    return watchSystemMotion(syncMotionAttribute);
  }, [account]);
  return null;
}
