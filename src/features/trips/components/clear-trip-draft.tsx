"use client";

import { useEffect } from "react";
import { clearTripDraft } from "@/lib/trip-draft-storage";

/** After the trip was created: the stored form draft (Flow G) is no longer needed. */
export function ClearTripDraft() {
  useEffect(() => {
    clearTripDraft();
  }, []);
  return null;
}
