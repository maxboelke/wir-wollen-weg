import "server-only";
import { createCipheriv, createDecipheriv, hkdfSync, randomBytes } from "node:crypto";
import { resolveAppEnv } from "@/lib/app-env";
import {
  DERIVED_KEY_ID,
  DERIVED_KEY_INFO,
  keySource,
  type KeySource,
} from "@/lib/travel-data-keys";
import { logCounter } from "./log";

/**
 * Field encryption of the travel details (features.md R.9 «Verschlüsselung & Schlüssel»,
 * deployment.md §0.11): AES-256-GCM via Node `crypto`, a fresh 96-bit nonce per encryption,
 * 128-bit tag, AAD = trip + request + person + schema version – a ciphertext copied into another
 * row (other trip, request or person) cannot be decrypted. The key lives outside the database
 * (TRAVEL_DATA_KEYS; in development/ci/demo/preview derived from BETTER_AUTH_SECRET with HKDF).
 * Errors never carry values or key material.
 */

const ALGORITHM = "aes-256-gcm";
const NONCE_BYTES = 12;
const TAG_BYTES = 16;

export interface KeyRing {
  /** Encrypts everything new and every change. */
  active: { kid: string; key: Buffer };
  /** All keys that may decrypt (rotation, deployment.md §0.11.6). */
  byId: ReadonlyMap<string, Buffer>;
}

export interface Sealed {
  ciphertext: Buffer;
  nonce: Buffer;
  keyId: string;
}

/** Binding of a ciphertext to its row (R.9 Nr. 1). */
export interface AadParts {
  tripId: string;
  requestId: string;
  userId: string;
  schemaVersion: number;
}

export class TravelCryptoError extends Error {
  constructor(readonly reason: "unknownKey" | "failed" | "noKey") {
    super(`travel-data crypto: ${reason}`);
    this.name = "TravelCryptoError";
  }
}

/** Key ring from its source – null when there is none (area off, fail closed). */
export function keyRingFrom(source: KeySource): KeyRing | null {
  if (source.kind === "none") return null;
  if (source.kind === "derived") {
    const key = Buffer.from(hkdfSync("sha256", source.secret, "", DERIVED_KEY_INFO, 32));
    return { active: { kid: DERIVED_KEY_ID, key }, byId: new Map([[DERIVED_KEY_ID, key]]) };
  }
  const entries = source.keys.map((entry) => [entry.kid, Buffer.from(entry.base64, "base64")] as const);
  const first = entries[0];
  if (!first) return null;
  return { active: { kid: first[0], key: first[1] }, byId: new Map(entries) };
}

let cached: { signature: string; ring: KeyRing | null } | undefined;

/** The key ring of this process (re-read when the variables change – tests, rotation script). */
export function currentKeyRing(env: Record<string, string | undefined> = process.env): KeyRing | null {
  const appEnv = resolveAppEnv(env);
  const signature = [appEnv, env.TRAVEL_DATA_KEYS ?? "", env.BETTER_AUTH_SECRET ?? ""].join("\u0000");
  if (cached?.signature !== signature) {
    cached = { signature, ring: keyRingFrom(keySource(appEnv, env)) };
  }
  return cached.ring;
}

export function aadOf(parts: AadParts): Buffer {
  return Buffer.from(
    `ww-travel-data|v${String(parts.schemaVersion)}|${parts.tripId}|${parts.requestId}|${parts.userId}`,
    "utf8",
  );
}

/** Encrypts one record with the ACTIVE key and a new random nonce. */
export function sealRecord(ring: KeyRing, record: unknown, aad: AadParts): Sealed {
  const nonce = randomBytes(NONCE_BYTES);
  const cipher = createCipheriv(ALGORITHM, ring.active.key, nonce, { authTagLength: TAG_BYTES });
  cipher.setAAD(aadOf(aad));
  const body = Buffer.concat([cipher.update(JSON.stringify(record), "utf8"), cipher.final()]);
  return { ciphertext: Buffer.concat([body, cipher.getAuthTag()]), nonce, keyId: ring.active.kid };
}

/**
 * Decrypts one record. Throws `TravelCryptoError` – unknown key id, wrong AAD (row swapped),
 * manipulated ciphertext/tag/nonce – and counts it (fixed counter names, no ids).
 */
export function openRecord(ring: KeyRing, sealed: Sealed, aad: AadParts): unknown {
  const key = ring.byId.get(sealed.keyId);
  if (!key) {
    logCounter("travel_data.decrypt_unknown_key");
    throw new TravelCryptoError("unknownKey");
  }
  try {
    if (sealed.nonce.length !== NONCE_BYTES || sealed.ciphertext.length <= TAG_BYTES) {
      throw new Error("shape");
    }
    const body = sealed.ciphertext.subarray(0, sealed.ciphertext.length - TAG_BYTES);
    const tag = sealed.ciphertext.subarray(sealed.ciphertext.length - TAG_BYTES);
    const decipher = createDecipheriv(ALGORITHM, key, sealed.nonce, { authTagLength: TAG_BYTES });
    decipher.setAAD(aadOf(aad));
    decipher.setAuthTag(tag);
    const text = Buffer.concat([decipher.update(body), decipher.final()]).toString("utf8");
    return JSON.parse(text) as unknown;
  } catch {
    logCounter("travel_data.decrypt_failed");
    throw new TravelCryptoError("failed");
  }
}

/** Re-encrypts with the active key (rotation): same AAD, NEW nonce. */
export function resealRecord(ring: KeyRing, sealed: Sealed, aad: AadParts): Sealed {
  return sealRecord(ring, openRecord(ring, sealed, aad), aad);
}
