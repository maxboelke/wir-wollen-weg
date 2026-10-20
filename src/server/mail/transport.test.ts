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
