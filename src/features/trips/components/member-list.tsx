"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import { ButtonLink } from "@/components/ui/button-link";
import { Icon } from "@/components/ui/icon";
import { remindGroups, rowTarget, type RemindPerson } from "@/lib/remind";
import type { UiPhase } from "@/lib/trip-status";
import styles from "./member-list.module.css";
import { PersonRow } from "./person-row";
import { RemindButton } from "./remind-sheet";
import { TripSheet, type SheetMember, type SheetStep, type TripSheetContext } from "./trip-sheet";

export interface MemberItem extends SheetMember {
  submitted: boolean;
  voted: boolean;
  /** Date of the last change after adding the dates, formatted for the viewer («12. Mai»). */
  changedOn?: string | undefined;
  comment?: string | null | undefined;
}

export interface PlaceholderItem {
  id: string;
  displayName: string;
}

interface MemberListProps {
  members: MemberItem[];
  /** Open placeholders (F-007) – «noch nicht beigetreten», managed on /invite by the organiser. */
  placeholders?: PlaceholderItem[] | undefined;
  /** Organiser only: where placeholders are managed (A4). */
  manageHref?: string | undefined;
  phase: UiPhase;
  /** Own row in «Fehlt noch»: «Tage eintragen» / «Abstimmen». */
  ownHref?: string | undefined;
  context: TripSheetContext;
}

/** «Eingetragen» folds from 6 people on to 5 + «Alle n anzeigen» (W07). */
const COLLAPSE_FROM = 6;
const COLLAPSED_COUNT = 5;

/**
 * «Wer ist dabei?» (F-007, W07, ux-spec §14.2). Phase 1/2: grouped «Fehlt noch» (always in
 * full, with [Erinnern] per person – everyone may remind) and «Eingetragen» / «Abgestimmt».
 * Phase 3 / past: plain list without status. The organiser keeps «⋯» per member (Flow J).
 */
export function MemberList({
  members,
  placeholders = [],
  manageHref,
  phase,
  ownHref,
  context,
}: MemberListProps) {
  const t = useTranslations("trip");
  const tRemind = useTranslations("remind");
  const id = useId();
  const [expanded, setExpanded] = useState(false);
  const [step, setStep] = useState<SheetStep | null>(null);
  const byId = new Map(members.map((m) => [m.userId, m]));
  const grouped = phase === "collect" || phase === "vote" ? phase : null;

  const moreButton = (member: MemberItem | undefined) =>
    member && context.isOrganizer && member.userId !== context.myUserId ? (
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
    ) : null;

  const comment = (member: MemberItem | undefined) =>
    member?.comment && member.submitted ? (
      <span className={styles.comment}>
        <Icon name="comment" size={14} label={t("commentOf", { name: member.displayName })} />
        <q>{member.comment}</q>
      </span>
    ) : null;

  const statusOf = (person: RemindPerson): string => {
    if (person.kind === "placeholder") return t("status.placeholder");
    if (!person.done) return t(grouped === "vote" ? "status.openVote" : "status.openCollect");
    if (grouped === "vote") return t("status.voted");
    const changedOn = byId.get(person.key)?.changedOn;
    return changedOn ? t("status.submittedOn", { date: changedOn }) : t("status.submitted");
  };

  const row = (person: RemindPerson, withStatus: boolean) => {
    const member = byId.get(person.key);
    let remind = null;
    if (withStatus && !person.done) {
      remind = person.me ? (
        ownHref ? (
          <ButtonLink href={ownHref} variant="secondary" size="sm">
            {t(grouped === "vote" ? "nextAction.vote" : "nextAction.addDates")}
          </ButtonLink>
        ) : null
      ) : (
        <RemindButton
          target={rowTarget(person, context.isOrganizer)}
          size="sm"
          icon="remind"
          label={tRemind("remindName", { name: person.name })}
          rowKey={person.key}
        >
          {tRemind("remind")}
        </RemindButton>
      );
    }
    const more = moreButton(member);
    return (
      <PersonRow
        key={person.key}
        avatarId={person.key}
        name={person.name}
        youLabel={person.me ? t("you") : null}
        orgaLabel={person.organizer ? t("organizer") : null}
        state={withStatus ? (person.done ? "done" : "open") : null}
        status={withStatus ? statusOf(person) : undefined}
        extra={comment(member)}
        actions={
          remind || more ? (
            <>
              {remind}
              {more}
            </>
          ) : null
        }
      />
    );
  };

  const people = members.map((m) => ({
    key: m.userId,
    name: m.displayName,
    kind: "member" as const,
    organizer: m.role === "organizer",
    done: grouped === "vote" ? m.voted : m.submitted,
  }));
  const placeholderPeople = placeholders.map((p) => ({
    key: p.id,
    name: p.displayName,
    kind: "placeholder" as const,
    organizer: false,
    done: false,
  }));

  const toggle = (count: number, controls: string) => (
    <button
      type="button"
      className={styles.toggle}
      aria-expanded={expanded}
      aria-controls={controls}
      onClick={() => {
        setExpanded((value) => !value);
      }}
    >
      {expanded ? t("showLess") : t("showAll", { count })}
      <Icon name="chevron-down" size={18} className={styles.chevron} />
    </button>
  );

  let body;
  if (grouped) {
    const groups = remindGroups(grouped, people, placeholderPeople, context.myUserId);
    const collapsible = groups.done.length >= COLLAPSE_FROM;
    const visibleDone =
      collapsible && !expanded ? groups.done.slice(0, COLLAPSED_COUNT) : groups.done;
    // Phase 2 lists members only; open placeholders stay visible below (W07).
    const separatePlaceholders = grouped === "vote" ? placeholderPeople : [];
    body = (
      <>
        {groups.open.length > 0 ? (
          <section className={styles.group} aria-labelledby={`${id}-open`}>
            <h3 id={`${id}-open`} className={styles.groupTitle}>
              {t("groupOpen", { count: groups.open.length })}
            </h3>
            <ul className={styles.list}>{groups.open.map((p) => row(p, true))}</ul>
          </section>
        ) : null}
        {groups.done.length > 0 ? (
          <section className={styles.group} aria-labelledby={`${id}-done`}>
            <h3 id={`${id}-done`} className={styles.groupTitle}>
              {t(grouped === "vote" ? "groupVoted" : "groupSubmitted", {
                count: groups.done.length,
              })}
            </h3>
            <ul id={`${id}-done-list`} className={styles.list}>
              {visibleDone.map((p) => row(p, true))}
            </ul>
            {collapsible ? toggle(groups.done.length, `${id}-done-list`) : null}
          </section>
        ) : null}
        {separatePlaceholders.length > 0 ? (
          <section className={styles.group} aria-labelledby={`${id}-placeholders`}>
            <h3 id={`${id}-placeholders`} className={styles.groupTitle}>
              {t("groupPlaceholders", { count: separatePlaceholders.length })}
            </h3>
            <ul className={styles.list}>
              {separatePlaceholders.map((p) => (
                <PersonRow
                  key={p.key}
                  avatarId={p.key}
                  name={p.name}
                  state="open"
                  status={t("status.placeholder")}
                />
              ))}
            </ul>
          </section>
        ) : null}
      </>
    );
  } else {
    const all = people.map((p) => ({ ...p, me: p.key === context.myUserId }));
    const collapsible = all.length >= COLLAPSE_FROM;
    const visible = collapsible && !expanded ? all.slice(0, COLLAPSED_COUNT) : all;
    body = (
      <>
        <ul id={`${id}-list`} className={styles.list}>
          {visible.map((p) => row(p, false))}
          {placeholderPeople.map((p) => (
            <PersonRow
              key={p.key}
              avatarId={p.key}
              name={p.name}
              state="open"
              status={t("status.placeholder")}
            />
          ))}
        </ul>
        {collapsible ? toggle(all.length, `${id}-list`) : null}
      </>
    );
  }

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
      {body}
      {context.isOrganizer && manageHref && placeholders.length > 0 ? (
        <Link className={styles.manage} href={manageHref}>
          {t("placeholdersManage")}
        </Link>
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
