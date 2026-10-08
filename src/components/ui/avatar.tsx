import { avatarTone, initials } from "@/lib/avatar";
import { cx } from "@/lib/cx";
import styles from "./avatar.module.css";
import { Icon } from "./icon";

export type AvatarSize = "sm" | "md" | "lg";

interface AvatarProps {
  /** Stable member id → pastel tone. */
  id: string;
  name?: string | undefined;
  size?: AvatarSize | undefined;
  /** Crown badge (always together with the text "Orga" in lists). */
  organizer?: boolean | undefined;
  /** Not submitted yet: dashed, transparent. */
  open?: boolean | undefined;
  /** Submitted: small mint seal. */
  submitted?: boolean | undefined;
  /** Invite card: neutral dot without initials (privacy, F-003). */
  anonymous?: boolean | undefined;
  className?: string | undefined;
}

/** Decorative avatar (the name always stands as text nearby) – design-system §9.17. */
export function Avatar({
  id,
  name = "",
  size = "md",
  organizer = false,
  open = false,
  submitted = false,
  anonymous = false,
  className,
}: AvatarProps) {
  return (
    <span
      className={cx(styles.avatar, styles[size], open && styles.open, className)}
      style={open ? undefined : { background: `var(--ww-avatar-${avatarTone(id)})` }}
      aria-hidden="true"
    >
      {anonymous ? null : initials(name)}
      {organizer ? (
        <span className={styles.crown}>
          <Icon name="crown" size={11} />
        </span>
      ) : null}
      {submitted ? (
        <span className={styles.seal}>
          <Icon name="check" size={10} />
        </span>
      ) : null}
    </span>
  );
}

interface AvatarStackProps {
  members: { id: string; name?: string | undefined }[];
  max?: number | undefined;
  size?: AvatarSize | undefined;
  anonymous?: boolean | undefined;
  /** Dashed "+1" circle for "you" (invite card). */
  plusOne?: boolean | undefined;
  className?: string | undefined;
}

/** Overlapping avatars, max 5 + "+n" pill (design-system §9.17). Decorative. */
export function AvatarStack({
  members,
  max = 5,
  size = "md",
  anonymous = false,
  plusOne = false,
  className,
}: AvatarStackProps) {
  const shown = members.slice(0, max);
  const rest = members.length - shown.length;
  return (
    <span className={cx(styles.stack, className)} aria-hidden="true">
      {shown.map((member) => (
        <Avatar
          key={member.id}
          id={member.id}
          name={member.name}
          size={size}
          anonymous={anonymous}
        />
      ))}
      {rest > 0 ? (
        <span className={cx(styles.avatar, styles[size], styles.more)}>{`+${String(rest)}`}</span>
      ) : null}
      {plusOne ? (
        <span className={cx(styles.avatar, styles[size], styles.plusOne)}>{"+1"}</span>
      ) : null}
    </span>
  );
}
