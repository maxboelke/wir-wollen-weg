import { beforeEach, describe, expect, it, vi } from "vitest";

const stored = vi.fn<(to: string, mail: unknown) => Promise<void>>(() => Promise.resolve());
const smtpSend = vi.fn(() => Promise.resolve({}));
let transport: "smtp" | "inbox" = "inbox";

vi.mock("server-only", () => ({}));
vi.mock("./demo-inbox", () => ({ storeDemoMail: stored }));
vi.mock("nodemailer", () => ({ default: { createTransport: () => ({ sendMail: smtpSend }) } }));
vi.mock("../env", () => ({
  serverEnv: () => ({
    MAIL_TRANSPORT: transport,
    MAIL_FROM: "login@mail.example.org",
    SMTP_HOST: "localhost",
    SMTP_PORT: 1025,
    SMTP_SECURE: false,
  }),
}));

const { sendLocalizedMail } = await import("./transport");
const mail = {
  subject: "123456 ist dein Code",
  text: "123456",
  html: "<p>123456</p>",
  code: "123456",
};

describe("mail transport", () => {
  beforeEach(() => {
    stored.mockClear();
    smtpSend.mockClear();
  });

  it("MAIL_TRANSPORT=inbox stores the mail instead of sending it", async () => {
    transport = "inbox";
    await sendLocalizedMail("anna@demo.test", "de", mail);
    expect(stored).toHaveBeenCalledWith("anna@demo.test", mail);
    expect(smtpSend).not.toHaveBeenCalled();
  });

  it("MAIL_TRANSPORT=smtp sends via SMTP and stores nothing", async () => {
    transport = "smtp";
    await sendLocalizedMail("anna@demo.test", "de", mail);
    expect(smtpSend).toHaveBeenCalledOnce();
    expect(stored).not.toHaveBeenCalled();
  });
});

describe("smtpOptions (deployment.md §0.12.9)", () => {
  it("implicit TLS on 465, STARTTLS required for remote hosts, timeouts, no pool", async () => {
    const { smtpOptions } = await import("./transport");
    const secure = smtpOptions({
      SMTP_HOST: "smtp.lettermint.co",
      SMTP_PORT: 465,
      SMTP_SECURE: true,
      SMTP_USER: "lettermint",
      SMTP_PASSWORD: "t",
    });
    expect(secure).toMatchObject({
      secure: true,
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
      pool: false,
      auth: { user: "lettermint", pass: "t" },
    });
    expect(secure).not.toHaveProperty("requireTLS");
    expect(
      smtpOptions({ SMTP_HOST: "smtp.lettermint.co", SMTP_PORT: 587, SMTP_SECURE: false }),
    ).toMatchObject({ requireTLS: true });
    expect(
      smtpOptions({ SMTP_HOST: "localhost", SMTP_PORT: 1025, SMTP_SECURE: false }),
    ).not.toHaveProperty("requireTLS");
  });
});
