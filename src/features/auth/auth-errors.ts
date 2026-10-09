import { retryAfterMinutes } from "@/lib/email-limits";

/** Error keys of the sign-in flows → `auth.errors.<key>` (texts: user-flows A.2, W02). */
export type AuthErrorKey =
  | "invalidEmail"
  | "wrongCode"
  | "wrongCodeRemaining"
  | "codeLength"
  | "tooManyAttempts"
  | "expired"
  | "rateLimited"
  | "locked"
  | "lockedUseLink"
  | "lockedPassword"
  | "nameRequired"
  | "passwordWrong"
  | "passwordTooShort"
  | "passwordTooLong"
  | "passwordCommon"
  | "joinFull"
  | "joinClosed"
  | "joinInvalid"
  | "joinRateLimited"
  | "nameTaken"
  | "tripInvalid"
  | "generic";

export interface AuthError {
  key: AuthErrorKey;
  /** Wait time for rate limits/locks. */
  minutes?: number;
  /** Remaining attempts for a wrong code. */
  count?: number;
}

/** Remaining attempts are shown from the 2nd wrong code on (4 of 5 left = 1st mistake). */
const SHOW_REMAINING_BELOW = 4;

interface ErrorBody {
  code?: unknown;
  retryAfter?: unknown;
  remainingAttempts?: unknown;
}

/**
 * Maps an `/api/auth/*` error response to a message. 429 carries the wait time either in
 * our body (`retryAfter`, per-address limits) or in Better Auth's `X-Retry-After` header
 * (IP limits).
 */
export function authErrorFromResponse(
  status: number,
  body: ErrorBody,
  retryAfterHeader: string | null,
): AuthError {
  const code = typeof body.code === "string" ? body.code : undefined;
  if (status === 429) {
    const seconds =
      typeof body.retryAfter === "number" ? body.retryAfter : Number(retryAfterHeader) || 60;
    return {
      key: code === "EMAIL_LOCKED" ? "locked" : "rateLimited",
      minutes: retryAfterMinutes(seconds),
    };
  }
  switch (code) {
    case "OTP_EXPIRED":
      return { key: "expired" };
    case "TOO_MANY_ATTEMPTS":
      return { key: "tooManyAttempts" };
    case "INVALID_OTP": {
      const remaining =
        typeof body.remainingAttempts === "number" ? body.remainingAttempts : undefined;
      return remaining !== undefined && remaining < SHOW_REMAINING_BELOW
        ? { key: "wrongCodeRemaining", count: remaining }
        : { key: "wrongCode" };
    }
    case "INVALID_EMAIL_OR_PASSWORD":
      return { key: "passwordWrong" };
    case "PASSWORD_TOO_SHORT":
      return { key: "passwordTooShort" };
    case "PASSWORD_TOO_LONG":
      return { key: "passwordTooLong" };
    case "PASSWORD_COMMON":
      return { key: "passwordCommon" };
    default:
      return status === 401 ? { key: "passwordWrong" } : { key: "generic" };
  }
}

export async function readAuthError(response: Response): Promise<AuthError> {
  const body = (await response.json().catch(() => ({}))) as ErrorBody;
  return authErrorFromResponse(
    response.status,
    body,
    response.headers.get("retry-after") ?? response.headers.get("x-retry-after"),
  );
}

/** POST to Better Auth's HTTP handler (same origin, JSON). */
export function postAuth(path: string, body: unknown): Promise<Response> {
  return fetch(`/api/auth${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    credentials: "same-origin",
  });
}

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
