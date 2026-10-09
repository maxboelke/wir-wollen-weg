import { randomBytes, randomInt } from "node:crypto";

/** Invite token: 32 random bytes, base64url (256 bit; PRD requires ≥ 128 bit). */
export function generateInviteToken(): string {
  return randomBytes(32).toString("base64url");
}

/**
 * Shape check before any lookup: 22–64 base64url characters (≥ 128 bit). Anything else is
 * treated like an unknown token without touching the database.
 */
export function isInviteTokenShape(value: string): boolean {
  return /^[A-Za-z0-9_-]{22,64}$/.test(value);
}

const PUBLIC_ID_ALPHABET = "23456789abcdefghijkmnpqrstuvwxyz";
export const PUBLIC_ID_LENGTH = 10;

/**
 * Short, non-speaking trip id for URLs (sitemap §4: «z. B. 10 Zeichen»): 10 characters of a
 * 32-letter alphabet without look-alikes (50 bit). Not a secret – access is checked per
 * membership on every request.
 */
export function generatePublicId(): string {
  let id = "";
  for (let i = 0; i < PUBLIC_ID_LENGTH; i++) {
    id += PUBLIC_ID_ALPHABET.charAt(randomInt(PUBLIC_ID_ALPHABET.length));
  }
  return id;
}

export function isPublicIdShape(value: string): boolean {
  return new RegExp(`^[${PUBLIC_ID_ALPHABET}]{${String(PUBLIC_ID_LENGTH)}}$`).test(value);
}
