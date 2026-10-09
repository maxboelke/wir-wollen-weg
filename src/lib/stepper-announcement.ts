/**
 * Text the stepper's live region reads after «−»/«+» (ux-spec §4.6, R-038 note): the new
 * value with its unit («5 nights»), or `emptyText` when an optional stepper was cleared.
 * Empty until a button was pressed – typing in the number field is announced natively.
 */
export function stepperAnnouncement(
  stepped: boolean,
  value: string,
  unit: string,
  emptyText: string,
): string {
  if (!stepped) return "";
  const trimmed = value.trim();
  return trimmed === "" ? emptyText : `${trimmed} ${unit}`;
}
