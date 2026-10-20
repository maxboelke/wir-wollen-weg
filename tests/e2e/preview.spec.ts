import { expect, test, type BrowserContext } from "@playwright/test";
import de from "../../messages/de.json" with { type: "json" };
import { expectNoSeriousAxeViolations } from "./helpers/axe";
import { uniqueEmail } from "./helpers/mailpit";

/**
 * Online preview (PRD Q25, deployment.md §0.7) – runs against the second server of
 * playwright.config.ts (project «preview-chromium»): APP_ENV=preview, Basic Auth,
 * MAIL_TRANSPORT=inbox, https base URL. Test-only values, same as in playwright.config.ts.
 */
const PASSWORD = "e2e-preview-password";
const CRON_SECRET = "e2e-only-cron-secret-0123456789abcdef0123";
const basic = (password: string, user = "demo") =>
  `Basic ${Buffer.from(`${user}:${password}`).toString("base64")}`;

test.use({ locale: "de-DE", httpCredentials: { username: "demo", password: PASSWORD } });

test.describe("access protection (Basic Auth)", () => {
  // Plain fetch: Playwright's request contexts may answer a 401 challenge with the configured
  // httpCredentials – here the raw answer counts.
  test("pages and API need the password – 401 without, 200 with (any user name)", async ({
    baseURL,
  }) => {
    const get = (path: string, authorization?: string) =>
      fetch(`${baseURL ?? ""}${path}`, {
        redirect: "manual",
        headers: authorization ? { authorization } : {},
      });
    for (const path of ["/", "/de", "/login", "/demo/postfach", "/api/auth/get-session"]) {
      const response = await get(path);
      expect(response.status, path).toBe(401);
      expect(response.headers.get("www-authenticate")).toMatch(/^Basic realm=/);
      expect(response.headers.get("x-robots-tag")).toBe("noindex, nofollow");
      expect(response.headers.get("cache-control")).toBe("no-store");
    }
    expect((await get("/login", basic("falsch"))).status).toBe(401);
    expect((await get("/login", `Bearer ${PASSWORD}`)).status).toBe(401);
    const right = await get("/login", basic(PASSWORD, "irgendwer"));
    expect(right.status).toBe(200);
    expect(right.headers.get("x-robots-tag")).toContain("noindex");
  });

  test("health, robots.txt and the cron endpoint stay reachable without the password", async ({
    baseURL,
  }) => {
    const get = (path: string, authorization?: string) =>
      fetch(`${baseURL ?? ""}${path}`, {
        redirect: "manual",
        headers: authorization ? { authorization } : {},
      });
    expect((await get("/api/health")).status).toBe(200);
    const robots = await get("/robots.txt");
    expect(robots.status).toBe(200);
    expect(await robots.text()).toMatch(/Disallow: \/\s*$/m);
    // Vercel Cron: GET with «Authorization: Bearer $CRON_SECRET».
    expect((await get("/api/internal/retention")).status).toBe(404);
    expect(
      (await get("/api/internal/retention", "Bearer wrong-wrong-wrong-wrong-wrong-wrong-00"))
        .status,
    ).toBe(404);
    const cron = await get("/api/internal/retention", `Bearer ${CRON_SECRET}`);
    expect(cron.status).toBe(200);
    expect(await cron.json()).toHaveProperty("demoMailsDeleted");
  });
});

async function signUpViaInbox(context: BrowserContext, email: string) {
  const page = await context.newPage();
  await page.goto("/login");
  // Demo banner of the preview links to the inbox.
  await expect(
    page.getByRole("note").getByRole("link", { name: de.common.demoInboxLink }),
  ).toBeVisible();
  await page.getByLabel(de.auth.emailLabel).fill(email);
  await page.getByRole("button", { name: de.auth.sendCode }).click();
  await expect(page.getByText(de.auth.demoInboxHint)).toBeVisible();
  const inboxLink = page.getByRole("main").getByRole("link", { name: de.auth.demoInboxOpen });
  await expect(inboxLink).toHaveAttribute("href", `/demo/postfach?to=${encodeURIComponent(email)}`);
  await expect(inboxLink).toHaveAttribute("target", "_blank");
  await expect(page.getByText(de.auth.statusSending)).toBeHidden();

  // The inbox opens in a new tab with the code of exactly this address.
  const [inbox] = await Promise.all([context.waitForEvent("page"), inboxLink.click()]);
  await inbox.waitForLoadState();
  await expect(inbox.getByRole("heading", { level: 1, name: de.demoInbox.title })).toBeVisible();
  const mail = inbox.getByRole("listitem").first();
  await expect(mail).toContainText(de.demoInbox.to.replace("{email}", email));
  const code = (await mail.locator("[aria-label^='Code ']").textContent())?.trim() ?? "";
  expect(code).toMatch(/^\d{6}$/);
  await expect(mail.getByRole("link", { name: de.demoInbox.openLink })).toHaveAttribute(
    "href",
    /^https:\/\/vorschau\.example\/auth\/magic\?/,
  );
  await expectNoSeriousAxeViolations(inbox, "demo inbox");
  await inbox.close();

  await page.getByLabel(de.auth.codeLabel).fill(code);
  await page.getByLabel(de.auth.nameLabel).fill("Vera");
  await page.getByRole("button", { name: de.auth.saveName }).click();
  await expect(page).toHaveURL(/\/trips$/);
  return page;
}

test.describe("demo inbox (MAIL_TRANSPORT=inbox)", () => {
  test("sign up with the code from /demo/postfach; session cookie is Secure", async ({
    context,
  }) => {
    const email = uniqueEmail("preview");
    await signUpViaInbox(context, email);
    const cookies = await context.cookies();
    const session = cookies.find((cookie) => cookie.name.endsWith("ww.session_token"));
    expect(session?.name).toBe("__Secure-ww.session_token");
    expect(session?.secure).toBe(true);
    expect(session?.httpOnly).toBe(true);
  });

  test("filter by address, newest first", async ({ context, page }) => {
    const email = uniqueEmail("preview-filter");
    await signUpViaInbox(context, email);
    await page.goto(`/demo/postfach?to=${encodeURIComponent(email.toUpperCase())}`);
    await expect(page.getByLabel(de.demoInbox.filterLabel)).toHaveValue(email);
    await expect(page.getByRole("main").getByRole("article")).toHaveCount(1);
    await page.getByRole("link", { name: de.demoInbox.showAll }).click();
    await expect(page).toHaveURL(/\/demo\/postfach$/);
    await expect(page.getByLabel(de.demoInbox.filterLabel)).toHaveValue("");
  });

  test("«Demo zurücksetzen» needs the confirmation and re-creates the demo data", async ({
    page,
  }) => {
    await page.goto("/demo/postfach");
    await page.getByText(de.demoInbox.reset.title, { exact: true }).first().click();
    const submit = page.getByRole("button", { name: de.demoInbox.reset.submit });
    await submit.click();
    await expect(page.getByRole("main").getByRole("alert")).toHaveText(
      de.demoInbox.reset.confirmRequired,
    );
    await page.getByLabel(de.demoInbox.reset.confirm).check();
    await submit.click();
    await expect(page).toHaveURL(/\/demo\/postfach\?reset=done$/, { timeout: 30_000 });
    await expect(
      page.getByRole("status").filter({ hasText: de.demoInbox.reset.done }),
    ).toBeVisible();
  });
});
