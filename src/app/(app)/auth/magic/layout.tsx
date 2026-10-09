import type { ReactNode } from "react";
import { PageShell } from "@/components/page-shell";

/**
 * Page frame for /auth/magic. Lives in the layout (not the page) so that error.tsx – the
 * network-error state of Flow H.5 3e – keeps header, skip link and the main landmark.
 */
export default function MagicLinkLayout({ children }: { children: ReactNode }) {
  return <PageShell>{children}</PageShell>;
}
