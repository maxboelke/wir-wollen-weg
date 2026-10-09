import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Illustration } from "@/components/illustrations/illustration";
import { PageShell } from "@/components/page-shell";
import { CreateTripFlow } from "@/features/trips/components/create-trip-flow";
import { regionGroups } from "@/features/trips/region-options";
import { todayIso } from "@/lib/dates";
import { emptyDraft } from "@/lib/trip-input";
import { getSession } from "@/server/session";
import { viewerFormat } from "@/server/viewer";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("tripForm");
  return { title: t("titleNew") };
}

/** W05 «Neue Reise planen» (F-001) – also without an account (Flow G: value before hurdle). */
export default async function NewTripPage() {
  const session = await getSession();
  const [format, regions] = await Promise.all([viewerFormat(session), regionGroups()]);
  return (
    <PageShell>
      <CreateTripFlow
        signedIn={session !== null}
        initial={emptyDraft(format.region)}
        today={todayIso()}
        intl={format.intl}
        regions={regions}
        codeIllustration={<Illustration name="code-sent" />}
      />
    </PageShell>
  );
}
