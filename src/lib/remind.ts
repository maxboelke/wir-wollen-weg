/**
 * Person status and reminders (ux-spec §14.2, F-007, F-015 – Feedback-Runde 1). Pure, so the
 * overview, «Gruppe», «Abstimmen» and the tests share one order and one set of rules.
 */

export type RemindPhase = "collect" | "vote";

export interface RemindPersonInput {
  /** User id (members) or placeholder id. */
  key: string;
  name: string;
  kind: "member" | "placeholder";
  organizer: boolean;
  /** Phase 1: dates added («eingetragen»), phase 2: voted. Placeholders are never done. */
  done: boolean;
}

export interface RemindPerson extends RemindPersonInput {
  me: boolean;
}

export interface RemindGroups {
  /** «Fehlt noch»: members in joining order, then placeholders (phase 1), the viewer last. */
  open: RemindPerson[];
  /** «Eingetragen» / «Abgestimmt»: in joining order. */
  done: RemindPerson[];
}

/**
 * Splits the people of a trip into «Fehlt noch» and «Eingetragen/Abgestimmt» (§14.2).
 * `members` must already be in joining order. Phase 2 lists members only – placeholders
 * cannot vote.
 */
export function remindGroups(
  phase: RemindPhase,
  members: readonly RemindPersonInput[],
  placeholders: readonly RemindPersonInput[],
  viewerKey: string,
): RemindGroups {
  const people: RemindPerson[] = members.map((m) => ({ ...m, me: m.key === viewerKey }));
  const openMembers = people.filter((p) => !p.done && !p.me);
  const self = people.filter((p) => !p.done && p.me);
  const openPlaceholders =
    phase === "collect"
      ? placeholders.map((p) => ({ ...p, kind: "placeholder" as const, done: false, me: false }))
      : [];
  return {
    open: [...openMembers, ...openPlaceholders, ...self],
    done: people.filter((p) => p.done),
  };
}

/** Text variant of «{name} erinnern» (§14.2 table). */
export type RemindCase =
  "p1" | "p1Deadline" | "p1Last" | "p1Placeholder" | "p2" | "p2Deadline" | "p2Last";

/**
 * Which reminder text fits: placeholder (organiser only, personal link) → «letzte Person»
 * (everyone else is done – incl. the viewer) → with a deadline that is still ahead → plain.
 */
export function remindCase(
  phase: RemindPhase,
  person: Pick<RemindPersonInput, "kind">,
  openCount: number,
  deadlineAhead: boolean,
): RemindCase {
  if (phase === "collect") {
    if (person.kind === "placeholder") return "p1Placeholder";
    if (openCount === 1) return "p1Last";
    return deadlineAhead ? "p1Deadline" : "p1";
  }
  if (openCount === 1) return "p2Last";
  return deadlineAhead ? "p2Deadline" : "p2";
}

/** Step of the remind sheet a trigger opens (§14.2 «Einstiege»). */
export type RemindTarget =
  | { step: "status" }
  | { step: "single"; key: string }
  | { step: "all" }
  /** With key: placeholder (non-organiser) · without: «{orga} Bescheid geben» (§14.1). */
  | { step: "orga"; key?: string };

/**
 * Target of [Erinnern] in a person row: members → «{name} erinnern»; a placeholder → the
 * personal link for the organiser, otherwise «{orga} Bescheid geben» (only the organiser has
 * the personal link, F-007).
 */
export function rowTarget(person: RemindPerson, isOrganizer: boolean): RemindTarget {
  return person.kind === "placeholder" && !isOrganizer
    ? { step: "orga", key: person.key }
    : { step: "single", key: person.key };
}

/** [Erinnern] of «Nächster Schritt»: exactly one other person open → that person, else the list. */
export function remindTarget(groups: RemindGroups, isOrganizer: boolean): RemindTarget {
  const others = groups.open.filter((p) => !p.me);
  const only = others.length === 1 ? others[0] : undefined;
  return only ? rowTarget(only, isOrganizer) : { step: "status" };
}

/** «Alle erinnern»: open JOINED members except the viewer (placeholders need their own link). */
export function remindAllCandidates(groups: RemindGroups): RemindPerson[] {
  return groups.open.filter((p) => p.kind === "member" && !p.me);
}

/** Can the viewer remind anybody right now? (menu «Gruppe erinnern», phase 1/2.) */
export function anyoneToRemind(groups: RemindGroups): boolean {
  return groups.open.some((p) => !p.me);
}

/** WhatsApp without a phone number opens the chat picker (§14.2 decision 4). */
export function whatsappHref(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

/** Token the server puts where the client inserts the chosen names («Alle erinnern»). */
export const NAMES_TOKEN = "⁣names⁣";
