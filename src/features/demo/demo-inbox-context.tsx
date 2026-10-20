"use client";

import { createContext, use, type ReactNode } from "react";

/**
 * Whether the demo inbox (/demo/postfach, MAIL_TRANSPORT=inbox) exists – set by the app layout
 * on the server, read by client forms that ask for a mailed code (hint «Demo-Postfach öffnen»).
 */
const DemoInboxContext = createContext(false);

export function DemoInboxProvider({
  enabled,
  children,
}: {
  enabled: boolean;
  children: ReactNode;
}) {
  return <DemoInboxContext value={enabled}>{children}</DemoInboxContext>;
}

export function useDemoInbox(): boolean {
  return use(DemoInboxContext);
}
