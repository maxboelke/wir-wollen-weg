import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/page-shell";
import ui from "@/components/ui.module.css";
import { saveName } from "@/features/auth/actions";
import { EmailAccessForm } from "@/features/auth/components/email-access-form";
import { LanguageSwitch } from "@/features/locale/language-switch";
import { toSafeInternalPath } from "@/lib/safe-path";
import { getSession } from "@/server/session";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth");
  return { title: t("loginTitle") };
}

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;
  const returnTo = toSafeInternalPath(typeof next === "string" ? next : undefined, "/trips");
  if (await getSession()) redirect(returnTo);

  const t = await getTranslations("auth");
  return (
    <PageShell homeHref="/" languageSwitch={<LanguageSwitch />}>
      <div className={ui.stack}>
        <h1>{t("loginTitle")}</h1>
        <p>{t("loginLead")}</p>
        <EmailAccessForm
          returnTo={returnTo}
          variant="login"
          onNameSubmit={saveName.bind(null, returnTo)}
        />
      </div>
    </PageShell>
  );
}
