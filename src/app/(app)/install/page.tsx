import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/page-shell";
import { markInstallHintSeen } from "@/features/beta/actions";
import { InstallGuide } from "@/features/beta/components/install-guide";
import { toSafeInternalPath } from "@/lib/safe-path";
import { getSession } from "@/server/session";
import styles from "@/features/beta/beta.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("install");
  return { title: t("title") };
}

/**
 * `/install` – «Zum Home-Bildschirm» guide (W23 B) [always available, no sign-in, no personal
 * data]. `first=1`: the one-off step right after sign-up («Später»); otherwise opened from the
 * avatar menu or the help (back link).
 */
export default async function InstallPage({ searchParams }: PageProps<"/install">) {
  const { next: rawNext, first } = await searchParams;
  const session = await getSession();
  const fallback = session ? "/trips" : "/";
  const next = toSafeInternalPath(typeof rawNext === "string" ? rawNext : undefined, fallback);
  const [t, tApp] = await Promise.all([getTranslations("common"), getTranslations("app")]);
  const isFirst = first === "1";
  return (
    <PageShell>
      {isFirst ? null : (
        <Link className={styles.back} href={next}>
          <Icon name="arrow-left" size={20} />
          {t("back")}
        </Link>
      )}
      <InstallGuide
        product={tApp("name")}
        first={isFirst}
        finish={markInstallHintSeen.bind(null, next)}
      />
    </PageShell>
  );
}
