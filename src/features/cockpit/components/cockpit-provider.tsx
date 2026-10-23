"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createContext, use, useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { useToast } from "@/components/ui/toast";
import { PersonRow } from "@/features/trips/components/person-row";
import { RemindMessage } from "@/features/trips/components/remind-message";
import { SharePanel } from "@/features/trips/components/share-panel";
import { announcedAction, withoutAppAction } from "../actions";
import type { CockpitAction, CockpitSheetData, SheetPlaceholder } from "../types";
import styles from "./sheets.module.css";

type Open =
  | { kind: "members" }
  | { kind: "decided" }
  | { kind: "announce" }
  | { kind: "remind"; occasion: "placeholder" | "orga"; keys: string[]; key?: string | undefined };

interface CockpitContextValue {
  data: CockpitSheetData;
  open: (sheet: Open) => void;
  /** Runs a way action (announce sheet, «ohne App» on/off, sheet links). */
  run: (action: CockpitAction) => void;
  pending: boolean;
}

const CockpitContext = createContext<CockpitContextValue | null>(null);

/** Sheets of the phase-3 cockpit – null outside of it (e.g. in the trip menu of other pages). */
export function useCockpit(): CockpitContextValue | null {
  return use(CockpitContext);
}

/**
 * Sheets of the «Reiseverlauf» cockpit (W16 v2.1/v2.8): «Wer ist dabei?», «So habt ihr
 * entschieden», reminders for placeholders (RemindSheet pattern, ux-spec §14.2) and «Allen
 * Bescheid geben» (V1). Wraps head AND content, so the crew button in the ticket, the trip menu
 * and the way open the same sheets. Way actions change the state on the server and reload the
 * page data (stations change their group «beim Neuladen», no re-sort animation – v2.9).
 */
export function CockpitProvider({
  data,
  children,
}: {
  data: CockpitSheetData;
  children: ReactNode;
}) {
  const t = useTranslations("route");
  const tCommon = useTranslations("common");
  const tRemind = useTranslations("remind");
  const tResult = useTranslations("poll.result");
  const router = useRouter();
  const toast = useToast();
  const [sheet, setSheet] = useState<Open | null>(null);
  const [lastSheet, setLastSheet] = useState<Open>({ kind: "members" });
  const [pending, setPending] = useState(false);
  // Sheet bodies stay out of the DOM until a sheet was opened once (no duplicate names).
  const [opened, setOpened] = useState(false);
  const announced = useRef(false);
  if (sheet && sheet !== lastSheet) setLastSheet(sheet);
  if (sheet && !opened) setOpened(true);
  const shown = sheet ?? lastSheet;

  const close = useCallback(() => {
    setSheet(null);
    if (announced.current) {
      // V1 is done now – the way shows it after the reload («beim Neuladen», v2.9).
      announced.current = false;
      router.refresh();
    }
  }, [router]);

  const withoutApp = useCallback(
    (placeholderId: string, name: string, on: boolean) => {
      setPending(true);
      void withoutAppAction(data.publicId, placeholderId, on)
        .then((result) => {
          if (result.ok) {
            toast({ message: t(on ? "toast.withoutApp" : "toast.undone", { name }) });
            router.refresh();
          } else {
            toast({ message: t("toast.error") });
          }
        })
        .catch(() => {
          toast({ message: t("toast.error") });
        })
        .finally(() => {
          setPending(false);
        });
    },
    [data.publicId, router, t, toast],
  );

  const run = useCallback(
    (action: CockpitAction) => {
      switch (action.kind) {
        case "sheet":
          setSheet({ kind: action.sheet });
          return;
        case "announce":
          setSheet({ kind: "announce" });
          return;
        case "withoutApp":
          withoutApp(action.placeholderId, action.name, action.on);
          return;
        case "path":
          router.push(action.href);
      }
    },
    [router, withoutApp],
  );

  const value = useMemo(() => ({ data, open: setSheet, run, pending }), [data, run, pending]);

  const placeholder = (key: string | undefined) => data.placeholders.find((p) => p.id === key);
  const title = (() => {
    switch (shown.kind) {
      case "members":
        return t("members.title", { count: data.members.length });
      case "decided":
        return t("decided.title");
      case "announce":
        return tResult("tellEveryone");
      case "remind": {
        const subject = placeholder(
          shown.key ?? (shown.keys.length === 1 ? shown.keys[0] : undefined),
        );
        if (shown.occasion === "orga") return tRemind("orgaTitle", { orga: data.orgaName });
        return subject ? tRemind("remindName", { name: subject.name }) : t("remind.listTitle");
      }
    }
  })();

  return (
    <CockpitContext value={value}>
      {children}
      <BottomSheet
        open={sheet !== null}
        onClose={close}
        title={title}
        closeLabel={tCommon("close")}
        focusKey={shown.kind + (shown.kind === "remind" ? (shown.key ?? "list") : "")}
        back={
          shown.kind === "remind" && shown.key && shown.keys.length > 1
            ? {
                label: tRemind("back"),
                onClick: () => {
                  setSheet({ ...shown, key: undefined });
                },
              }
            : undefined
        }
      >
        {!opened ? null : (
          <SheetBody
            shown={shown}
            data={data}
            pending={pending}
            onOpen={setSheet}
            onWithoutApp={withoutApp}
            onShared={() => {
              if (announced.current) return;
              announced.current = true;
              void announcedAction(data.publicId);
            }}
          />
        )}
      </BottomSheet>
    </CockpitContext>
  );
}

function SheetBody({
  shown,
  data,
  pending,
  onOpen,
  onWithoutApp,
  onShared,
}: {
  shown: Open;
  data: CockpitSheetData;
  pending: boolean;
  onOpen: (sheet: Open) => void;
  onWithoutApp: (id: string, name: string, on: boolean) => void;
  onShared: () => void;
}) {
  switch (shown.kind) {
    case "members":
      return (
        <MembersBody data={data} pending={pending} onOpen={onOpen} onWithoutApp={onWithoutApp} />
      );
    case "decided":
      return <DecidedBody data={data} />;
    case "announce":
      return data.announce ? (
        <SharePanel
          link={data.announce.link}
          texts={data.announce.texts}
          defaultLocale={data.defaultLocale}
          tripName={data.tripName}
          onShared={onShared}
        />
      ) : null;
    case "remind":
      return <RemindBody shown={shown} data={data} onOpen={onOpen} />;
  }
}

function MembersBody({
  data,
  pending,
  onOpen,
  onWithoutApp,
}: {
  data: CockpitSheetData;
  pending: boolean;
  onOpen: (sheet: Open) => void;
  onWithoutApp: (id: string, name: string, on: boolean) => void;
}) {
  const t = useTranslations("route");
  const tTrip = useTranslations("trip");
  const tRemind = useTranslations("remind");
  return (
    <div className={styles.body}>
      <ul className={styles.people}>
        {data.members.map((person) => (
          <PersonRow
            key={person.key}
            avatarId={person.key}
            name={person.name}
            youLabel={person.me ? tTrip("you") : null}
            orgaLabel={person.organizer ? tTrip("organizer") : null}
            state={null}
            extra={<span className={styles.muted}>{t("members.going")}</span>}
          />
        ))}
        {data.placeholders.map((p) => (
          <PersonRow
            key={p.id}
            avatarId={p.id}
            name={p.name}
            state="open"
            status={
              p.withoutApp
                ? t("members.withoutApp", { orga: data.orgaName })
                : t("members.notJoined")
            }
            extra={
              <span className={styles.chips}>
                <span className={styles.chip}>{t("members.placeholder")}</span>
                {p.withoutApp ? (
                  <span className={styles.chipOk}>{t("members.withoutAppChip")}</span>
                ) : null}
              </span>
            }
            actions={
              data.isOrganizer ? (
                p.withoutApp ? (
                  <Button
                    variant="text"
                    size="sm"
                    aria-disabled={pending || undefined}
                    onClick={() => {
                      onWithoutApp(p.id, p.name, false);
                    }}
                  >
                    {t("v2.undo", { name: p.name })}
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      icon="remind"
                      aria-label={t("v2.remindOneName", { name: p.name })}
                      onClick={() => {
                        onOpen({
                          kind: "remind",
                          occasion: "placeholder",
                          keys: [p.id],
                          key: p.id,
                        });
                      }}
                    >
                      {tRemind("remind")}
                    </Button>
                    <Button
                      variant="text"
                      size="sm"
                      aria-disabled={pending || undefined}
                      onClick={() => {
                        onWithoutApp(p.id, p.name, true);
                      }}
                    >
                      {t("v2.withoutApp", { name: p.name })}
                    </Button>
                  </>
                )
              ) : p.withoutApp ? null : (
                <Button
                  variant="text"
                  size="sm"
                  onClick={() => {
                    onOpen({ kind: "remind", occasion: "orga", keys: [p.id], key: p.id });
                  }}
                >
                  {t("v2.nudgeOrga", { orga: data.orgaName })}
                </Button>
              )
            }
          />
        ))}
      </ul>
      <div className={styles.footer}>
        {data.manageHref ? (
          <Link className={styles.textLink} href={data.manageHref}>
            {t("members.manage")}
          </Link>
        ) : null}
        {data.inviteHref ? (
          <ButtonLink href={data.inviteHref} variant="secondary" size="md" icon="plus" block>
            {tTrip("invite")}
          </ButtonLink>
        ) : null}
      </div>
    </div>
  );
}

function DecidedBody({ data }: { data: CockpitSheetData }) {
  const t = useTranslations("route");
  const { decided } = data;
  return (
    <div className={styles.body}>
      {decided.description ? <p className={styles.quote}>{decided.description}</p> : null}
      <p className={styles.muted}>{decided.fixedBy}</p>
      <p className={styles.range}>{decided.range}</p>
      {decided.noVotes ? (
        <p className={styles.muted}>{t("decided.noVotes")}</p>
      ) : (
        <ul className={styles.places}>
          {decided.places.map((place) => (
            <li key={place.label + place.range} className={styles.place}>
              <span className={place.fixed ? styles.chipSun : styles.chip}>{place.label}</span>
              <span className={styles.placeText}>
                <span>{place.range}</span>
                <span className={styles.muted}>
                  {place.votes}
                  {place.fixed ? ` · ${t("decided.fixed")}` : ""}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
      <div className={styles.links}>
        <ButtonLink href={decided.pollHref} variant="secondary" size="md" icon="vote" block>
          {t("decided.poll")}
        </ButtonLink>
        <ButtonLink href={decided.groupHref} variant="secondary" size="md" icon="calendar" block>
          {t("decided.group")}
        </ButtonLink>
      </div>
      <p className={styles.note}>{decided.searched}</p>
    </div>
  );
}

function RemindBody({
  shown,
  data,
  onOpen,
}: {
  shown: Extract<Open, { kind: "remind" }>;
  data: CockpitSheetData;
  onOpen: (sheet: Open) => void;
}) {
  const t = useTranslations("route");
  const tRemind = useTranslations("remind");
  const people = shown.keys
    .map((key) => data.placeholders.find((p) => p.id === key))
    .filter((p): p is SheetPlaceholder => p !== undefined);
  const subject =
    people.find((p) => p.id === shown.key) ?? (people.length === 1 ? people[0] : undefined);
  if (!subject) {
    return (
      <div className={styles.body}>
        <ul className={styles.people}>
          {people.map((p) => (
            <PersonRow
              key={p.id}
              avatarId={p.id}
              name={p.name}
              state="open"
              status={t("members.notJoined")}
              actions={
                <Button
                  variant="secondary"
                  size="sm"
                  icon="remind"
                  data-remind-row={p.id}
                  aria-label={
                    shown.occasion === "orga"
                      ? t("v2.nudgeOrgaName", {
                          orga: data.orgaName,
                          names: p.name,
                          count: 1,
                        })
                      : t("v2.remindOneName", { name: p.name })
                  }
                  onClick={() => {
                    onOpen({ ...shown, key: p.id });
                  }}
                >
                  {tRemind("remind")}
                </Button>
              }
            />
          ))}
        </ul>
      </div>
    );
  }
  const texts = shown.occasion === "orga" ? subject.orgaTexts : subject.texts;
  return (
    <div className={styles.body}>
      <p className={styles.muted}>
        {shown.occasion === "orga"
          ? t("remind.orgaText", { orga: data.orgaName })
          : tRemind("contextPlaceholder", { name: subject.name })}
      </p>
      {texts ? (
        <RemindMessage
          texts={texts}
          defaultLocale={data.defaultLocale}
          footer={
            shown.occasion === "placeholder"
              ? t("remind.personal", { name: subject.name })
              : tRemind("footer", { name: data.orgaName })
          }
        />
      ) : null}
    </div>
  );
}
