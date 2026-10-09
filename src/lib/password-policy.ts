/**
 * Password rules (F-042, ux-spec §5.2): at least 10 characters, at most 128 (bounds the
 * hashing cost), and no password that is known to be common/leaked.
 *
 * The leak check works offline (offline demo, Q15): a small built-in list of the most
 * common passwords with ≥ 10 characters plus trivial patterns. The online check against
 * "Have I Been Pwned" is optional (server, `PASSWORD_BREACH_CHECK=hibp`) – see
 * src/server/auth/breach-check.ts.
 */
export const PASSWORD_MIN_LENGTH = 10;
export const PASSWORD_MAX_LENGTH = 128;

export type PasswordProblem = "tooShort" | "tooLong" | "common";

/** Most common passwords of ≥ 10 characters in public leak lists (lower-case). */
const COMMON_PASSWORDS = new Set([
  "1234567890",
  "0123456789",
  "0987654321",
  "1234567891",
  "12345678910",
  "123456789a",
  "a123456789",
  "1q2w3e4r5t",
  "1q2w3e4r5t6y",
  "q1w2e3r4t5",
  "qwertyuiop",
  "qwertzuiop",
  "asdfghjkl1",
  "asdfghjkl;",
  "1qaz2wsx3edc",
  "zaq12wsxcde3",
  "qwerty1234",
  "qwerty12345",
  "qwerty123456",
  "qwertz1234",
  "qwertz123456",
  "password12",
  "password123",
  "password1234",
  "password!1",
  "passwort12",
  "passwort123",
  "passwort1234",
  "iloveyou12",
  "iloveyou123",
  "ichliebedich",
  "hallo12345",
  "hallo123456",
  "abcdefghij",
  "abcdefg123",
  "abc1234567",
  "abcd123456",
  "letmein123",
  "welcome123",
  "willkommen",
  "willkommen1",
  "football123",
  "fussball123",
  "baseball123",
  "princess123",
  "sunshine123",
  "starwars123",
  "superman123",
  "michael123",
  "basketball",
  "chocolate1",
  "liverpool1",
  "manchester",
  "1234qwerasdf",
  "qwer1234asdf",
  "trustno1234",
  "administrator",
  "changeme123",
  "wirwollenweg",
  "whendowego",
]);

function isTrivialPattern(password: string): boolean {
  // one repeated character ("aaaaaaaaaa") or a single repeated short block ("abcabcabca")
  if (/^(.)\1+$/u.test(password)) return true;
  if (/^(.{1,3})\1{3,}.{0,3}$/u.test(password)) return true;
  // ascending/descending digit runs only ("2345678901", "9876543210")
  if (/^\d+$/.test(password)) {
    const digits = Array.from(password, Number);
    const isRun = (step: 1 | 9) =>
      digits.every((digit, i) => i === 0 || digit === ((digits[i - 1] ?? 0) + step) % 10);
    if (isRun(1) || isRun(9)) return true;
  }
  return false;
}

/** Checks length and the offline leak list. `email` catches "my address as password". */
export function checkPassword(password: string, email?: string): PasswordProblem | null {
  const length = Array.from(password).length;
  if (length < PASSWORD_MIN_LENGTH) return "tooShort";
  if (length > PASSWORD_MAX_LENGTH) return "tooLong";
  const lower = password.toLowerCase();
  if (COMMON_PASSWORDS.has(lower) || COMMON_PASSWORDS.has(lower.replace(/[\s!.]+$/u, ""))) {
    return "common";
  }
  if (isTrivialPattern(lower)) return "common";
  if (email && lower === email.trim().toLowerCase()) return "common";
  return null;
}
