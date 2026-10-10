"use client";

import Link from "next/link";
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
  /** Date of the last change after submitting, formatted for the viewer («12. Mai»). */
  changedOn?: string | undefined;
  comment?: string | null | undefined;
}

export interface PlaceholderItem {
  id: string;
  displayName: string;
}

interface MemberListProps {
  members: MemberItem[];
  /** Open placeholders (F-007) – «fehlt noch», managed on /invite by the organiser. */
  placeholders?: PlaceholderItem[] | undefined;
  /** Organiser only: where placeholders are managed. */
  manageHref?: string | undefined;
  phase: UiPhase;
  context: TripSheetContext;
}

/** From 6 entries on the list folds to 5 + «Alle n anzeigen» (W07). */
const COLLAPSE_FROM = 6;
const COLLAPSED_COUNT = 5;

/**
 * «Wer ist dabei?» (F-007, W07): avatar, name, «Orga» chip, status with symbol AND text
 * («○ noch offen» / «✓ abgegeben · 12. Mai»), the optional comment, then the open
 * placeholders («Platzhalter · fehlt noch»). The organiser gets «⋯» per member → make
 * organiser, remove (Flow J); placeholders are managed on the invite page (W06).
 */
export function MemberList({
  members,
  placeholders = [],
  manageHref,
  phase,
  context,
}: MemberListProps) {
  const t = useTranslations("trip");
  const id = useId();
  const [expanded, setExpanded] = useState(false);
  const [step, setStep] = useState<SheetStep | null>(null);
  const collapsible = members.length >= COLLAPSE_FROM;
  const visible = collapsible && !expanded ? members.slice(0, COLLAPSED_COUNT) : members;

  return (
    <section className={styles.section} aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className={styles.title}>
        {placeholders.length > 0
          ? t("membersTitlePlaceholders", {
              count: members.length,
              placeholders: placeholders.length,
            })
          : t("membersTitle", { count: members.length })}
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
                        ? phase === "vote"
                          ? t("status.voted")
                          : member.changedOn
                            ? t("status.submittedOn", { date: member.changedOn })
                            : t("status.submitted")
                        : t("status.open")}
                    </span>
                  </span>
                ) : null}
                {member.comment ? (
                  <span className={styles.comment}>
                    <Icon
                      name="comment"
                      size={14}
                      label={t("commentOf", { name: member.displayName })}
                    />
                    <q>{member.comment}</q>
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
        {placeholders.map((placeholder) => (
          <li key={placeholder.id} className={styles.row}>
            <Avatar id={placeholder.id} name={placeholder.displayName} open />
            <span className={styles.who}>
              <span className={styles.line}>
                <span className={styles.name}>{placeholder.displayName}</span>
              </span>
              <span className={styles.status}>
                <Icon name="user" size={16} />
                <span>{t("status.placeholder")}</span>
              </span>
            </span>
            {context.isOrganizer && manageHref ? (
              <Link className={styles.manage} href={manageHref}>
                {t("placeholderManage")}
              </Link>
            ) : null}
          </li>
        ))}
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
