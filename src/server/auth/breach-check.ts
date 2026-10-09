import "server-only";
import { isPwnedOnline } from "@/lib/hibp";
import { checkPassword, type PasswordProblem } from "@/lib/password-policy";
import { serverEnv } from "../env";

/**
 * Full server-side password check (F-042): length + offline leak list (always), then –
 * only with `PASSWORD_BREACH_CHECK=hibp` – the online lookup at "Have I Been Pwned".
 * OFF by default: the offline demo must not call external services (Q15); deciding this
 * before go-live is an open point for the client.
 */
export async function validateNewPassword(
  password: string,
  email: string,
): Promise<PasswordProblem | null> {
  const problem = checkPassword(password, email);
  if (problem) return problem;
  if (serverEnv().PASSWORD_BREACH_CHECK === "hibp" && (await isPwnedOnline(password))) {
    return "common";
  }
  return null;
}
