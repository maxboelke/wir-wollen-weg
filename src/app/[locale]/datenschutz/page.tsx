import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LegalPage, legalMetadata } from "@/features/legal/legal-page";
import { PRIVACY_PATHS } from "@/lib/legal";

/** /de/datenschutz (F-013, sitemap §3); /en/datenschutz → the en page. */
export async function generateMetadata({
  params,
}: PageProps<"/[locale]/datenschutz">): Promise<Metadata> {
  const { locale } = await params;
  return locale === "de" ? legalMetadata("privacy", "de") : {};
}

export default async function DatenschutzPage({ params }: PageProps<"/[locale]/datenschutz">) {
  const { locale } = await params;
  if (locale !== "de") redirect(PRIVACY_PATHS.en);
  return <LegalPage kind="privacy" locale="de" />;
}
