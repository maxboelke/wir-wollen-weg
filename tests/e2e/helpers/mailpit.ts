// Minimal Mailpit API client for E2E tests (https://mailpit.axllent.org/docs/api-v1/).
const MAILPIT = process.env.MAILPIT_API_URL ?? "http://localhost:8025";

interface MessageSummary {
  ID: string;
  Subject: string;
}

export interface AccessMail {
  subject: string;
  code: string;
  magicLink: string;
  text: string;
}

/** Waits for the newest mail to `email` and extracts the 6-digit code and the magic link. */
export async function waitForAccessMail(email: string, timeoutMs = 15_000): Promise<AccessMail> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const search = await fetch(
      `${MAILPIT}/api/v1/search?query=${encodeURIComponent(`to:"${email}"`)}&limit=1`,
    );
    if (search.ok) {
      const { messages } = (await search.json()) as { messages: MessageSummary[] };
      const latest = messages[0];
      if (latest) {
        const detail = (await (await fetch(`${MAILPIT}/api/v1/message/${latest.ID}`)).json()) as {
          Text: string;
        };
        const code = /^(\d{6})$/m.exec(detail.Text)?.[1];
        const magicLink = /^(https?:\/\/\S+\/auth\/magic\?\S+)$/m.exec(detail.Text)?.[1];
        if (!code || !magicLink) throw new Error("Access mail without code or link");
        return { subject: latest.Subject, code, magicLink, text: detail.Text };
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`No mail for ${email} within ${timeoutMs} ms`);
}

/** Unique address per test run and project (tests run in parallel). */
export function uniqueEmail(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.org`;
}
