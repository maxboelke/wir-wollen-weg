"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { DURATION, EASING, prefersReducedMotion } from "@/lib/motion";
import { Icon } from "./icon";
import styles from "./bottom-sheet.module.css";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  closeLabel: string;
  children: ReactNode;
}

/**
 * Bottom sheet (< 960 px) / dialog (≥ 960 px) on a native modal `<dialog>`: focus trap,
 * Esc and the top layer come from the platform (ux-spec §4.2, design-system §9.16).
 * Motion G-05/G-05b: slides up (`slow` · emphasized), closes faster; reduced = fade.
 * Basic version: dragging and snap points follow with the first real sheet (Increment 3).
 */
export function BottomSheet({ open, onClose, title, closeLabel, children }: BottomSheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const closing = useRef<Animation | null>(null);
  const titleId = useId();

  // Tap on the scrim (the dialog box itself, outside the panel) closes.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onScrimClick = (event: MouseEvent) => {
      if (event.target === dialog) onClose();
    };
    dialog.addEventListener("click", onScrimClick);
    return () => {
      dialog.removeEventListener("click", onScrimClick);
    };
  }, [onClose]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      // Re-opened while the exit still runs: drop the exit first.
      if (closing.current) {
        closing.current.cancel();
        closing.current = null;
        dialog.close();
        dialog.inert = false;
        dialog.style.pointerEvents = "";
      }
      if (dialog.open) return;
      returnFocus.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      dialog.showModal();
      // Focus at the start of the animation, never at its end (motion-system §6.1).
      titleRef.current?.focus();
      const reduced = prefersReducedMotion();
      dialog.animate(
        reduced
          ? [{ opacity: 0 }, { opacity: 1 }]
          : [{ transform: "translateY(100%)" }, { transform: "translateY(0)" }],
        {
          duration: reduced ? DURATION.fade : DURATION.slow,
          easing: reduced ? "linear" : EASING.emphasized,
        },
      );
    } else if (dialog.open && !closing.current) {
      // R-019 / G-05b: close the MODAL dialog right away – the page is interactive again and
      // focus is back on the trigger in the same event. The exit then plays on the same
      // element shown non-modal and inert (no focus, no clicks), and it ends closed.
      dialog.close();
      dialog.inert = true;
      dialog.style.pointerEvents = "none";
      dialog.show();
      returnFocus.current?.focus();
      const reduced = prefersReducedMotion();
      const exit = dialog.animate(
        reduced
          ? [{ opacity: 1 }, { opacity: 0 }]
          : [{ transform: "translateY(0)" }, { transform: "translateY(100%)" }],
        {
          duration: reduced ? DURATION.fade : DURATION.base,
          easing: EASING.exit,
          fill: "forwards",
        },
      );
      closing.current = exit;
      exit.onfinish = () => {
        closing.current = null;
        dialog.close();
        dialog.inert = false;
        dialog.style.pointerEvents = "";
        exit.cancel();
      };
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className={styles.sheet}
      aria-labelledby={titleId}
      onCancel={(event) => {
        // Esc: animate out instead of the abrupt native close.
        event.preventDefault();
        onClose();
      }}
    >
      <div className={styles.panel}>
        <span className={styles.handle} aria-hidden="true" />
        <div className={styles.head}>
          <h2 id={titleId} ref={titleRef} tabIndex={-1} className={styles.title}>
            {title}
          </h2>
          <button type="button" className={styles.close} aria-label={closeLabel} onClick={onClose}>
            <Icon name="close" size={20} />
          </button>
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </dialog>
  );
}
