import { request as httpRequest } from "node:http";
import { expect, test, type Page } from "@playwright/test";
import de from "../../messages/de.json" with { type: "json" };
import { expectNoSeriousAxeViolations } from "./helpers/axe";
import { query, seedTrip, setDatabaseUrl } from "./helpers/db";
import { mailIds, uniqueEmail, waitForAccessMail, waitForCodeMail } from "./helpers/mailpit";

/**
 * Friends beta «Stufe B» (Gate G0, deployment.md §0.12, W23) – project «beta-chromium» against
 * two servers of the same build (playwright.config.ts): «beta» (normal) and «beta-strict»
 * (kill switches BETA_INVITE_SIGNUP=false + PWA_SW_ENABLED=false, account limit 1). Both use the
 * own beta database. Test-only values, same as in playwright.config.ts.
 */
const CODE = "E2E-Beta-Code-2026";
const OLD_CODE = "alter beta code 2025";
const BETA_PORT = Number(process.env.E2E_BETA_PORT ?? 3200);
const STRICT = `http://localhost:${String(BETA_PORT + 1)}`;
const CI_SERVER = `http://localhost:${process.env.PORT ?? "3000"}`;
const BETA_DB = (() => {
  const url = new URL(process.env.DATABASE_URL ?? "postgres://app:app@localhost:5432/wirwollenweg");
  url.pathname = `${url.pathname}_beta`;
  return url.toString();
})();
setDatabaseUrl(BETA_DB);

test.use({ locale: "de-DE" });
// One database for all tests of this file (the account count matters): in order, one worker.
test.describe.configure({ mode: "default" });

// Better Auth allows 3 code requests per minute and IP – every test gets its own address.
let ipCounter = 0;
test.beforeEach(async ({ context }) => {
  ipCounter += 1;
  await context.setExtraHTTPHeaders({
    "x-forwarded-for": `198.18.${String(Math.floor(Math.random() * 250))}.${String(ipCounter)}`,
  });
});

test.beforeAll(async () => {
  await query(
    `truncate "user", trip, rate_limit_event, rate_limit, auth_attempt, verification cascade`,
  );
});

async function enterCode(page: Page, code: string) {
  await page.getByLabel(de.beta.code.label).fill(code);
  await page.getByRole("button", { name: de.beta.code.submit }).click();
}

/** /beta → code → consent → e-mail → code from the mail → name. Returns the address. */
async function signUpViaBeta(page: Page, name: string): Promise<string> {
  const email = uniqueEmail("beta");
  await page.goto("/beta");
  await enterCode(page, CODE);
  await expect(page.getByRole("heading", { name: de.beta.privacy.heading })).toBeVisible();
  await page.getByLabel(de.beta.privacy.consent).check();
  await page.getByRole("button", { name: de.beta.privacy.submit }).click();
  await expect(page).toHaveURL(/\/login\?from=beta/);
  await expect(page.getByRole("heading", { name: de.beta.login.emailHeading })).toBeVisible();
  await page.getByLabel(de.auth.emailLabel).fill(email);
  await page.getByRole("button", { name: de.auth.sendCode }).click();
  const mail = await waitForAccessMail(email);
  await page.getByLabel(de.auth.codeLabel).fill(mail.code);
  await page.getByLabel(de.auth.nameLabel).fill(name);
  await page.getByRole("button", { name: de.auth.saveName }).click();
  return email;
}

function rawGet(
  url: string,
  host: string,
): Promise<{ status: number; location: string | undefined }> {
  return new Promise((resolve, reject) => {
    const req = httpRequest(url, { headers: { host } }, (res) => {
      res.resume();
      resolve({ status: res.statusCode ?? 0, location: res.headers.location });
    });
    req.on("error", reject);
    req.end();
  });
}

test.describe("beta mode basics (deployment.md §0.12.4)", () => {
  test("no Basic Auth, noindex, no demo functions, canonical host", async ({ page, baseURL }) => {
    const landing = await fetch(`${baseURL ?? ""}/de`);
    expect(landing.status).toBe(200);
    expect(landing.headers.get("x-robots-tag")).toContain("noindex");
    const robots = await (await fetch(`${baseURL ?? ""}/robots.txt`)).text();
    expect(robots).toMatch(/Disallow: \/\s*$/m);
    expect((await fetch(`${baseURL ?? ""}/demo/postfach`)).status).toBe(404);

    // Foreign host (e.g. the *.vercel.app address) → 308 to APP_URL; cron + health stay.
    const foreign = await rawGet(`${baseURL ?? ""}/trips?x=1`, "ww-beta.vercel.app");
    expect(foreign.status).toBe(308);
    expect(foreign.location).toBe(`https://localhost:${String(BETA_PORT)}/trips?x=1`);
    expect((await rawGet(`${baseURL ?? ""}/api/health`, "ww-beta.vercel.app")).status).toBe(200);

    // Landing (W23 A.2): beta CTA, note, badge – no demo banner.
    await page.goto("/de");
    await expect(page.getByRole("link", { name: de.beta.landing.cta })).toHaveAttribute(
      "href",
      "/beta",
    );
    await expect(page.getByText(de.beta.landing.note)).toBeVisible();
    await expect(page.getByText(de.common.demoBanner)).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Wir wollen weg – Beta" }).first()).toBeVisible();
  });

  test("privacy notice beta-1 and «Anbieter & Kontakt» without placeholders", async ({ page }) => {
    await page.goto("/de/datenschutz");
    await expect(
      page.getByRole("heading", { level: 1, name: de.legalBeta.privacy.title }),
    ).toBeVisible();
    await expect(page.getByText("Erika Beta (Privatperson)")).toBeVisible();
    await expect(page.getByRole("main")).toContainText("kontakt@wirwollenweg.de");
    await expect(page.getByRole("main")).not.toContainText("PLATZHALTER");
    await page.goto("/de/impressum");
    await expect(
      page.getByRole("heading", { level: 1, name: de.legalBeta.contact.title }),
    ).toBeVisible();
    await expect(page.getByText("Verantwortlich: Erika Beta")).toBeVisible();
    await expect(page.getByRole("main")).not.toContainText("PLATZHALTER");
    await expect(
      page.getByRole("contentinfo").getByRole("link", { name: de.common.contactPage }),
    ).toBeVisible();
  });
});

test.describe("/beta – beta code and consent (W23 A.3/A.4)", () => {
  test("empty and wrong codes show the error at the field – no mail", async ({ page }) => {
    await page.goto("/beta");
    await expect(page.getByRole("heading", { name: de.beta.code.heading })).toBeVisible();
    await page.getByRole("button", { name: de.beta.code.submit }).click();
    await expect(page.getByText(de.beta.code.errorEmpty)).toBeVisible();
    await expect(page.getByLabel(de.beta.code.label)).toBeFocused();
    await enterCode(page, "Falscher-Code-123");
    await expect(page.getByText(de.beta.code.errorWrong)).toBeVisible();
    await expect(page.getByLabel(de.beta.code.label)).toHaveAttribute("aria-invalid", "true");
    await expectNoSeriousAxeViolations(page, "beta code step");
  });

  test("#code= pre-fills without sending; the old code of a rotation still works", async ({
    page,
  }) => {
    await page.goto(`/beta#code=${encodeURIComponent(OLD_CODE)}`);
    await expect(page.getByLabel(de.beta.code.label)).toHaveValue(OLD_CODE);
    await expect(page.getByRole("heading", { name: de.beta.code.heading })).toBeVisible();
    await page.getByRole("button", { name: de.beta.code.submit }).click();
    await expect(page.getByRole("heading", { name: de.beta.privacy.heading })).toBeVisible();
    // Short notice of compliance §13.6 – no «we delete everything at the end» promise.
    for (const key of ["p4", "p5", "p6"] as const) {
      await expect(page.getByText(de.beta.privacy[key])).toBeVisible();
    }
    await page.getByRole("button", { name: de.beta.privacy.submit }).click();
    await expect(page.getByText(de.beta.privacy.errorConsent)).toBeVisible();
    await expect(page.getByLabel(de.beta.privacy.consent)).toBeFocused();
    await expectNoSeriousAxeViolations(page, "beta privacy step");
  });

  test("rate limit: 5 wrong codes per IP in 15 minutes", async ({ browser, baseURL }) => {
    const context = await browser.newContext({
      baseURL: baseURL ?? "",
      locale: "de-DE",
      extraHTTPHeaders: { "x-forwarded-for": "203.0.113.77" },
    });
    const page = await context.newPage();
    await page.goto("/beta");
    for (let i = 0; i < 5; i++) {
      await enterCode(page, `Falsch-Falsch-${String(i)}x`);
      await expect(page.getByText(de.beta.code.errorWrong)).toBeVisible();
    }
    await enterCode(page, CODE);
    await expect(page.getByText(de.beta.code.errorRate.replace("{min}", "15"))).toBeVisible();
    await context.close();
  });
});

test.describe("sign-up and sign-in", () => {
  test("via /beta: consent stored, install step once, mail with code first", async ({
    page,
    browser,
    baseURL,
  }) => {
    const email = await signUpViaBeta(page, "Bea");
    // W23 B.5: the install step comes once, «Später» continues.
    await expect(page).toHaveURL(/\/install\?next=%2Ftrips&first=1$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expectNoSeriousAxeViolations(page, "install step");
    await page.getByRole("button", { name: de.install.later }).click();
    await expect(page).toHaveURL(/\/trips$/);

    const [row] = await query<{
      beta_consent_version: string;
      beta_signup_via: string;
      beta_consent_at: Date | null;
      install_hint_seen_at: Date | null;
    }>(
      `select beta_consent_version, beta_signup_via, beta_consent_at, install_hint_seen_at
         from "user" where email = $1`,
      [email],
    );
    expect(row).toMatchObject({ beta_consent_version: "beta-1", beta_signup_via: "code" });
    expect(row?.beta_consent_at).not.toBeNull();
    expect(row?.install_hint_seen_at).not.toBeNull();
    // The pass is spent with the account.
    const cookies = await page.context().cookies();
    expect(cookies.map((c) => c.name)).not.toContain("ww_beta_pass");

    // Beta mail (W23 A.5, compliance §13.6).
    const mail = await waitForAccessMail(email);
    expect(mail.text).toContain(de.mail.access.betaCodeIntro);
    expect(mail.text).toContain(de.mail.betaFooter);
    expect(mail.text).not.toContain("Impressum");

    // Existing accounts sign in on /login without a beta code – and see no install step.
    const other = await browser.newContext({
      baseURL: baseURL ?? "",
      locale: "de-DE",
      extraHTTPHeaders: { "x-forwarded-for": "198.19.0.12" },
    });
    const second = await other.newPage();
    const seen = await mailIds(email);
    await second.goto("/login");
    await expect(second.getByRole("link", { name: de.beta.login.firstTime })).toBeVisible();
    await second.getByLabel(de.auth.emailLabel).fill(email);
    await second.getByRole("button", { name: de.auth.sendCode }).click();
    const again = await waitForCodeMail(email, { seen });
    await second.getByLabel(de.auth.codeLabel).fill(again.code);
    await expect(second).toHaveURL(/\/trips$/);
    await other.close();
  });

  test("new address directly on /login without beta pass → no account (W23 A.5)", async ({
    page,
  }) => {
    const email = uniqueEmail("direct");
    await page.goto("/login");
    await page.getByLabel(de.auth.emailLabel).fill(email);
    await page.getByRole("button", { name: de.auth.sendCode }).click();
    const mail = await waitForAccessMail(email);
    await page.getByLabel(de.auth.codeLabel).fill(mail.code);
    await expect(page.getByRole("heading", { name: de.beta.signup.missingHeading })).toBeVisible();
    expect(await query(`select id from "user" where email = $1`, [email])).toHaveLength(0);
    await page.getByRole("link", { name: de.beta.signup.missingCta }).click();
    await expect(page).toHaveURL(/\/beta$/);
  });

  test("invite link replaces the beta code (variant B) – consent before the code", async ({
    page,
  }) => {
    const trip = await seedTrip("Beta-Reise Lissabon", { organizer: "Lena Berg" });
    const email = uniqueEmail("invited");
    await page.goto(`/i/${trip.token}`);
    await expect(page.getByText("Lena hat dich zur Beta eingeladen")).toBeVisible();
    const cta = page.getByRole("button", { name: de.invite.joinCta, exact: true });
    if (await cta.isVisible()) await cta.click();
    await page.getByLabel(de.auth.emailLabel).fill(email);
    await page.getByRole("button", { name: de.auth.sendCode }).click();
    await expect(page.getByText(de.auth.errors.consentRequired)).toBeVisible();
    await page.getByLabel(de.beta.privacy.consent).check();
    await page.getByRole("button", { name: de.auth.sendCode }).click();
    const mail = await waitForAccessMail(email);
    await page.getByLabel(de.auth.codeLabel).fill(mail.code);
    await page.getByLabel(de.auth.nameLabel).fill("Ines");
    await page.getByRole("button", { name: de.invite.confirmJoin }).click();
    await expect(page).toHaveURL(/\/install\?next=.*first=1/);
    const [row] = await query<{ beta_signup_via: string; beta_consent_version: string }>(
      `select beta_signup_via, beta_consent_version from "user" where email = $1`,
      [email],
    );
    expect(row).toEqual({ beta_signup_via: "invite", beta_consent_version: "beta-1" });
  });
});

test.describe("PWA (deployment.md §0.12.6)", () => {
  test("manifest, offline page and service worker without personal data in the cache", async ({
    page,
    context,
    baseURL,
  }) => {
    const manifest: unknown = await (
      await fetch(`${baseURL ?? ""}/manifest-de.webmanifest`)
    ).json();
    expect(manifest).toMatchObject({ id: "/", start_url: "/", scope: "/", display: "standalone" });
    expect(manifest).not.toHaveProperty("orientation");
    expect(JSON.stringify(manifest)).not.toContain("Beta");

    const email = await signUpViaBeta(page, "Sven");
    await page.getByRole("button", { name: de.install.later }).click();
    await expect(page).toHaveURL(/\/trips$/);
    await page.evaluate(() => navigator.serviceWorker.ready.then(() => undefined));
    // A small tour through pages with personal data.
    const trip = await seedTrip("Cache-Test-Reise");
    await page.goto(`/i/${trip.token}`);
    await page.getByRole("button", { name: de.invite.joinCta, exact: true }).click();
    await expect(page).toHaveURL(/\/trips\/[^/]+\/days/);
    await page.goto("/account");
    await page.goto("/trips");

    const cached = await page.evaluate(async () => {
      const result: { cache: string; url: string; body: string }[] = [];
      for (const key of await caches.keys()) {
        const cache = await caches.open(key);
        for (const request of await cache.keys()) {
          const response = await cache.match(request);
          const type = response?.headers.get("content-type") ?? "";
          const body = /text|javascript|json|css/.test(type)
            ? ((await response?.text()) ?? "")
            : "";
          result.push({ cache: key, url: new URL(request.url).pathname, body });
        }
      }
      return result;
    });
    expect(cached.length).toBeGreaterThan(0);
    for (const entry of cached) {
      expect(entry.cache).toMatch(/^ww-shell-/);
      expect(
        entry.url === "/offline" ||
          entry.url === "/favicon.svg" ||
          entry.url.startsWith("/fonts/") ||
          entry.url.startsWith("/_next/static/"),
        entry.url,
      ).toBe(true);
      expect(entry.body).not.toContain(email);
      expect(entry.body).not.toContain("Cache-Test-Reise");
    }

    // Offline: navigations get the offline page instead of a browser error (W23 C.2).
    await context.setOffline(true);
    await page.goto("/trips").catch(() => undefined);
    await expect(page.getByRole("heading", { name: de.pwa.offline.heading })).toBeVisible();
    await context.setOffline(false);

    // Sign-out over HTTP sends Clear-Site-Data (§0.12.6 Nr. 6).
    const signOut = await page.request.post("/api/auth/sign-out", {
      headers: { origin: baseURL ?? "", "content-type": "application/json" },
      data: {},
    });
    expect(signOut.status(), await signOut.text()).toBe(200);
    expect(signOut.headers()["clear-site-data"]).toBe('"cache"');
  });

  test("no service worker outside beta/production", async ({ page }) => {
    await page.goto(`${CI_SERVER}/de`);
    await page.waitForLoadState("load");
    const registrations = await page.evaluate(async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return (await navigator.serviceWorker.getRegistrations()).length;
    });
    expect(registrations).toBe(0);
    const source = await (await fetch(`${CI_SERVER}/sw.js`)).text();
    expect(source).toContain("self.registration.unregister()");
  });
});

test.describe("kill switches and limits (server «beta-strict»)", () => {
  test.use({ baseURL: STRICT });

  test("beta full: a valid code is answered with «Die Beta ist gerade voll»", async ({ page }) => {
    // The beta database holds accounts from the tests above; this server allows only 1.
    await query(
      `insert into "user" (name, email, email_verified) values ('Platzhalter', $1, true)`,
      [uniqueEmail("seat")],
    );
    await page.goto("/beta");
    await enterCode(page, CODE);
    await expect(page.getByText(de.beta.code.errorFull)).toBeVisible();
  });

  test("BETA_INVITE_SIGNUP=false: invited people need the beta code (A.5)", async ({ page }) => {
    const trip = await seedTrip("Notschalter-Reise", { organizer: "Lena Berg" });
    const email = uniqueEmail("killswitch");
    await page.goto(`/i/${trip.token}`);
    await expect(
      page.getByText("Neu hier? Für die Beta brauchst du einen Beta-Code"),
    ).toBeVisible();
    const cta = page.getByRole("button", { name: de.invite.joinCta, exact: true });
    if (await cta.isVisible()) await cta.click();
    await expect(page.getByLabel(de.beta.privacy.consent)).toHaveCount(0);
    await page.getByLabel(de.auth.emailLabel).fill(email);
    await page.getByRole("button", { name: de.auth.sendCode }).click();
    const mail = await waitForAccessMail(email);
    await page.getByLabel(de.auth.codeLabel).fill(mail.code);
    await expect(page.getByRole("heading", { name: de.beta.signup.missingHeading })).toBeVisible();
    expect(await query(`select id from "user" where email = $1`, [email])).toHaveLength(0);
  });

  test("PWA_SW_ENABLED=false: no registration, /sw.js unregisters itself", async ({ page }) => {
    await page.goto("/de");
    await page.waitForLoadState("load");
    // A worker installed earlier (simulated) removes itself and the app caches.
    const after = await page.evaluate(async () => {
      await caches.open("ww-shell-old").then((cache) => cache.put("/offline", new Response("x")));
      await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      for (let i = 0; i < 50; i++) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        const left = await navigator.serviceWorker.getRegistrations();
        const keys = await caches.keys();
        if (left.length === 0 && !keys.some((key) => key.startsWith("ww-"))) {
          return { registrations: 0, caches: keys.length };
        }
      }
      return {
        registrations: (await navigator.serviceWorker.getRegistrations()).length,
        caches: (await caches.keys()).length,
      };
    });
    expect(after).toEqual({ registrations: 0, caches: 0 });
  });
});
