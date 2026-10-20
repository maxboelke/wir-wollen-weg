"use client";

import { useTranslations } from "next-intl";
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Checkbox } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import type { Locale } from "@/i18n/config";
import { DISTANCE, DURATION, enter } from "@/lib/motion";
import { NAMES_TOKEN, rowTarget, type RemindTarget } from "@/lib/remind";
import { nameList } from "../format";
import type { RemindPersonView, RemindSheetData } from "../remind-types";
import { PersonRow } from "./person-row";
import { RemindMessage } from "./remind-message";
import styles from "./remind-sheet.module.css";

interface RemindContextValue {
  data: RemindSheetData;
  open: (target: RemindTarget) => void;
  /** «Abstimmen»: votes change while the page is open – move people between the groups. */
  syncVoted: (names: readonly string[]) => void;
}

const RemindContext = createContext<RemindContextValue | null>(null);

/** Remind sheet of the current trip page – null in phase 3/past (no reminders). */
export function useRemind(): RemindContextValue | null {
  return use(RemindContext);
}

/**
 * One remind sheet per trip page (ux-spec §14.2): every entry point – KPI box, «Nächster
 * Schritt», person rows, trip menu, «Basiert auf …», «Wer hat abgestimmt?» – opens the same
 * sheet in the step it needs. Texts come ready from the server (both languages).
 */
export function RemindProvider({
  data,
  children,
}: {
  data: RemindSheetData | null;
  children: ReactNode;
}) {
  const [target, setTarget] = useState<RemindTarget | null>(null);
  const [voted, setVoted] = useState<readonly string[] | null>(null);
  const [lastData, setLastData] = useState(data);
  if (lastData !== data) {
    // Server refresh: its data is the truth again.
    setLastData(data);
    setVoted(null);
  }
  const syncVoted = useCallback((names: readonly string[]) => {
    setVoted(names);
  }, []);
  const effective = useMemo(
    () => (data && voted && data.phase === "vote" ? withVoted(data, voted) : data),
    [data, voted],
  );
  const value = useMemo(
    () => (effective ? { data: effective, open: setTarget, syncVoted } : null),
    [effective, syncVoted],
  );
  return (
    <RemindContext value={value}>
      {children}
      {effective ? (
        <RemindSheet
          data={effective}
          target={target}
          onTarget={setTarget}
          onClose={() => {
            setTarget(null);
          }}
        />
      ) : null}
    </RemindContext>
  );
}

/** Moves people between «Fehlt noch» and «Abgestimmt» after votes in the open page. */
function withVoted(data: RemindSheetData, voted: readonly string[]): RemindSheetData {
  const names = new Set(voted);
  const everyone = [...data.open, ...data.done];
  const doneStatus = data.done[0]?.status;
  const openStatus = data.open.find((p) => !p.done)?.status;
  const open = everyone
    .filter((p) => !names.has(p.name))
    .map((p) => (p.done ? { ...p, done: false, status: openStatus ?? p.status } : p));
  const done = everyone
    .filter((p) => names.has(p.name))
    .map((p) => (p.done ? p : { ...p, done: true, texts: null, status: doneStatus ?? p.status }));
  const me = open.filter((p) => p.me);
  return {
    ...data,
    open: [...open.filter((p) => !p.me), ...me],
    done,
    progress: { done: done.length, total: everyone.length },
  };
}

interface Shown {
  target: RemindTarget;
  /** Opened from the list → «‹» goes back and focuses the row button again. */
  fromStatus: boolean;
}

function RemindSheet({
  data,
  target,
  onTarget,
  onClose,
}: {
  data: RemindSheetData;
  target: RemindTarget | null;
  onTarget: (target: RemindTarget) => void;
  onClose: () => void;
}) {
  const t = useTranslations("remind");
  const tCommon = useTranslations("common");
  const [shown, setShown] = useState<Shown>({ target: { step: "status" }, fromStatus: false });
  const [lastTarget, setLastTarget] = useState<RemindTarget | null>(null);
  // The list stays out of the DOM until the sheet is opened once (no duplicate names/texts
  // in the page while it is closed).
  const [opened, setOpened] = useState(false);
  if (target && !opened) setOpened(true);
  const returnKey = useRef<string | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const direction = useRef<0 | 1 | -1>(0);
  if (target !== lastTarget) {
    setLastTarget(target);
    if (target) {
      // A new open from outside: no history. Steps inside the sheet go through `go`.
      if (lastTarget === null) setShown({ target, fromStatus: false });
    }
  }

  const go = (next: RemindTarget, key?: string) => {
    direction.current = 1;
    returnKey.current = key ?? null;
    setShown({ target: next, fromStatus: shown.target.step === "status" });
    onTarget(next);
  };
  const back = () => {
    direction.current = -1;
    setShown({ target: { step: "status" }, fromStatus: false });
    onTarget({ step: "status" });
  };

  // Step change: content glides in reading direction + fade (W09-08 like); reduced: fade.
  const stepKey = stepId(shown.target);
  useLayoutEffect(() => {
    const dir = direction.current;
    direction.current = 0;
    if (dir === 0) return;
    enter(bodyRef.current, { x: dir * DISTANCE.lg, duration: DURATION.base });
  }, [stepKey]);

  // «‹» puts the focus back on the row button that opened the step (§14.2 a11y).
  useEffect(() => {
    const key = returnKey.current;
    if (shown.target.step !== "status" || !key) return;
    returnKey.current = null;
    bodyRef.current?.querySelector<HTMLElement>(`[data-remind-row="${CSS.escape(key)}"]`)?.focus();
  }, [shown.target.step]);

  const person = (key: string | undefined) =>
    key ? [...data.open, ...data.done].find((p) => p.key === key) : undefined;
  const current = shown.target;
  const subject = "key" in current ? person(current.key) : undefined;
  const title = (() => {
    switch (current.step) {
      case "status":
        return t(data.phase === "vote" ? "titleVote" : "titleCollect");
      case "single":
        return t("remindName", { name: subject?.name ?? "" });
      case "all":
        return t("allTitle");
      case "orga":
        return subject
          ? t("placeholderTitle", { name: subject.name })
          : t("orgaTitle", { orga: data.orgaName });
    }
  })();
  const candidates = data.open.filter((p) => p.kind === "member" && !p.me && p.texts);

  return (
    <BottomSheet
      open={target !== null}
      onClose={onClose}
      title={title}
      closeLabel={tCommon("close")}
      focusKey={stepKey}
      back={
        shown.fromStatus && current.step !== "status"
          ? { label: t("back"), onClick: back }
          : undefined
      }
      footer={
        opened && current.step === "status" && candidates.length >= 2 ? (
          <Button
            variant="secondary"
            size="md"
            block
            icon="remind"
            onClick={() => {
              go({ step: "all" });
            }}
          >
            {t("remindAll", { count: candidates.length })}
          </Button>
        ) : undefined
      }
    >
      <div ref={bodyRef} className={styles.body} data-remind-step={current.step}>
        {!opened ? null : current.step === "status" ? (
          <StatusStep data={data} onGo={go} />
        ) : current.step === "single" && subject ? (
          <SingleStep data={data} person={subject} />
        ) : current.step === "all" ? (
          <AllStep data={data} candidates={candidates} />
        ) : current.step === "orga" ? (
          <OrgaStep data={data} person={subject} />
        ) : null}
      </div>
    </BottomSheet>
  );
}

function stepId(target: RemindTarget): string {
  return target.step + ("key" in target && target.key ? `:${target.key}` : "");
}

function StatusStep({
  data,
  onGo,
}: {
  data: RemindSheetData;
  onGo: (target: RemindTarget, key?: string) => void;
}) {
  const t = useTranslations("remind");
  const tTrip = useTranslations("trip");
  const id = useId();
  const voting = data.phase === "vote";
  const row = (person: RemindPersonView) => {
    let action: ReactNode = null;
    if (!person.done && person.me) {
      action = (
        <ButtonLink href={data.ownHref} variant="secondary" size="sm">
          {tTrip(voting ? "nextAction.vote" : "nextAction.addDates")}
        </ButtonLink>
      );
    } else if (!person.done && (person.texts || person.orgaTexts)) {
      action = (
        <Button
          variant="secondary"
          size="sm"
          icon="remind"
          aria-label={t("remindName", { name: person.name })}
          data-remind-row={person.key}
          onClick={() => {
            onGo(rowTarget({ ...person }, data.isOrganizer), person.key);
          }}
        >
          {t("remind")}
        </Button>
      );
    }
    return (
      <PersonRow
        key={person.key}
        avatarId={person.key}
        name={person.name}
        youLabel={person.me ? tTrip("you") : null}
        orgaLabel={person.organizer ? tTrip("organizer") : null}
        state={person.done ? "done" : "open"}
        status={person.status}
        actions={action}
      />
    );
  };
  return (
    <>
      <p className={styles.muted}>
        {tTrip(voting ? "kpiVoted" : "kpiSubmitted", {
          done: data.progress.done,
          total: data.progress.total,
        })}
      </p>
      {data.open.length > 0 ? (
        <section className={styles.group} aria-labelledby={`${id}-open`}>
          <h3 id={`${id}-open`} className={styles.groupTitle}>
            {tTrip("groupOpen", { count: data.open.length })}
          </h3>
          <ul className={styles.list}>{data.open.map(row)}</ul>
        </section>
      ) : null}
      {data.done.length > 0 ? (
        <section className={styles.group} aria-labelledby={`${id}-done`}>
          <h3 id={`${id}-done`} className={styles.groupTitle}>
            {tTrip(voting ? "groupVoted" : "groupSubmitted", { count: data.done.length })}
          </h3>
          <ul className={styles.list}>{data.done.map(row)}</ul>
        </section>
      ) : null}
    </>
  );
}

function Context({ person, text }: { person: RemindPersonView; text: string }) {
  return (
    <div className={styles.context}>
      <PersonRow
        avatarId={person.key}
        name={person.name}
        state="open"
        status={text}
        orgaLabel={null}
      />
    </div>
  );
}

function SingleStep({ data, person }: { data: RemindSheetData; person: RemindPersonView }) {
  const t = useTranslations("remind");
  if (!person.texts) return null;
  const context =
    person.kind === "placeholder"
      ? t("contextPlaceholder", { name: person.name })
      : t(data.phase === "vote" ? "contextVote" : "contextCollect", { name: person.name });
  return (
    <>
      <ul className={styles.list}>
        <Context person={person} text={context} />
      </ul>
      <RemindMessage
        texts={person.texts}
        defaultLocale={data.defaultLocale}
        footer={t("footer", { name: person.name })}
      />
    </>
  );
}

function OrgaStep({
  data,
  person,
}: {
  data: RemindSheetData;
  person: RemindPersonView | undefined;
}) {
  const t = useTranslations("remind");
  const texts = person ? person.orgaTexts : data.nudge;
  if (!texts) return null;
  return (
    <>
      {person ? <p>{t("placeholderText", { name: person.name, orga: data.orgaName })}</p> : null}
      <RemindMessage
        texts={texts}
        defaultLocale={data.defaultLocale}
        footer={t("footer", { name: data.orgaName })}
      />
    </>
  );
}

function AllStep({ data, candidates }: { data: RemindSheetData; candidates: RemindPersonView[] }) {
  const t = useTranslations("remind");
  const tTrip = useTranslations("trip");
  const id = useId();
  const [picked, setPicked] = useState<ReadonlySet<string>>(
    () => new Set(candidates.map((p) => p.key)),
  );
  const names = candidates.filter((p) => picked.has(p.key)).map((p) => p.name);
  const texts = useMemo(() => {
    const build = (locale: Locale) => {
      const template = data.all[locale];
      const list = nameList(names, locale, (count) => template.more.replace("#", String(count)));
      return (names.length === 1 ? template.one : template.many).replace(NAMES_TOKEN, list);
    };
    return { de: build("de"), en: build("en") };
    // names is derived from `picked` – recompute when the selection changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [picked, data.all]);
  const placeholders = data.open.filter((p) => p.kind === "placeholder");
  const placeholderNames = nameList(
    placeholders.map((p) => p.name),
    data.defaultLocale,
    (count) => tTrip("kpiMore", { count }),
  );
  return (
    <>
      <fieldset className={styles.picks}>
        <legend className={styles.groupTitle}>{t("allLegend")}</legend>
        {candidates.map((person) => (
          <Checkbox
            key={person.key}
            id={`${id}-${person.key}`}
            label={person.name}
            checked={picked.has(person.key)}
            onChange={(event) => {
              const next = new Set(picked);
              if (event.target.checked) next.add(person.key);
              else next.delete(person.key);
              setPicked(next);
            }}
          />
        ))}
      </fieldset>
      {placeholders.length > 0 ? (
        <p className={styles.note}>
          <Icon name="info" size={18} />
          <span>
            {data.isOrganizer
              ? t("allPlaceholdersOrga", { names: placeholderNames, count: placeholders.length })
              : t("allPlaceholdersMember", {
                  names: placeholderNames,
                  count: placeholders.length,
                  orga: data.orgaName,
                })}
          </span>
        </p>
      ) : null}
      <RemindMessage
        texts={texts}
        defaultLocale={data.defaultLocale}
        footer={t("footerAll")}
        blockedReason={names.length === 0 ? t("allNone") : null}
      />
    </>
  );
}

/**
 * Button that opens the remind sheet (Nächster Schritt, rows, «Basiert auf …»). Renders
 * nothing when the page has no remind sheet (phase 3/past).
 */
export function RemindButton({
  target,
  children,
  variant = "secondary",
  size = "md",
  icon,
  label,
  rowKey,
}: {
  target: RemindTarget;
  children: ReactNode;
  variant?: "primary" | "secondary" | "text" | undefined;
  size?: "sm" | "md" | "lg" | undefined;
  icon?: "remind" | undefined;
  /** Accessible name when the visible label is short («Kemal erinnern»). */
  label?: string | undefined;
  rowKey?: string | undefined;
}) {
  const remind = useRemind();
  if (!remind) return null;
  return (
    <Button
      variant={variant}
      size={size}
      icon={icon}
      aria-label={label}
      aria-haspopup="dialog"
      data-remind-row={rowKey}
      onClick={() => {
        remind.open(target);
      }}
    >
      {children}
    </Button>
  );
}

/**
 * KPI box as a button (ux-spec §14.2, U-18): the whole box opens the list «Wer hat
 * eingetragen?» while somebody is open – one target, no button in the button.
 */
export function RemindKpiButton({ label, children }: { label: string; children: ReactNode }) {
  const remind = useRemind();
  if (!remind) return <>{children}</>;
  return (
    <button
      type="button"
      className={styles.kpiButton}
      aria-haspopup="dialog"
      aria-label={label}
      data-kpi-button=""
      onClick={() => {
        remind.open({ step: "status" });
      }}
    >
      {children}
    </button>
  );
}
