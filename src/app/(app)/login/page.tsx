import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/page-shell";
import ui from "@/components/ui.module.css";
import { saveName, saveNameFormAction } from "@/features/auth/actions";
import { EmailAccessForm } from "@/features/auth/components/email-access-form";
import { NameForm } from "@/features/auth/components/name-form";
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
  const session = await getSession();
  const t = await getTranslations("auth");

  if (session) {
    if (session.user.name) redirect(returnTo);
    // Signed in without a name (new account via magic link, Flow H.5 3a): name step first.
    return (
      <PageShell homeHref="/" languageSwitch={<LanguageSwitch />}>
        <div className={ui.stack}>
          <h1>{t("loginTitle")}</h1>
          <NameForm action={saveNameFormAction.bind(null, returnTo)} />
        </div>
      </PageShell>
    );
  }

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
