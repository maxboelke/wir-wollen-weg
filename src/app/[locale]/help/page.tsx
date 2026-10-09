import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { HelpPage, helpMetadata } from "@/features/help/help-page";
import { HELP_PATHS } from "@/lib/help";

/** /en/help (F-051, W15); /de/help → /de/hilfe. */
export async function generateMetadata({ params }: PageProps<"/[locale]/help">): Promise<Metadata> {
  const { locale } = await params;
  return locale === "en" ? helpMetadata("en") : {};
}

export default async function EnglishHelpPage({ params }: PageProps<"/[locale]/help">) {
  const { locale } = await params;
  if (locale !== "en") redirect(HELP_PATHS.de);
  return <HelpPage locale="en" />;
}
