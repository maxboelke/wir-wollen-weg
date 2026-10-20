import type { ReactNode } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { cx } from "@/lib/cx";
import { OrgaChip } from "./orga-chip";
import styles from "./person-row.module.css";

export interface PersonRowProps {
  avatarId: string;
  name: string;
  /** «(du)» / «(you)» after the name – null for other people. */
  youLabel?: string | null | undefined;
  /** «Orga» chip label – only for the organiser. */
  orgaLabel?: string | null | undefined;
  /** null = no status (phase 3 / past). */
  state: "open" | "done" | null;
  status?: string | undefined;
  /** Comment line etc. below the status. */
  extra?: ReactNode;
  /** [Erinnern] / [Tage eintragen] / [⋯] on the right – wraps below the name when narrow. */
  actions?: ReactNode;
}

/**
 * One person in «Wer ist dabei?» and in the remind sheet (ux-spec §14.2, U-19): avatar 40
 * (open: dashed, done: mint seal), name, «Orga» chip, status line with symbol AND text (never
 * colour alone). The avatar is decorative – the name stands as text.
 */
export function PersonRow({
  avatarId,
  name,
  youLabel,
  orgaLabel,
  state,
  status,
  extra,
  actions,
}: PersonRowProps) {
  return (
    <li className={styles.item}>
      <div className={styles.row}>
        <Avatar
          id={avatarId}
          name={name}
          organizer={Boolean(orgaLabel)}
          open={state === "open"}
          submitted={state === "done"}
        />
        <span className={styles.line}>
          <span className={styles.name}>
            {name}
            {youLabel ? <span className={styles.you}>{` (${youLabel})`}</span> : null}
          </span>
          {orgaLabel ? <OrgaChip label={orgaLabel} /> : null}
        </span>
        {actions ? <span className={styles.actions}>{actions}</span> : null}
        {(state && status) || extra ? (
          <span className={styles.below}>
            {state && status ? (
              <span className={cx(styles.status, state === "done" && styles.done)}>
                <Icon name={state === "done" ? "check" : "clock"} size={16} />
                <span>{status}</span>
              </span>
            ) : null}
            {extra}
          </span>
        ) : null}
      </div>
    </li>
  );
}
