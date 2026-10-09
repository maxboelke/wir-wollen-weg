"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useId, useState, useTransition, type ReactNode } from "react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Banner } from "@/components/ui/banner";
import { Checkbox, TextField } from "@/components/ui/field";
import { Icon, type IconName } from "@/components/ui/icon";
import { RadioGroup } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/dates";
import { DISPLAY_NAME_MAX } from "@/lib/display-name";
import {
  deleteTripAction,
  leaveTripAction,
  removeMemberAction,
  renameSelfAction,
  transferOrganizerAction,
} from "../actions";
import { tripPath } from "../paths";
import styles from "./trip-sheet.module.css";

export interface SheetMember {
  userId: string;
  displayName: string;
  role: "organizer" | "member";
  /** ISO timestamp. */
  joinedAt: string;
}

export type SheetStep =
  | { kind: "menu" }
  | { kind: "rename" }
  | { kind: "leave" }
  | { kind: "transfer"; preselect?: string | undefined }
  | { kind: "delete" }
  | { kind: "member"; member: SheetMember }
  | { kind: "remove"; member: SheetMember };

export interface TripSheetContext {
  publicId: string;
  tripName: string;
  isOrganizer: boolean;
  canInvite: boolean;
  myName: string;
  myUserId: string;
  members: SheetMember[];
  intl: string;
  helpHref: string;
}

interface TripSheetProps extends TripSheetContext {
  step: SheetStep | null;
  onStep: (step: SheetStep) => void;
  onClose: () => void;
}

/**
 * Trip menu «⋯» and the management dialogs of Flow J (W12) in ONE bottom sheet / dialog:
 * the menu switches to the confirmation step in place (focus moves to the new heading).
 * Destructive buttons name the action, never «OK» (ux-spec §4.2). Every action is checked
 * again on the server (F-004).
 */
export function TripSheet({ step, onStep, onClose, ...context }: TripSheetProps) {
  const t = useTranslations("trip");
  const tCommon = useTranslations("common");
  const [lastStep, setLastStep] = useState<SheetStep>({ kind: "menu" });
  if (step && step !== lastStep) setLastStep(step);
  const shown = step ?? lastStep;
  const focusKey = shown.kind + ("member" in shown ? shown.member.userId : "");
  const title = sheetTitle(shown, context, t);
  return (
    <BottomSheet
      open={step !== null}
      onClose={onClose}
      title={title}
      closeLabel={tCommon("close")}
      focusKey={focusKey}
    >
      <SheetBody key={focusKey} step={shown} onStep={onStep} onClose={onClose} {...context} />
    </BottomSheet>
  );
}

function sheetTitle(
  step: SheetStep,
  context: TripSheetContext,
  t: ReturnType<typeof useTranslations<"trip">>,
): string {
  switch (step.kind) {
    case "menu":
      return context.tripName;
    case "rename":
      return t("dialogs.renameTitle", { trip: context.tripName });
    case "leave":
      return context.isOrganizer
        ? t("dialogs.leaveOrgaTitle")
        : t("dialogs.leaveTitle", { trip: context.tripName });
    case "transfer":
      return t("dialogs.transferTitle");
    case "delete":
      return t("dialogs.deleteTitle");
    case "member":
      return step.member.displayName;
    case "remove":
      return t("dialogs.removeTitle", { name: step.member.displayName });
  }
}

function SheetBody({
  step,
  onStep,
  onClose,
  ...context
}: { step: SheetStep; onStep: (step: SheetStep) => void; onClose: () => void } & TripSheetContext) {
  switch (step.kind) {
    case "menu":
      return <MenuStep onStep={onStep} onClose={onClose} {...context} />;
    case "rename":
      return <RenameStep onClose={onClose} {...context} />;
    case "leave":
      return <LeaveStep onStep={onStep} onClose={onClose} {...context} />;
    case "transfer":
      return <TransferStep onClose={onClose} preselect={step.preselect} {...context} />;
    case "delete":
      return <DeleteStep onClose={onClose} {...context} />;
    case "member":
      return <MemberStep member={step.member} onStep={onStep} {...context} />;
    case "remove":
      return <RemoveStep member={step.member} onClose={onClose} {...context} />;
  }
}

function MenuItem({
  icon,
  children,
  href,
  onClick,
  danger = false,
}: {
  icon: IconName;
  children: ReactNode;
  href?: string | undefined;
  onClick?: (() => void) | undefined;
  danger?: boolean | undefined;
}) {
  const className = danger ? `${styles.item} ${styles.danger}` : styles.item;
  const content = (
    <>
      <Icon name={icon} size={20} />
      <span>{children}</span>
    </>
  );
  return (
    <li>
      {href ? (
        <Link className={className} href={href}>
          {content}
        </Link>
      ) : (
        <button type="button" className={className} onClick={onClick}>
          {content}
        </button>
      )}
    </li>
  );
}

function MenuStep({
  onStep,
  publicId,
  isOrganizer,
  canInvite,
  helpHref,
}: { onStep: (step: SheetStep) => void; onClose: () => void } & TripSheetContext) {
  const t = useTranslations("trip.menuItems");
  return (
    <ul className={styles.menu}>
      {canInvite ? (
        <MenuItem icon="share" href={tripPath(publicId, "invite")}>
          {t("invite")}
        </MenuItem>
      ) : null}
      <MenuItem
        icon="user"
        onClick={() => {
          onStep({ kind: "rename" });
        }}
      >
        {t("rename")}
      </MenuItem>
      {isOrganizer ? (
        <MenuItem icon="edit" href={tripPath(publicId, "settings")}>
          {t("edit")}
        </MenuItem>
      ) : null}
      <MenuItem
        icon="logout"
        onClick={() => {
          onStep({ kind: "leave" });
        }}
        danger
      >
        {t("leave")}
      </MenuItem>
      {isOrganizer ? (
        <MenuItem
          icon="trash"
          onClick={() => {
            onStep({ kind: "delete" });
          }}
          danger
        >
          {t("delete")}
        </MenuItem>
      ) : null}
      <MenuItem icon="help" href={helpHref}>
        {t("help")}
      </MenuItem>
    </ul>
  );
}

/** Shared footer: [Abbrechen] (secondary) + action. */
function Actions({ onCancel, children }: { onCancel: () => void; children: ReactNode }) {
  const tCommon = useTranslations("common");
  return (
    <div className={styles.actions}>
      <Button variant="secondary" size="md" onClick={onCancel}>
        {tCommon("cancel")}
      </Button>
      {children}
    </div>
  );
}

function useResult() {
  const router = useRouter();
  const toast = useToast();
  const tCommon = useTranslations("common");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  function run(
    work: () => Promise<{ ok?: boolean; error?: string } | undefined>,
    onOk: () => void,
  ) {
    setError(null);
    startTransition(async () => {
      const result = await work();
      // Redirecting actions (leave, delete) navigate away and resolve without a result.
      if (result === undefined) return;
      if (result.ok) {
        onOk();
        router.refresh();
        return;
      }
      setError(result.error === "notAllowed" ? tCommon("notAllowed") : tCommon("genericError"));
    });
  }
  return { run, pending, error, toast };
}

function ErrorLine({ error }: { error: string | null }) {
  return error ? (
    <Banner tone="danger" role="alert">
      {error}
    </Banner>
  ) : null;
}

function RenameStep({ onClose, publicId, myName }: { onClose: () => void } & TripSheetContext) {
  const t = useTranslations("trip.dialogs");
  const tInvite = useTranslations("invite");
  const tCommon = useTranslations("common");
  const tAuth = useTranslations("auth.errors");
  const id = useId();
  const { run, pending, error, toast } = useResult();
  const [name, setName] = useState(myName);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  return (
    <form
      className={styles.body}
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        setFieldError(null);
        setSuggestion(null);
        run(
          async () => {
            const result = await renameSelfAction(publicId, name);
            if (result.suggestion) {
              setFieldError(tAuth("nameTaken"));
              setSuggestion(result.suggestion);
              return { error: "handled-inline" };
            }
            if (result.error === "nameRequired") {
              setFieldError(tAuth("nameRequired"));
              return { error: "handled-inline" };
            }
            return result;
          },
          () => {
            toast({ message: t("renameDone") });
            onClose();
          },
        );
      }}
    >
      <TextField
        id={`${id}-name`}
        label={t("renameLabel")}
        hint={t("renameHint")}
        value={name}
        maxLength={DISPLAY_NAME_MAX}
        autoComplete="nickname"
        error={fieldError ?? undefined}
        onChange={(event) => {
          setName(event.target.value);
        }}
      />
      {suggestion ? (
        <div className={styles.suggestion} role="status">
          <p>{tInvite("nameTakenHint", { suggestion })}</p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setName(suggestion);
              setSuggestion(null);
              setFieldError(null);
            }}
          >
            {tInvite("useSuggestion")}
          </Button>
        </div>
      ) : null}
      {error && !fieldError ? <ErrorLine error={error} /> : null}
      <Actions onCancel={onClose}>
        <Button type="submit" size="md" loading={pending}>
          {tCommon("save")}
        </Button>
      </Actions>
    </form>
  );
}

function LeaveStep({
  onStep,
  onClose,
  publicId,
  isOrganizer,
  members,
}: { onStep: (step: SheetStep) => void; onClose: () => void } & TripSheetContext) {
  const t = useTranslations("trip.dialogs");
  const { run, pending, error } = useResult();
  if (isOrganizer) {
    const alone = members.length <= 1;
    return (
      <div className={styles.body}>
        <p>{alone ? t("leaveOrgaSolo") : t("leaveOrgaText")}</p>
        <div className={styles.stack}>
          {alone ? null : (
            <Button
              variant="secondary"
              size="md"
              block
              onClick={() => {
                onStep({ kind: "transfer" });
              }}
            >
              {t("transfer")}
            </Button>
          )}
          <Button
            variant="dangerQuiet"
            size="md"
            block
            onClick={() => {
              onStep({ kind: "delete" });
            }}
          >
            {t("deleteConfirm")}
          </Button>
          <CancelOnly onCancel={onClose} />
        </div>
      </div>
    );
  }
  return (
    <div className={styles.body}>
      <p>{t("leaveText")}</p>
      <ErrorLine error={error} />
      <Actions onCancel={onClose}>
        <Button
          variant="danger"
          size="md"
          loading={pending}
          onClick={() => {
            run(
              () => leaveTripAction(publicId),
              () => undefined,
            );
          }}
        >
          {t("leaveConfirm")}
        </Button>
      </Actions>
    </div>
  );
}

function CancelOnly({ onCancel }: { onCancel: () => void }) {
  const tCommon = useTranslations("common");
  return (
    <Button variant="text" size="md" block onClick={onCancel}>
      {tCommon("cancel")}
    </Button>
  );
}

function TransferStep({
  onClose,
  publicId,
  members,
  myUserId,
  intl,
  preselect,
}: { onClose: () => void; preselect?: string | undefined } & TripSheetContext) {
  const t = useTranslations("trip.dialogs");
  const { run, pending, error, toast } = useResult();
  const candidates = members.filter((m) => m.userId !== myUserId);
  const [target, setTarget] = useState(preselect ?? candidates[0]?.userId ?? "");
  const chosen = candidates.find((m) => m.userId === target);
  return (
    <div className={styles.body}>
      <RadioGroup
        legend={t("transferLegend")}
        name="new-organizer"
        value={target}
        onChange={setTarget}
        options={candidates.map((member) => ({
          value: member.userId,
          label: member.displayName,
          hint: t("transferJoined", {
            date: formatDate(member.joinedAt.slice(0, 10), intl, { weekday: false, year: false }),
          }),
        }))}
      />
      <p className={styles.muted}>{t("transferNote")}</p>
      <ErrorLine error={error} />
      <Actions onCancel={onClose}>
        <Button
          size="md"
          loading={pending}
          aria-disabled={!chosen || undefined}
          onClick={() => {
            if (!chosen) return;
            run(
              () => transferOrganizerAction(publicId, chosen.userId),
              () => {
                toast({ message: t("transferDone", { name: chosen.displayName }) });
                onClose();
              },
            );
          }}
        >
          {t("transferConfirm")}
        </Button>
      </Actions>
    </div>
  );
}

function DeleteStep({ onClose, publicId, tripName }: { onClose: () => void } & TripSheetContext) {
  const t = useTranslations("trip.dialogs");
  const id = useId();
  const { run, pending, error } = useResult();
  const [typed, setTyped] = useState("");
  const matches = typed.trim().toLocaleLowerCase() === tripName.trim().toLocaleLowerCase();
  return (
    <form
      className={styles.body}
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (!matches) return;
        run(
          () => deleteTripAction(publicId, typed),
          () => undefined,
        );
      }}
    >
      <p>{t("deleteText", { trip: tripName })}</p>
      <TextField
        id={`${id}-confirm`}
        label={t("deleteLabel", { trip: tripName })}
        hint={matches ? undefined : t("deleteHint", { trip: tripName })}
        value={typed}
        autoComplete="off"
        onChange={(event) => {
          setTyped(event.target.value);
        }}
      />
      <ErrorLine error={error} />
      <Actions onCancel={onClose}>
        <Button
          type="submit"
          variant="danger"
          size="md"
          loading={pending}
          aria-disabled={!matches || undefined}
        >
          {t("deleteConfirm")}
        </Button>
      </Actions>
    </form>
  );
}

function MemberStep({
  member,
  onStep,
}: { member: SheetMember; onStep: (step: SheetStep) => void } & TripSheetContext) {
  const t = useTranslations("trip.dialogs");
  return (
    <ul className={styles.menu}>
      <MenuItem
        icon="crown"
        onClick={() => {
          onStep({ kind: "transfer", preselect: member.userId });
        }}
      >
        {t("makeOrga")}
      </MenuItem>
      <MenuItem
        icon="trash"
        onClick={() => {
          onStep({ kind: "remove", member });
        }}
        danger
      >
        {t("removeAction")}
      </MenuItem>
    </ul>
  );
}

function RemoveStep({
  member,
  onClose,
  publicId,
}: { member: SheetMember; onClose: () => void } & TripSheetContext) {
  const t = useTranslations("trip.dialogs");
  const { run, pending, error, toast } = useResult();
  const [renew, setRenew] = useState(false);
  return (
    <div className={styles.body}>
      <p>{t("removeText", { name: member.displayName })}</p>
      <Checkbox
        label={t("removeRenew")}
        checked={renew}
        onChange={(event) => {
          setRenew(event.target.checked);
        }}
      />
      <ErrorLine error={error} />
      <Actions onCancel={onClose}>
        <Button
          variant="danger"
          size="md"
          loading={pending}
          onClick={() => {
            run(
              () => removeMemberAction(publicId, member.userId, renew),
              () => {
                toast({ message: t("removeDone", { name: member.displayName }) });
                onClose();
              },
            );
          }}
        >
          {t("removeConfirm")}
        </Button>
      </Actions>
    </div>
  );
}
