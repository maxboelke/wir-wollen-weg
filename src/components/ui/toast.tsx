"use client";

import {
  createContext,
  use,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { DISTANCE, DURATION, EASING, enter, prefersReducedMotion } from "@/lib/motion";
import { Icon } from "./icon";
import styles from "./toast.module.css";

export interface ToastInput {
  message: ReactNode;
  action?: { label: string; onAction: () => void } | undefined;
}

interface ToastItem extends ToastInput {
  id: number;
}

const ToastContext = createContext<(toast: ToastInput) => void>(() => undefined);

/** Shows a snackbar (ux-spec §4.3): one at a time, 4 s / 6 s with action, pauses on hover/focus. */
export function useToast() {
  return use(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastItem | null>(null);
  const counter = useRef(0);
  const show = useCallback((input: ToastInput) => {
    counter.current += 1;
    setToast({ ...input, id: counter.current });
  }, []);
  const dismiss = useCallback(() => {
    setToast(null);
  }, []);
  return (
    <ToastContext value={show}>
      {children}
      <div className={styles.region} role="status" aria-live="polite">
        {toast ? <Toast key={toast.id} toast={toast} onDone={dismiss} /> : null}
      </div>
    </ToastContext>
  );
}

function Toast({ toast, onDone }: { toast: ToastItem; onDone: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const paused = useRef(false);
  const remaining = useRef(toast.action ? 6000 : 4000);

  useEffect(() => {
    const element = ref.current;
    // G-04: rises from the bottom bar; reduced: cross-fade only.
    enter(element, { y: DISTANCE.md, duration: DURATION.base });
    let last = Date.now();
    const timer = window.setInterval(() => {
      const now = Date.now();
      if (!paused.current) remaining.current -= now - last;
      last = now;
      if (remaining.current > 0) return;
      window.clearInterval(timer);
      const reduced = prefersReducedMotion();
      const exit = element?.animate(
        reduced
          ? [{ opacity: 1 }, { opacity: 0 }]
          : [
              { opacity: 1, transform: "none" },
              { opacity: 0, transform: `translateY(${DISTANCE.sm}px)` },
            ],
        {
          duration: reduced ? DURATION.fade : DURATION.fast,
          easing: EASING.exit,
          fill: "forwards",
        },
      );
      if (exit) exit.onfinish = onDone;
      else onDone();
    }, 200);
    return () => {
      window.clearInterval(timer);
    };
  }, [onDone]);

  const pause = () => {
    paused.current = true;
  };
  const resume = () => {
    paused.current = false;
  };

  return (
    <div
      ref={ref}
      className={styles.toast}
      onPointerEnter={pause}
      onPointerLeave={resume}
      onFocus={pause}
      onBlur={resume}
    >
      <Icon name="check" size={20} className={styles.icon} />
      <span className={styles.message}>{toast.message}</span>
      {toast.action ? (
        <button
          type="button"
          className={styles.action}
          onClick={() => {
            toast.action?.onAction();
            onDone();
          }}
        >
          {toast.action.label}
        </button>
      ) : null}
    </div>
  );
}
