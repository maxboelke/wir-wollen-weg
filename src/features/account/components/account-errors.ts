"use client";

import { useTranslations } from "next-intl";
import type { AccountResult } from "../actions";

/** Message for an account action result: most texts live under `auth.errors`. */
export function useAccountErrorMessage(): (result: AccountResult) => string | null {
  const tErrors = useTranslations("auth.errors");
  const tEmail = useTranslations("account.email");
  return (result) => {
    const { error } = result;
    if (!error) return null;
    if (error === "sameEmail" || error === "reauthExpired") return tEmail(error);
    if (
      error === "wrongCode" &&
      result.remainingAttempts !== undefined &&
      result.remainingAttempts < 4
    ) {
      return tErrors("wrongCodeRemaining", { count: result.remainingAttempts });
    }
    return tErrors(error, { minutes: result.minutes ?? 1, count: result.remainingAttempts ?? 0 });
  };
}
