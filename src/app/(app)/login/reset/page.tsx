import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/page-shell";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";
import { getSession } from "@/server/session";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("reset");
  return { title: t("title") };
}

/** W02 «Passwort vergessen» (Flow H.3): e-mail → code + new password → signed in. */
export default async function ResetPasswordPage({ searchParams }: PageProps<"/login/reset">) {
  if (await getSession()) redirect("/account/password");
  const { email } = await searchParams;
  return (
    <PageShell>
      <ResetPasswordForm initialEmail={typeof email === "string" ? email.slice(0, 254) : ""} />
    </PageShell>
  );
}
