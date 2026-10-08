import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/page-shell";
import ui from "@/components/ui.module.css";
import { LanguageSwitch } from "@/features/locale/language-switch";
import { toSafeInternalPath } from "@/lib/safe-path";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("magic");
  return { title: t("title") };
}

/**
 * Landing page of the magic link in the mail (`/auth/magic?token=…&next=…`).
 * The token is only consumed when the person taps the button – link scanners in
 * mail clients (which prefetch URLs) can't burn it. See docs/ops/spike-auth.md.
 */
export default async function MagicLinkPage({ searchParams }: PageProps<"/auth/magic">) {
  const query = await searchParams;
  const token = typeof query.token === "string" ? query.token : undefined;
  const next = toSafeInternalPath(
    typeof query.next === "string" ? query.next : undefined,
    "/trips",
  );
  const failed = typeof query.error === "string";
  const t = await getTranslations("magic");

  if (!token || failed) {
    return (
      <PageShell homeHref="/" languageSwitch={<LanguageSwitch />}>
        <div className={ui.stack}>
          <h1>{t("title")}</h1>
          <p role="status">{t("invalid")}</p>
          <p>
            <a className={ui.button} href={`/login?next=${encodeURIComponent(next)}`}>
              {t("requestNew")}
            </a>
          </p>
        </div>
      </PageShell>
    );
  }

  const verify = new URLSearchParams({
    token,
    callbackURL: next,
    errorCallbackURL: `/auth/magic?next=${encodeURIComponent(next)}`,
  });

  return (
    <PageShell homeHref="/" languageSwitch={<LanguageSwitch />}>
      <div className={ui.stack}>
        <h1>{t("title")}</h1>
        <p>{t("lead")}</p>
        <p>
          <a className={ui.button} href={`/api/auth/magic-link/verify?${verify.toString()}`}>
            {t("continue")}
          </a>
        </p>
      </div>
    </PageShell>
  );
}
