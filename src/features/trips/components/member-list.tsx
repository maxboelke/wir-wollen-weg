"use client";

import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { cx } from "@/lib/cx";
import type { UiPhase } from "@/lib/trip-status";
import { OrgaChip } from "./orga-chip";
import styles from "./member-list.module.css";
import { TripSheet, type SheetMember, type SheetStep, type TripSheetContext } from "./trip-sheet";

export interface MemberItem extends SheetMember {
  submitted: boolean;
  voted: boolean;
}

interface MemberListProps {
  members: MemberItem[];
  phase: UiPhase;
  context: TripSheetContext;
}

/** From 6 entries on the list folds to 5 + «Alle n anzeigen» (W07). */
const COLLAPSE_FROM = 6;
const COLLAPSED_COUNT = 5;

/**
 * «Wer ist dabei?» (F-007, W07): avatar, name, «Orga» chip, status with symbol AND text
 * («○ noch offen» / «✓ abgegeben»). The organiser gets «⋯» per member → make organiser,
 * remove (Flow J). Status in phase 1 without availability (Increment 3): everyone open.
 */
export function MemberList({ members, phase, context }: MemberListProps) {
  const t = useTranslations("trip");
  const id = useId();
  const [expanded, setExpanded] = useState(false);
  const [step, setStep] = useState<SheetStep | null>(null);
  const collapsible = members.length >= COLLAPSE_FROM;
  const visible = collapsible && !expanded ? members.slice(0, COLLAPSED_COUNT) : members;

  return (
    <section className={styles.section} aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className={styles.title}>
        {t("membersTitle", { count: members.length })}
      </h2>
      <ul id={`${id}-list`} className={styles.list}>
        {visible.map((member) => {
          const done = phase === "vote" ? member.voted : member.submitted;
          const showStatus = phase === "collect" || phase === "vote";
          const isMe = member.userId === context.myUserId;
          return (
            <li key={member.userId} className={styles.row}>
              <Avatar
                id={member.userId}
                name={member.displayName}
                organizer={member.role === "organizer"}
                open={showStatus && !done}
                submitted={showStatus && done}
              />
              <span className={styles.who}>
                <span className={styles.line}>
                  <span className={styles.name}>
                    {member.displayName}
                    {isMe ? <span className={styles.you}>{` (${t("you")})`}</span> : null}
                  </span>
                  {member.role === "organizer" ? <OrgaChip label={t("organizer")} /> : null}
                </span>
                {showStatus ? (
                  <span className={cx(styles.status, done && styles.done)}>
                    <Icon name={done ? "check" : "clock"} size={16} />
                    <span>
                      {done
                        ? t(phase === "vote" ? "status.voted" : "status.submitted")
                        : t("status.open")}
                    </span>
                  </span>
                ) : null}
              </span>
              {context.isOrganizer && !isMe ? (
                <button
                  type="button"
                  className={styles.more}
                  aria-label={t("memberActions", { name: member.displayName })}
                  aria-haspopup="dialog"
                  onClick={() => {
                    setStep({ kind: "member", member });
                  }}
                >
                  <Icon name="more" size={20} />
                </button>
              ) : null}
            </li>
          );
        })}
      </ul>
      {collapsible ? (
        <button
          type="button"
          className={styles.toggle}
          aria-expanded={expanded}
          aria-controls={`${id}-list`}
          onClick={() => {
            setExpanded((value) => !value);
          }}
        >
          {expanded ? t("showLess") : t("showAll", { count: members.length })}
          <Icon name="chevron-down" size={18} className={styles.chevron} />
        </button>
      ) : null}
      <TripSheet
        {...context}
        step={step}
        onStep={setStep}
        onClose={() => {
          setStep(null);
        }}
      />
    </section>
  );
}
