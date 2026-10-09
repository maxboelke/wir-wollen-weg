import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/page-shell";
import { EmailChangeFlow } from "@/features/account/components/email-change-flow";
import { hasPassword } from "@/server/account";
import { getSession } from "@/server/session";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("account.email");
  return { title: t("title") };
}

/** W13 «E-Mail ändern» (Flow I.2): confirm it's you → new address → code to the new address. */
export default async function ChangeEmailPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/account/email");
  return (
    <PageShell>
      <EmailChangeFlow
        currentEmail={session.user.email}
        canUsePassword={await hasPassword(session.user.id)}
      />
    </PageShell>
  );
}
