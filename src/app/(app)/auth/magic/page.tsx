import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Illustration } from "@/components/illustrations/illustration";
import { MagicLinkForm } from "@/features/auth/components/magic-link-form";
import { inviteTokenFromPath, toSafeInternalPath } from "@/lib/safe-path";
import { getSession } from "@/server/session";
import { findTripByInviteToken } from "@/server/trips";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("magic");
  return { title: t("title") };
}

/**
 * Landing page of the magic link in the mail (`/auth/magic?token=…&next=…`, Flow H.5, R-006).
 * GET only renders the page – the token is neither checked nor consumed (mail scanners
 * prefetch links). "Sign in now" redeems it by POST (Server Action `redeemMagicLink`).
 */
export default async function MagicLinkPage({ searchParams }: PageProps<"/auth/magic">) {
  const query = await searchParams;
  const token = typeof query.token === "string" ? query.token : "";
  const next = toSafeInternalPath(
    typeof query.next === "string" ? query.next : undefined,
    "/trips",
  );
  const inviteToken = inviteTokenFromPath(next);
  const [trip, session] = await Promise.all([
    inviteToken ? findTripByInviteToken(inviteToken) : undefined,
    getSession(),
  ]);
  const requestNewHref = inviteToken
    ? `/i/${inviteToken}`
    : `/login?next=${encodeURIComponent(next)}`;

  return (
    <MagicLinkForm
      token={token}
      next={next}
      requestNewHref={requestNewHref}
      tripName={trip?.name}
      signedInAs={session ? session.user.name || session.user.email : undefined}
      illustration={<Illustration name={trip ? "invite" : "code-sent"} />}
    />
  );
}
