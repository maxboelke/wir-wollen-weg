import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LegalPage, legalMetadata } from "@/features/legal/legal-page";
import { PRIVACY_PATHS } from "@/lib/legal";

/** /en/privacy (F-013, sitemap §3); /de/privacy → the de page. */
export async function generateMetadata({
  params,
}: PageProps<"/[locale]/privacy">): Promise<Metadata> {
  const { locale } = await params;
  return locale === "en" ? legalMetadata("privacy", "en") : {};
}

export default async function PrivacyPage({ params }: PageProps<"/[locale]/privacy">) {
  const { locale } = await params;
  if (locale !== "en") redirect(PRIVACY_PATHS.de);
  return <LegalPage kind="privacy" locale="en" />;
}
