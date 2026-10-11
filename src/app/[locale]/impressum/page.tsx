import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LegalPage, legalMetadata } from "@/features/legal/legal-page";
import { IMPRINT_PATHS } from "@/lib/legal";

/** /de/impressum (F-013, sitemap §3); /en/impressum → the en page. */
export async function generateMetadata({
  params,
}: PageProps<"/[locale]/impressum">): Promise<Metadata> {
  const { locale } = await params;
  return locale === "de" ? legalMetadata("imprint", "de") : {};
}

export default async function ImpressumPage({ params }: PageProps<"/[locale]/impressum">) {
  const { locale } = await params;
  if (locale !== "de") redirect(IMPRINT_PATHS.en);
  return <LegalPage kind="imprint" locale="de" />;
}
