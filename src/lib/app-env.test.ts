import { describe, expect, it } from "vitest";
import {
  demoResetAvailable,
  inboxEnabled,
  resolveAppEnv,
  resolveAppUrl,
  resolveAuthUrl,
  showsDemoBanner,
  startupProblems,
  type StartupInput,
} from "./app-env";

const base: StartupInput = {
  appEnv: "development",
  authUrl: "http://localhost:3000",
  previewPassword: undefined,
  mailTransport: "smtp",
  onVercel: false,
  placeholders: [],
};

const preview: StartupInput = {
  ...base,
  appEnv: "preview",
  authUrl: "https://wir-wollen-weg.vercel.app",
  previewPassword: "lange-genug-123",
  mailTransport: "inbox",
  onVercel: true,
};

describe("resolveAppEnv / resolveAppUrl", () => {
  it("defaults to development locally and to preview on Vercel (fail closed)", () => {
    expect(resolveAppEnv({})).toBe("development");
    expect(resolveAppEnv({ VERCEL: "1" })).toBe("preview");
    expect(resolveAppEnv({ VERCEL: "1", APP_ENV: "production" })).toBe("production");
    expect(resolveAppEnv({ APP_ENV: "" })).toBe("development");
  });

  it("uses APP_URL, else the Vercel production domain, else localhost – without trailing slash", () => {
    expect(resolveAppUrl({ APP_URL: "https://example.org/" })).toBe("https://example.org");
    expect(resolveAppUrl({ VERCEL_PROJECT_PRODUCTION_URL: "www-x.vercel.app" })).toBe(
      "https://www-x.vercel.app",
    );
    expect(
      resolveAppUrl({
        APP_URL: "https://a.example",
        VERCEL_PROJECT_PRODUCTION_URL: "b.vercel.app",
      }),
    ).toBe("https://a.example");
    expect(resolveAppUrl({})).toBe("http://localhost:3000");
  });

  it("auth URL: BETTER_AUTH_URL wins, else the app URL", () => {
    expect(resolveAuthUrl({ BETTER_AUTH_URL: "https://auth.example/", APP_URL: "http://x" })).toBe(
      "https://auth.example",
    );
    expect(resolveAuthUrl({ VERCEL_PROJECT_PRODUCTION_URL: "p.vercel.app" })).toBe(
      "https://p.vercel.app",
    );
  });
});

describe("startupProblems", () => {
  it("accepts local development, CI and the http demo", () => {
    expect(startupProblems(base)).toEqual([]);
    expect(startupProblems({ ...base, appEnv: "ci" })).toEqual([]);
    expect(
      startupProblems({ ...base, appEnv: "demo", authUrl: "http://192.168.1.2:3000" }),
    ).toEqual([]);
  });

  it("accepts a complete preview", () => {
    expect(startupProblems(preview)).toEqual([]);
  });

  it("preview: refuses without or with a too short password (fail closed)", () => {
    expect(startupProblems({ ...preview, previewPassword: undefined })[0]).toMatch(
      /PREVIEW_ACCESS_PASSWORD/,
    );
    expect(startupProblems({ ...preview, previewPassword: "kurz" })[0]).toMatch(
      /PREVIEW_ACCESS_PASSWORD/,
    );
  });

  it("R-064: preview, staging and production need https", () => {
    for (const appEnv of ["preview", "staging", "production"]) {
      const problems = startupProblems({ ...preview, appEnv, authUrl: "http://example.org" });
      expect(problems.some((p) => p.includes("https://"))).toBe(true);
    }
    expect(startupProblems({ ...base, appEnv: "production", authUrl: "https://x.org" })).toEqual(
      [],
    );
  });

  it("preview: placeholder legal texts do not block the start, production: they do", () => {
    const placeholders = ["legal.imprint.name"];
    expect(startupProblems({ ...preview, placeholders })).toEqual([]);
    expect(
      startupProblems({ ...base, appEnv: "production", authUrl: "https://x.org", placeholders }),
    ).toEqual([expect.stringMatching(/placeholder texts left \(legal\.imprint\.name\)/)]);
  });

  it("production never runs with the demo inbox", () => {
    expect(
      startupProblems({
        ...base,
        appEnv: "production",
        authUrl: "https://x.org",
        mailTransport: "inbox",
      }),
    ).toEqual([expect.stringMatching(/MAIL_TRANSPORT=inbox/)]);
  });

  it("local-only modes are refused on Vercel", () => {
    for (const appEnv of ["development", "ci", "demo"]) {
      expect(
        startupProblems({ ...base, appEnv, onVercel: true }).some((p) => p.includes("Vercel")),
      ).toBe(true);
    }
  });

  it("unknown modes are refused", () => {
    expect(startupProblems({ ...base, appEnv: "prod" })[0]).toMatch(/unknown/);
  });
});

describe("inboxEnabled / showsDemoBanner", () => {
  it("demo inbox only with MAIL_TRANSPORT=inbox and never in production", () => {
    expect(inboxEnabled({ MAIL_TRANSPORT: "inbox", APP_ENV: "preview" })).toBe(true);
    expect(inboxEnabled({ MAIL_TRANSPORT: "inbox" })).toBe(true);
    expect(inboxEnabled({ MAIL_TRANSPORT: "inbox", APP_ENV: "production" })).toBe(false);
    expect(inboxEnabled({ MAIL_TRANSPORT: "smtp", APP_ENV: "preview" })).toBe(false);
    expect(inboxEnabled({})).toBe(false);
  });

  it("banner in the local demo and the online preview", () => {
    expect(showsDemoBanner({ APP_ENV: "demo" })).toBe(true);
    expect(showsDemoBanner({ APP_ENV: "preview" })).toBe(true);
    expect(showsDemoBanner({ VERCEL: "1" })).toBe(true);
    expect(showsDemoBanner({ APP_ENV: "production" })).toBe(false);
    expect(showsDemoBanner({})).toBe(false);
  });
});

describe("demoResetAvailable", () => {
  it("only in the online preview with the demo inbox", () => {
    expect(demoResetAvailable({ APP_ENV: "preview", MAIL_TRANSPORT: "inbox" })).toBe(true);
    expect(demoResetAvailable({ APP_ENV: "demo", MAIL_TRANSPORT: "inbox" })).toBe(false);
    expect(demoResetAvailable({ APP_ENV: "preview", MAIL_TRANSPORT: "smtp" })).toBe(false);
    expect(demoResetAvailable({ APP_ENV: "production", MAIL_TRANSPORT: "inbox" })).toBe(false);
  });
});
