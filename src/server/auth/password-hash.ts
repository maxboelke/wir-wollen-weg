import * as nodeCrypto from "node:crypto";
import { argon2idAsync } from "@noble/hashes/argon2.js";

/**
 * Argon2id password hashing (F-042, tech-stack §3.2) in the PHC string format
 * `$argon2id$v=19$m=19456,t=2,p=1$<salt>$<hash>` – parameters per OWASP Password Storage
 * Cheat Sheet (19 MiB, 2 passes, 1 lane).
 *
 * Uses Node's built-in `crypto.argon2` where available (Node ≥ 24.7: CI, production) and the
 * audited pure-JS implementation from @noble/hashes otherwise (local Node 22). Both produce
 * identical, standard-conformant output (cross-check in password-hash.test.ts).
 */
export const ARGON2_PARAMS = { m: 19_456, t: 2, p: 1, dkLen: 32 } as const;

interface Argon2Params {
  m: number;
  t: number;
  p: number;
  dkLen: number;
}

type NativeArgon2 = (
  algorithm: "argon2id",
  parameters: {
    message: string | Uint8Array;
    nonce: Uint8Array;
    parallelism: number;
    tagLength: number;
    memory: number;
    passes: number;
  },
  callback: (error: Error | null, key: Uint8Array) => void,
) => void;

function nativeArgon2(): NativeArgon2 | undefined {
  const candidate = (nodeCrypto as unknown as { argon2?: unknown }).argon2;
  return typeof candidate === "function" ? (candidate as NativeArgon2) : undefined;
}

const encoder = new TextEncoder();

/** Normalised UTF-8 bytes – the same password typed on different keyboards hashes the same. */
function passwordBytes(password: string): Uint8Array {
  return encoder.encode(password.normalize("NFKC"));
}

export async function deriveArgon2id(
  password: string,
  salt: Uint8Array,
  params: Argon2Params,
  implementation: "auto" | "js" = "auto",
): Promise<Uint8Array> {
  const message = passwordBytes(password);
  const native = implementation === "auto" ? nativeArgon2() : undefined;
  if (native) {
    return new Promise((resolve, reject) => {
      native(
        "argon2id",
        {
          message,
          nonce: salt,
          parallelism: params.p,
          tagLength: params.dkLen,
          memory: params.m,
          passes: params.t,
        },
        (error, key) => {
          if (error) reject(error);
          else resolve(new Uint8Array(key));
        },
      );
    });
  }
  return argon2idAsync(message, salt, {
    t: params.t,
    m: params.m,
    p: params.p,
    dkLen: params.dkLen,
  });
}

const b64 = (bytes: Uint8Array) => Buffer.from(bytes).toString("base64").replace(/=+$/, "");
const fromB64 = (value: string) => new Uint8Array(Buffer.from(value, "base64"));

export async function hashPassword(password: string): Promise<string> {
  const salt = new Uint8Array(nodeCrypto.randomBytes(16));
  const hash = await deriveArgon2id(password, salt, ARGON2_PARAMS);
  const { m, t, p } = ARGON2_PARAMS;
  return `$argon2id$v=19$m=${m},t=${t},p=${p}$${b64(salt)}$${b64(hash)}`;
}

const PHC = /^\$argon2id\$v=19\$m=(\d+),t=(\d+),p=(\d+)\$([A-Za-z0-9+/]+)\$([A-Za-z0-9+/]+)$/;

/** Constant-time comparison; unknown formats never verify. */
export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  const match = PHC.exec(hash);
  if (!match) return false;
  const [, m, t, p, salt, expected] = match;
  const expectedBytes = fromB64(expected ?? "");
  const params = { m: Number(m), t: Number(t), p: Number(p), dkLen: expectedBytes.length };
  // Refuse absurd parameters from a tampered row (DoS guard).
  if (params.m > 262_144 || params.t > 10 || params.p > 8 || params.dkLen < 16) return false;
  const actual = await deriveArgon2id(password, fromB64(salt ?? ""), params);
  return (
    actual.length === expectedBytes.length && nodeCrypto.timingSafeEqual(actual, expectedBytes)
  );
}
