import { describe, expect, it } from "vitest";
import {
  escapeHtml,
  maskEmail,
  renderAccessEmail,
  renderChangeEmailEmail,
  renderEmailChangedEmail,
  renderPasswordResetEmail,
  renderReauthEmail,
} from "./templates";

const base = {
  code: "482913",
  magicLinkUrl: "https://app.example/auth/magic?token=t&next=%2Fi%2Fx",
};

describe("renderAccessEmail", () => {
  it("puts the code first in the subject (DE)", () => {
    const mail = renderAccessEmail({ ...base, locale: "de" });
    expect(mail.subject).toBe("482913 ist dein Code für Wir wollen weg");
  });

  it("uses the English product name (EN)", () => {
    const mail = renderAccessEmail({ ...base, locale: "en" });
    expect(mail.subject).toBe("482913 is your code for When do we go?");
  });

  it("contains code on its own line and the magic link in ONE mail", () => {
    const mail = renderAccessEmail({ ...base, locale: "de" });
    const lines = mail.text.split("\n");
    expect(lines).toContain("482913");
    expect(lines).toContain(base.magicLinkUrl);
    expect(mail.html).toContain("482913");
    expect(mail.html).toContain(`href="${escapeHtml(base.magicLinkUrl)}"`);
  });

  it("mentions the trip in the invite context and escapes it in HTML", () => {
    const mail = renderAccessEmail({ ...base, locale: "de", tripName: "<Lissabon> 2027" });
    expect(mail.text.startsWith("Du trittst „<Lissabon> 2027“ bei.")).toBe(true);
    expect(mail.html).toContain("&lt;Lissabon&gt; 2027");
    expect(mail.html).not.toContain("<Lissabon>");
  });

  it("is self-contained: no external images, fonts or tracking", () => {
    const { html } = renderAccessEmail({ ...base, locale: "en" });
    expect(html).not.toMatch(/<img|@import|<link|url\(/i);
    // the only link is the magic link
    expect(html.match(/href="/g)).toHaveLength(1);
    expect(html).toContain('lang="en"');
  });

  it("signs with the product name in the mail language", () => {
    expect(renderAccessEmail({ ...base, locale: "de" }).text.endsWith("– Wir wollen weg")).toBe(
      true,
    );
    expect(renderAccessEmail({ ...base, locale: "en" }).text.endsWith("– When do we go?")).toBe(
      true,
    );
  });
});

describe("other transactional mails", () => {
  it("password reset: code first in subject and on its own line", () => {
    const mail = renderPasswordResetEmail({ locale: "de", code: "123456" });
    expect(mail.subject.startsWith("123456")).toBe(true);
    expect(mail.text.split("\n")).toContain("123456");
  });

  it("re-authentication and e-mail change carry the code", () => {
    expect(renderReauthEmail({ locale: "en", code: "654321" }).subject).toBe(
      "654321 is your confirmation code",
    );
    const change = renderChangeEmailEmail({
      locale: "de",
      code: "111222",
      newEmail: "neu@example.org",
    });
    expect(change.text).toContain("neu@example.org");
    expect(change.text.split("\n")).toContain("111222");
  });

  it("info to the old address masks the new one and names the contact", () => {
    const mail = renderEmailChangedEmail({
      locale: "en",
      newEmail: "kemal@new.example",
      contact: "help@example.org",
    });
    expect(mail.text).toContain("k•••@new.example");
    expect(mail.text).not.toContain("kemal@new.example");
    expect(mail.text).toContain("help@example.org");
  });

  it("masks addresses", () => {
    expect(maskEmail("lena@example.org")).toBe("l•••@example.org");
  });
});
