import { useTranslations } from "next-intl";
import { Icon } from "@/components/ui/icon";
import styles from "../beta.module.css";

const POINTS = ["p1", "p2", "p3", "p4", "p5", "p6"] as const;

/**
 * Short privacy notice of the beta (W23 A.4, texts compliance-checklist §13.6) – a real list,
 * the check glyph is decorative (W23 F). Used on `/beta` step 2 and in the invite way (A.8).
 */
export function PrivacySummary() {
  const t = useTranslations("beta.privacy");
  return (
    <ul className={styles.points}>
      {POINTS.map((point) => (
        <li key={point} className={styles.point}>
          <Icon name="check" size={20} className={styles.pointIcon} />
          <span>{t(point)}</span>
        </li>
      ))}
    </ul>
  );
}
