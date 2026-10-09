import { Icon } from "@/components/ui/icon";
import styles from "./orga-chip.module.css";

/** «Orga» / «Organizer» chip: crown AND text, never the icon alone (F-004, §9.6). */
export function OrgaChip({ label }: { label: string }) {
  return (
    <span className={styles.orga}>
      <Icon name="crown" size={15} />
      <span>{label}</span>
    </span>
  );
}
