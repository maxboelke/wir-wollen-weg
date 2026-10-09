import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { HelpPage, helpMetadata } from "@/features/help/help-page";
import { HELP_PATHS } from "@/lib/help";

/** /de/hilfe (F-051, W15); /en/hilfe → /en/help. */
export async function generateMetadata({
  params,
}: PageProps<"/[locale]/hilfe">): Promise<Metadata> {
  const { locale } = await params;
  return locale === "de" ? helpMetadata("de") : {};
}

export default async function GermanHelpPage({ params }: PageProps<"/[locale]/hilfe">) {
  const { locale } = await params;
  if (locale !== "de") redirect(HELP_PATHS.en);
  return <HelpPage locale="de" />;
}
