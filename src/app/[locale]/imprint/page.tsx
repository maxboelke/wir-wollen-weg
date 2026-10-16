import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LegalPage, legalMetadata } from "@/features/legal/legal-page";
import { IMPRINT_PATHS } from "@/lib/legal";

/** /en/imprint (F-013, sitemap §3); /de/imprint → the de page. */
export async function generateMetadata({
  params,
}: PageProps<"/[locale]/imprint">): Promise<Metadata> {
  const { locale } = await params;
  return locale === "en" ? legalMetadata("imprint", "en") : {};
}

export default async function ImprintPage({ params }: PageProps<"/[locale]/imprint">) {
  const { locale } = await params;
  if (locale !== "en") redirect(IMPRINT_PATHS.de);
  return <LegalPage kind="imprint" locale="en" />;
}
