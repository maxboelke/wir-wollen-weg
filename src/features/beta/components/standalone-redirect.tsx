"use client";

import { useEffect } from "react";
import { isStandalone } from "@/lib/use-standalone";

/**
 * W23 A.2/A.7: the installed app starts at `/` – signed out it must not show the marketing
 * landing but the sign-in in app mode. Only the client knows it is the installed app.
 */
export function StandaloneRedirect({ to }: { to: string }) {
  useEffect(() => {
    if (isStandalone()) window.location.replace(to);
  }, [to]);
  return null;
}
