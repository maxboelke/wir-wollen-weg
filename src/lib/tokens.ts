import { randomBytes } from "node:crypto";

/** Invite token: 32 random bytes, base64url (256 bit; PRD requires ≥ 128 bit). */
export function generateInviteToken(): string {
  return randomBytes(32).toString("base64url");
}
