import { describe, expect, it } from "vitest";
import {
  escapeHtml,
  maskEmail,
  renderAccessEmail,
  renderAccountDeletedEmail,
  renderAccountInactiveNoticeEmail,
  renderTripDeletionNoticeEmail,
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

  it("exposes code and magic link for the demo inbox (PRD Q25)", () => {
    const mail = renderAccessEmail({ ...base, locale: "de" });
    expect(mail.code).toBe("482913");
    expect(mail.link).toBe(base.magicLinkUrl);
    const reset = renderPasswordResetEmail({ locale: "en", code: "111222" });
    expect(reset.code).toBe("111222");
    expect(reset.link).toBeUndefined();
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
    // the only links: the magic link and the imprint in the footer (compliance §0a)
    expect(html.match(/href="/g)).toHaveLength(2);
    expect(html).toContain('href="http://localhost:3000/en/imprint"');
    expect(html).toContain('lang="en"');
  });

  it("signs with the product name in the mail language", () => {
    expect(renderAccessEmail({ ...base, locale: "de" }).text.split("\n")).toContain(
      "– Wir wollen weg",
    );
    expect(renderAccessEmail({ ...base, locale: "en" }).text.split("\n")).toContain(
      "– When do we go?",
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

describe("privacy mails (F-013, F-043)", () => {
  it("confirms the deletion and names trips deleted for everybody (escaped)", () => {
    const mail = renderAccountDeletedEmail({ locale: "de", deletedTrips: ["<Test>", "Wien"] });
    expect(mail.subject).toBe("Dein Konto wurde gelöscht");
    expect(mail.text).toContain("Für alle gelöscht wurden auch: „<Test>“, „Wien“.");
    expect(mail.html).toContain("&lt;Test&gt;");
    const en = renderAccountDeletedEmail({ locale: "en", deletedTrips: [], inactive: true });
    expect(en.text).toContain("wasn't used for 24 months");
    expect(en.text).not.toContain("Also deleted");
  });

  it("tells the organiser date and reason 14 days before a trip is deleted", () => {
    const mail = renderTripDeletionNoticeEmail({
      locale: "de",
      tripName: "Malle 2026",
      date: new Date("2026-10-25T00:00:00Z"),
      reason: "afterTrip",
      tripUrl: "https://app.example/trips/abcdefghij",
    });
    expect(mail.subject).toBe("„Malle 2026“ wird bald gelöscht");
    expect(mail.text).toContain("am 25. Oktober 2026");
    expect(mail.text).toContain("90 Tagen");
    expect(mail.text.split("\n")).toContain("https://app.example/trips/abcdefghij");
    expect(mail.text).not.toContain("Abrechnung");
  });

  it("names open settlements in the deletion notice – only the number (R.8 I10-10)", () => {
    const mail = renderTripDeletionNoticeEmail({
      locale: "de",
      tripName: "Gardasee",
      date: new Date("2026-10-25T00:00:00Z"),
      reason: "afterTrip",
      tripUrl: "https://app.example/trips/abcdefghij",
      openSettlements: 3,
    });
    expect(mail.text).toContain("Achtung: In der Abrechnung sind noch 3 Überweisungen offen.");
    const en = renderTripDeletionNoticeEmail({
      locale: "en",
      tripName: "Gardasee",
      date: new Date("2026-10-25T00:00:00Z"),
      reason: "afterTrip",
      tripUrl: "https://app.example/trips/abcdefghij",
      openSettlements: 1,
    });
    expect(en.text).toContain("1 transfer is still open");
  });

  it("warns an inactive account 30 days before with a sign-in link", () => {
    const mail = renderAccountInactiveNoticeEmail({
      locale: "en",
      date: new Date("2026-11-10T00:00:00Z"),
      loginUrl: "https://app.example/login",
    });
    expect(mail.text).toContain("on 10 November 2026");
    expect(mail.html).toContain('href="https://app.example/login"');
  });
});

describe("friends beta (W23 A.5, compliance §13.6)", () => {
  it("code first «in the app or browser», link «in the browser», footer without imprint", () => {
    const previous = { env: process.env.APP_ENV, url: process.env.APP_URL };
    process.env.APP_ENV = "beta";
    process.env.APP_URL = "https://app.wirwollenweg.de";
    try {
      const mail = renderAccessEmail({
        locale: "de",
        code: "123456",
        magicLinkUrl: "https://app.wirwollenweg.de/auth/magic?token=x",
      });
      expect(mail.text.indexOf("123456")).toBeLessThan(mail.text.indexOf("Du bist im Browser"));
      expect(mail.text).toContain("Dein Code – gib ihn in der App oder im Browser ein:");
      expect(mail.text).toContain("Private Test-Version von Wir wollen weg");
      expect(mail.text).toContain("Datenschutz: https://app.wirwollenweg.de/de/datenschutz");
      expect(mail.html).not.toContain("Impressum");
      expect(mail.html).not.toContain("PLATZHALTER");
    } finally {
      process.env.APP_ENV = previous.env;
      process.env.APP_URL = previous.url;
      if (previous.env === undefined) delete process.env.APP_ENV;
      if (previous.url === undefined) delete process.env.APP_URL;
    }
  });
});
