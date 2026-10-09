import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/page-shell";
import { PasswordSettings } from "@/features/account/components/password-settings";
import { hasPassword } from "@/server/account";
import { getSession } from "@/server/session";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("account.password");
  return { title: t("titleSet") };
}

/** W13 «Passwort» (F-042): set or change (≥ 10 characters, leak check) or remove. */
export default async function PasswordPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/account/password");
  return (
    <PageShell>
      <PasswordSettings
        email={session.user.email}
        passwordSet={await hasPassword(session.user.id)}
      />
    </PageShell>
  );
}
