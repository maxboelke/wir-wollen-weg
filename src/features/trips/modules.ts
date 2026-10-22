import type { TileTone } from "@/components/ui/card";
import type { IconName } from "@/components/ui/icon";

/**
 * Docking slot «Als Nächstes» of the phase-3 hub (ux-spec §14.4): later modules such as
 * accommodation swipes (F-031), shared costs, trip data or documents add one tile each and a
 * sub-page `/trips/{id}/<module>` with the cockpit without tabs.
 */
export interface TripModule {
  id: string;
  icon: IconName;
  tone: Exclude<TileTone, "brand">;
  title: string;
  /** One line, e.g. «3 von 7 haben bewertet». */
  status: string;
  /** The viewer has something to do – to-do edge and sorted to the front. */
  todo?: boolean | undefined;
  href: string;
  visible: boolean;
}

/**
 * Modules of a fixed trip. The MVP has none – the slot renders nothing (no «coming soon»
 * teasers, ux-spec §14.4). Order: to-dos first, otherwise the module order.
 */
export function tripModules(): TripModule[] {
  const modules: TripModule[] = [];
  return modules
    .filter((module) => module.visible)
    .sort((a, b) => Number(Boolean(b.todo)) - Number(Boolean(a.todo)));
}
