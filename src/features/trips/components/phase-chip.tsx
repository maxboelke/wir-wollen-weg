import { Chip } from "@/components/ui/chip";
import type { IconName } from "@/components/ui/icon";
import type { UiPhase } from "@/lib/trip-status";

const ICONS: Record<UiPhase, IconName> = {
  collect: "calendar",
  vote: "vote",
  fixed: "check",
  past: "clock",
};

/** Phase chip outside the trip (design-system §9.14): icon + text, never the icon alone. */
export function PhaseChip({ phase, label }: { phase: UiPhase; label: string }) {
  return (
    <Chip tone={phase} icon={ICONS[phase]}>
      {label}
    </Chip>
  );
}
