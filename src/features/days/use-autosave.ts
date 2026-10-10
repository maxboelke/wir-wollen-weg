"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AvailabilityEntry } from "@/lib/availability";
import type { DaysError, DaysResult } from "./actions";

/**
 * Autosave of «Meine Tage» (Flow B.3 #1, ux-spec §6): every change is shown at once
 * (optimistic) and saved bundled after 600 ms. Saves never overlap – a change during a
 * running request is saved right after it (full snapshot, so the last one wins). Network
 * errors keep the marks locally and retry 3× (1 s, 2 s, 4 s), then «Nicht gespeichert –
 * Erneut versuchen». Server rejections are reported to the editor (range changed, signed out).
 */

export type SaveStatus = "saved" | "pending" | "saving" | "error";

const DEBOUNCE_MS = 600;
const RETRY_MS = [1000, 2000, 4000];

export function useAutosave({
  save,
  snapshot,
  onRejected,
  onSaved,
}: {
  save: (entries: AvailabilityEntry[]) => Promise<DaysResult>;
  snapshot: () => AvailabilityEntry[];
  onRejected: (error: DaysError) => void;
  onSaved: (at: string) => void;
}) {
  const [status, setStatus] = useState<SaveStatus>("saved");
  const timer = useRef<number | undefined>(undefined);
  const running = useRef<Promise<void> | null>(null);
  const dirty = useRef(false);
  const attempt = useRef(0);
  const callbacks = useRef({ save, snapshot, onRejected, onSaved });
  useEffect(() => {
    callbacks.current = { save, snapshot, onRejected, onSaved };
  });

  const flushRef = useRef<() => Promise<void>>(() => Promise.resolve());
  const flush = useCallback(async (): Promise<void> => {
    window.clearTimeout(timer.current);
    while (running.current) await running.current;
    if (!dirty.current) return;
    dirty.current = false;
    setStatus("saving");
    const run = (async () => {
      let result: DaysResult | null;
      try {
        result = await callbacks.current.save(callbacks.current.snapshot());
      } catch {
        result = null; // network error / server unreachable
      }
      if (result?.ok) {
        attempt.current = 0;
        callbacks.current.onSaved(result.savedAt);
        // A change during the request has its own debounce timer running.
        setStatus(dirty.current ? "pending" : "saved");
        return;
      }
      dirty.current = true;
      if (result && result.error !== "generic") {
        setStatus("error");
        callbacks.current.onRejected(result.error);
        return;
      }
      const delay = RETRY_MS[attempt.current];
      attempt.current += 1;
      if (delay === undefined || !navigator.onLine) {
        setStatus("error");
        return;
      }
      setStatus("pending");
      timer.current = window.setTimeout(() => {
        void flushRef.current();
      }, delay);
    })();
    running.current = run;
    await run;
    running.current = null;
  }, []);
  useEffect(() => {
    flushRef.current = flush;
  }, [flush]);

  /** A change happened: save after the debounce. */
  const schedule = useCallback(() => {
    dirty.current = true;
    attempt.current = 0;
    setStatus("pending");
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      void flush();
    }, DEBOUNCE_MS);
  }, [flush]);

  /** «Erneut versuchen» / back online. */
  const retry = useCallback(() => {
    attempt.current = 0;
    dirty.current = true;
    void flush();
  }, [flush]);

  /**
   * Back online: retries only if something is still unsaved. (Calling `retry` here on mount
   * saved an unchanged snapshot on every visit – bumping «zuletzt geändert», R-048.)
   */
  const resume = useCallback(() => {
    if (!dirty.current) return;
    attempt.current = 0;
    void flush();
  }, [flush]);

  /** Waits for a running save and drops a pending one (the caller sends the snapshot itself). */
  const settle = useCallback(async () => {
    window.clearTimeout(timer.current);
    if (running.current) await running.current;
    dirty.current = false;
  }, []);

  const markSaved = useCallback(() => {
    attempt.current = 0;
    setStatus("saved");
  }, []);

  // Unsaved changes: warn before leaving the page (Flow B.4).
  useEffect(() => {
    if (status === "saved") return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => {
      window.removeEventListener("beforeunload", warn);
    };
  }, [status]);

  useEffect(
    () => () => {
      window.clearTimeout(timer.current);
    },
    [],
  );

  return { status, schedule, retry, resume, settle, markSaved, flush };
}
