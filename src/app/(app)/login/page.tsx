import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Illustration } from "@/components/illustrations/illustration";
import { PageShell } from "@/components/page-shell";
import { saveName, saveNameFormAction } from "@/features/auth/actions";
import { EmailAccessForm } from "@/features/auth/components/email-access-form";
import { NameForm } from "@/features/auth/components/name-form";
import { toSafeInternalPath } from "@/lib/safe-path";
import { getSession } from "@/server/session";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth");
  return { title: t("loginTitle") };
}

/** W02 – sign in / sign up (e-mail → code → name). */
export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;
  const t = await getTranslations("auth");
  const returnTo = toSafeInternalPath(typeof next === "string" ? next : undefined, "/trips");
  const session = await getSession();

  if (session) {
    if (session.user.name) redirect(returnTo);
    // Signed in without a name (new account via magic link, Flow H.5 3a): name step first.
    return (
      <PageShell>
        <NameForm action={saveNameFormAction.bind(null, returnTo)} />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <EmailAccessForm
        returnTo={returnTo}
        variant="login"
        // H.1: sent here from a protected page → it continues there afterwards.
        notice={typeof next === "string" ? <p role="note">{t("sessionExpired")}</p> : undefined}
        onNameSubmit={saveName.bind(null, returnTo)}
        // Sign-in stays calm (energy level E0): static illustration.
        codeIllustration={<Illustration name="code-sent" />}
      />
    </PageShell>
  );
}
