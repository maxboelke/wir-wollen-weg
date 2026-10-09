"use client";

import { useEffect } from "react";
import { syncMotionAttribute, watchSystemMotion } from "@/lib/motion";

/**
 * Keeps `<html data-motion>` in sync when the system setting changes while the page is
 * open (the inline head script handles the first paint). Renders nothing.
 */
export function MotionPreferenceSync() {
  useEffect(() => {
    syncMotionAttribute();
    return watchSystemMotion(syncMotionAttribute);
  }, []);
  return null;
}
