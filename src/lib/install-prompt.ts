/**
 * Android/Chrome install prompt (W23 B.3): `beforeinstallprompt` is caught as early as possible
 * (service-worker component in the root layouts) only to choose the moment ourselves – no
 * banner on the landing or while painting days. The install guide takes it from here.
 */
export interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/** Fired on window when a prompt was caught. */
export const INSTALL_PROMPT_EVENT = "ww-install-prompt";

let stored: InstallPromptEvent | null = null;

export function catchInstallPrompt(event: Event): void {
  event.preventDefault();
  stored = event as InstallPromptEvent;
  window.dispatchEvent(new Event(INSTALL_PROMPT_EVENT));
}

/** The caught prompt (it can be used once). */
export function takeInstallPrompt(): InstallPromptEvent | null {
  return stored;
}
