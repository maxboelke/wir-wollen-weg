import { expect, test } from "@playwright/test";

/**
 * Without MAIL_TRANSPORT=inbox (CI/dev, and always in production – unit test app-env.test.ts)
 * the demo inbox of the online preview does not exist, and there is no Basic Auth.
 */
test("demo inbox is a 404 without MAIL_TRANSPORT=inbox; no Basic Auth outside preview", async ({
  request,
}) => {
  const inbox = await request.get("/demo/postfach");
  expect(inbox.status()).toBe(404);
  const login = await request.get("/login");
  expect(login.status()).toBe(200);
  expect(login.headers()["www-authenticate"]).toBeUndefined();
  const robots = await request.get("/robots.txt");
  expect(await robots.text()).toMatch(/Disallow: \/\s*$/m);
});
