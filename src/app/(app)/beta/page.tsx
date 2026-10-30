import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/page-shell";
import { BetaCodeForm } from "@/features/beta/components/beta-code-form";
import { BetaConsentForm } from "@/features/beta/components/beta-consent-form";
import { isBeta } from "@/lib/app-env";
import { toSafeInternalPath } from "@/lib/safe-path";
import { currentBetaPass } from "@/server/beta";
import { getSession } from "@/server/session";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("beta");
  return { title: t("title") };
}

/**
 * `/beta` – entry of the closed friends beta (W23 A.3/A.4, deployment.md §0.12.5): step 1 beta
 * code, step 2 short privacy notice + consent, then the e-mail step of /login. Exists only with
 * APP_ENV=beta (404 elsewhere). Signed in → /trips; a valid beta pass skips step 1.
 */
export default async function BetaPage({ searchParams }: PageProps<"/beta">) {
  if (!isBeta()) notFound();
  const { step, next: rawNext } = await searchParams;
  const next =
    typeof rawNext === "string" && rawNext ? toSafeInternalPath(rawNext, "/") : undefined;
  if (await getSession()) redirect(next ?? "/trips");

  const [pass, tApp] = await Promise.all([currentBetaPass(), getTranslations("app")]);
  const showConsent = pass !== null && step !== "code";

  return (
    <PageShell>
      {showConsent ? (
        <BetaConsentForm next={next} />
      ) : (
        <BetaCodeForm next={next} product={tApp("name")} />
      )}
    </PageShell>
  );
}
