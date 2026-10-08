import { describe, expect, it } from "vitest";
import { escapeHtml, renderAccessEmail } from "./access-email";

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
    expect(mail.text.split("\n")).toContain("482913");
    expect(mail.text).toContain(base.magicLinkUrl);
    expect(mail.html).toContain("482913");
    expect(mail.html).toContain(escapeHtml(base.magicLinkUrl));
  });

  it("mentions the trip in the invite context and escapes it in HTML", () => {
    const mail = renderAccessEmail({ ...base, locale: "de", tripName: "<Lissabon> 2027" });
    expect(mail.text.startsWith("Du trittst „<Lissabon> 2027“ bei.")).toBe(true);
    expect(mail.html).toContain("&lt;Lissabon&gt; 2027");
    expect(mail.html).not.toContain("<Lissabon>");
  });
});
