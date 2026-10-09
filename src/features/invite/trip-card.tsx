import { getTranslations } from "next-intl/server";
import { Illustration } from "@/components/illustrations/illustration";
import { AvatarStack } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import styles from "./trip-card.module.css";

interface TripCardProps {
  tripId: string;
  name: string;
  organizerFirstName?: string | undefined;
  memberCount: number;
}

/**
 * Invite "trip card" (W03, design-system §9.6, D-25): Indigo gradient + evening-sun motif,
 * text only top left; neutral avatar dots WITHOUT initials (privacy, F-003) + "+1" for you.
 */
export async function TripCard({ tripId, name, organizerFirstName, memberCount }: TripCardProps) {
  const t = await getTranslations("invite");
  const dots = Array.from({ length: Math.min(memberCount, 5) }, (_, i) => ({
    id: `${tripId}:${i}`,
  }));
  return (
    <article className={styles.card} aria-labelledby="trip-heading">
      <Illustration name="trip-card-motif" className={styles.motif} />
      <div className={styles.content}>
        <p className={styles.label}>
          <Icon name="plane" size={16} className={styles.plane} />
          <span>{t("groupTrip")}</span>
        </p>
        <h1 id="trip-heading" className={styles.name}>
          {name}
        </h1>
        {organizerFirstName ? (
          <p className={styles.by}>{t("byOrganizer", { name: organizerFirstName })}</p>
        ) : null}
        <div className={styles.people}>
          <AvatarStack members={dots} size="sm" anonymous plusOne className={styles.dots} />
          <span>
            {memberCount === 1 && organizerFirstName
              ? t("memberCountOne", { name: organizerFirstName })
              : t("memberCount", { count: memberCount })}
          </span>
        </div>
      </div>
    </article>
  );
}
