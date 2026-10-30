import { describe, expect, it } from "vitest";
import {
  betaInviteSignupEnabled,
  betaMaxAccounts,
  betaStartupProblems,
  betaStartupWarnings,
  feedbackConfig,
  localSmtpAllowedForTests,
  normalizeBetaCode,
  parseBetaCodes,
  parseBetaMaxAccounts,
  serviceWorkerEnabled,
} from "./beta-config";

/** A complete, valid beta configuration (fantasy values – no secrets). */
const valid = {
  APP_ENV: "beta",
  MAIL_TRANSPORT: "smtp",
  SMTP_HOST: "smtp.lettermint.co",
  SMTP_USER: "lettermint",
  SMTP_PASSWORD: "token",
  MAIL_FROM: "login@mail.wirwollenweg.de",
  BETA_ACCESS_CODES: "Sonne-Koffer-27",
  LEGAL_OPERATOR_NAME: "Max Muster",
  CONTACT_EMAIL: "max@wirwollenweg.de",
  CRON_SECRET: "x".repeat(40),
};

const problems = (overrides: Record<string, string | undefined>) =>
  betaStartupProblems({ ...valid, ...overrides });

describe("normalizeBetaCode / parseBetaCodes", () => {
  it("ignores case, spaces and hyphens and applies NFKC", () => {
    expect(normalizeBetaCode(" Sonne-Koffer 27 ")).toBe("sonnekoffer27");
    expect(normalizeBetaCode("ＳＯＮＮＥ")).toBe("sonne");
  });

  it("first code is the current one; 1–5 entries, ≥ 12 characters, no duplicates", () => {
    expect(parseBetaCodes("Neuer-Code-2027,Sonne-Koffer-27")).toEqual({
      ok: true,
      codes: ["neuercode2027", "sonnekoffer27"],
    });
    expect(parseBetaCodes("").ok).toBe(false);
    expect(parseBetaCodes(undefined).ok).toBe(false);
    expect(parseBetaCodes("kurz-123").ok).toBe(false);
    expect(
      parseBetaCodes(
        Array(6)
          .fill(0)
          .map((_, i) => `code-nummer-${String(i)}x`)
          .join(","),
      ).ok,
    ).toBe(false);
    expect(parseBetaCodes("Sonne-Koffer-27, sonnekoffer 27").ok).toBe(false);
  });

  it("never names the codes in a problem", () => {
    const result = parseBetaCodes("geheim-1");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.problem).not.toContain("geheim");
  });
});

describe("parseBetaMaxAccounts", () => {
  it("defaults to 50 and accepts whole numbers 1–500", () => {
    expect(parseBetaMaxAccounts(undefined)).toEqual({ ok: true, max: 50 });
    expect(parseBetaMaxAccounts("120")).toEqual({ ok: true, max: 120 });
    expect(parseBetaMaxAccounts("0").ok).toBe(false);
    expect(parseBetaMaxAccounts("501").ok).toBe(false);
    expect(parseBetaMaxAccounts("12.5").ok).toBe(false);
    expect(parseBetaMaxAccounts("viele").ok).toBe(false);
    expect(betaMaxAccounts({ BETA_MAX_ACCOUNTS: "7" })).toBe(7);
  });
});

describe("betaStartupProblems (deployment.md §0.12.4)", () => {
  it("a complete configuration starts", () => {
    expect(betaStartupProblems(valid)).toEqual([]);
  });

  it("Nr. 2: real mails only", () => {
    expect(problems({ MAIL_TRANSPORT: "inbox" }).join()).toContain("MAIL_TRANSPORT");
    expect(problems({ MAIL_TRANSPORT: undefined }).join()).toContain("MAIL_TRANSPORT");
    expect(problems({ SMTP_HOST: "localhost" }).join()).toContain("SMTP_HOST");
    expect(problems({ SMTP_HOST: "mailpit" }).join()).toContain("SMTP_HOST");
    expect(problems({ SMTP_PASSWORD: undefined }).join()).toContain("SMTP_PASSWORD");
    expect(problems({ SMTP_USER: "" }).join()).toContain("SMTP_USER");
    expect(problems({ MAIL_FROM: "login@mail.example.org" }).join()).toContain("MAIL_FROM");
    expect(problems({ MAIL_FROM: "a@x.test" }).join()).toContain("MAIL_FROM");
  });

  it("Nr. 3: beta codes", () => {
    expect(problems({ BETA_ACCESS_CODES: undefined }).join()).toContain("BETA_ACCESS_CODES");
    expect(problems({ BETA_ACCESS_CODES: "kurz" }).join()).toContain("BETA_ACCESS_CODES");
  });

  it("Nr. 4: controller name and contact", () => {
    expect(problems({ LEGAL_OPERATOR_NAME: undefined }).join()).toContain("LEGAL_OPERATOR_NAME");
    expect(problems({ LEGAL_OPERATOR_NAME: "M" }).join()).toContain("LEGAL_OPERATOR_NAME");
    expect(problems({ LEGAL_OPERATOR_NAME: "x".repeat(101) }).join()).toContain(
      "LEGAL_OPERATOR_NAME",
    );
    expect(problems({ CONTACT_EMAIL: undefined }).join()).toContain("CONTACT_EMAIL");
    expect(problems({ CONTACT_EMAIL: "hallo@example.org" }).join()).toContain("CONTACT_EMAIL");
    expect(problems({ CONTACT_EMAIL: "kein-mail" }).join()).toContain("CONTACT_EMAIL");
  });

  it("Nr. 5: the retention job needs CRON_SECRET or RETENTION_TOKEN", () => {
    expect(problems({ CRON_SECRET: undefined }).join()).toContain("CRON_SECRET");
    expect(problems({ CRON_SECRET: undefined, RETENTION_TOKEN: "y".repeat(40) })).toEqual([]);
  });

  it("Nr. 6: travel details stay off", () => {
    expect(problems({ TRAVEL_DATA_ENABLED: "true" }).join()).toContain("TRAVEL_DATA_ENABLED");
    expect(problems({ TRAVEL_DATA_ENABLED: "false" })).toEqual([]);
  });

  it("Nr. 7: rate limits stay on", () => {
    expect(problems({ RATE_LIMIT_ENABLED: "false" }).join()).toContain("RATE_LIMIT_ENABLED");
    expect(problems({ RATE_LIMIT_ENABLED: "true" })).toEqual([]);
  });

  it("Nr. 16: invalid account limit", () => {
    expect(problems({ BETA_MAX_ACCOUNTS: "1000" }).join()).toContain("BETA_MAX_ACCOUNTS");
    expect(problems({ BETA_MAX_ACCOUNTS: "40" })).toEqual([]);
  });

  it("test exception for Mailpit only works together with CI", () => {
    const local = {
      SMTP_HOST: "localhost",
      SMTP_USER: undefined,
      SMTP_PASSWORD: undefined,
      MAIL_FROM: "login@mail.example.org",
      E2E_ALLOW_LOCAL_SMTP: "1",
    };
    expect(problems(local).length).toBeGreaterThan(0);
    expect(problems({ ...local, CI: "true" })).toEqual([]);
    expect(localSmtpAllowedForTests({ E2E_ALLOW_LOCAL_SMTP: "1" })).toBe(false);
    expect(localSmtpAllowedForTests({ E2E_ALLOW_LOCAL_SMTP: "1", CI: "1" })).toBe(true);
  });
});

describe("warnings, feedback, switches", () => {
  it("invalid feedback values only warn and hide the button (Nr. 15)", () => {
    expect(feedbackConfig({ FEEDBACK_WHATSAPP_NUMBER: "+49 151" }).whatsapp).toBeNull();
    expect(feedbackConfig({ FEEDBACK_WHATSAPP_NUMBER: "4915112345678" }).whatsapp).toBe(
      "4915112345678",
    );
    expect(feedbackConfig({ FEEDBACK_EMAIL: "x" }).email).toBeNull();
    expect(betaStartupWarnings({ FEEDBACK_WHATSAPP_NUMBER: "0151 1234" }).join()).toContain(
      "FEEDBACK_WHATSAPP_NUMBER",
    );
    expect(betaStartupWarnings({ PREVIEW_ACCESS_PASSWORD: "x" }).join()).toContain("ignored");
    expect(betaStartupProblems({ ...valid, FEEDBACK_WHATSAPP_NUMBER: "x" })).toEqual([]);
  });

  it("invite way: on by default, kill switch BETA_INVITE_SIGNUP=false", () => {
    expect(betaInviteSignupEnabled({})).toBe(true);
    expect(betaInviteSignupEnabled({ BETA_INVITE_SIGNUP: "false" })).toBe(false);
    expect(betaInviteSignupEnabled({ BETA_INVITE_SIGNUP: "FALSE" })).toBe(false);
  });

  it("service worker only in beta/production, kill switch PWA_SW_ENABLED=false", () => {
    expect(serviceWorkerEnabled("beta", {})).toBe(true);
    expect(serviceWorkerEnabled("production", {})).toBe(true);
    expect(serviceWorkerEnabled("beta", { PWA_SW_ENABLED: "false" })).toBe(false);
    for (const mode of ["development", "ci", "demo", "preview", "staging"]) {
      expect(serviceWorkerEnabled(mode, {})).toBe(false);
    }
  });
});
