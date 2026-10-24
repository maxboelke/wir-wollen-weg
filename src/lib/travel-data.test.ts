import { describe, expect, it } from "vitest";
import {
  canRequestOn,
  cleanName,
  cleanPurpose,
  copyFieldsOf,
  datePartsToIso,
  expiresBeforeReturn,
  genitiveDe,
  maskDocumentNumber,
  maskName,
  maskValue,
  normalizeDocumentNumber,
  normalizeRequestFields,
  overlappingValues,
  parseStoredValues,
  splitPastedDate,
  travelDataExpired,
  travelDeleteOn,
  unfixedTooLong,
  validateTravelValues,
} from "./travel-data";

const TODAY = "2027-03-01";

describe("request fields (R.9 Felder)", () => {
  it("name always, dependent fields only with the document, fixed order", () => {
    expect(normalizeRequestFields(["birth_date", "legal_name"])).toEqual([
      "legal_name",
      "birth_date",
    ]);
    expect(normalizeRequestFields(["birth_date"])).toBeNull();
    expect(normalizeRequestFields(["legal_name", "document_expiry"])).toBeNull();
    expect(normalizeRequestFields(["legal_name", "issuing_country", "document"])).toEqual([
      "legal_name",
      "document",
      "issuing_country",
    ]);
    expect(normalizeRequestFields(["legal_name", "address"])).toBeNull();
    expect(normalizeRequestFields("legal_name")).toBeNull();
  });

  it("purpose: text only, control characters removed, 1–60", () => {
    expect(cleanPurpose("  Flüge\u0000 München –‮ Split ")).toBe("Flüge München – Split");
    expect(cleanPurpose("")).toBeNull();
    expect(cleanPurpose(" \n ")).toBeNull();
    expect(cleanPurpose("x".repeat(60))).toHaveLength(60);
    expect(cleanPurpose("x".repeat(61))).toBeNull();
    expect(cleanPurpose(42)).toBeNull();
  });

  it("copy fields of a request", () => {
    expect(copyFieldsOf(["legal_name", "birth_date"])).toEqual([
      "given_name",
      "family_name",
      "birth_date",
    ]);
    expect(copyFieldsOf(["legal_name", "document", "document_expiry"])).toEqual([
      "given_name",
      "family_name",
      "document_type",
      "document_number",
      "document_expiry",
    ]);
  });
});

describe("values (R.9 Prüfung)", () => {
  it("names: letters of all scripts, hyphen, apostrophe, dot – no digits", () => {
    expect(cleanName("  Anna-Lena  Maria ")).toBe("Anna-Lena Maria");
    expect(cleanName("Zoë O’Brien")).toBe("Zoë O’Brien");
    expect(cleanName("Łukasz")).toBe("Łukasz");
    expect(cleanName("Иван")).toBe("Иван");
    expect(cleanName("R2D2")).toBeNull();
    expect(cleanName("<b>Max</b>")).toBeNull();
    expect(cleanName("-Max")).toBeNull();
    expect(cleanName("a".repeat(101))).toBeNull();
  });

  it("document number: upper case, without spaces, 5–20 A–Z/0–9", () => {
    expect(normalizeDocumentNumber(" c01x 4f7r7 ")).toBe("C01X4F7R7");
    expect(normalizeDocumentNumber("AB12")).toBeNull();
    expect(normalizeDocumentNumber("AB-12345")).toBeNull();
    expect(normalizeDocumentNumber("A".repeat(21))).toBeNull();
  });

  it("dates from three parts; impossible dates are rejected", () => {
    expect(datePartsToIso("7", "4", "1995")).toBe("1995-04-07");
    expect(datePartsToIso("31", "4", "1995")).toBeNull();
    expect(datePartsToIso("29", "2", "2024")).toBe("2024-02-29");
    expect(datePartsToIso("", "4", "1995")).toBeNull();
    expect(datePartsToIso("7", "4", "95")).toBeNull();
  });

  it("pasting a whole date fills all parts (en-US: month first)", () => {
    expect(splitPastedDate("07.04.1995")).toEqual({ day: "07", month: "04", year: "1995" });
    expect(splitPastedDate("1995-04-07")).toEqual({ day: "07", month: "04", year: "1995" });
    expect(splitPastedDate("04/07/1995", true)).toEqual({ day: "07", month: "04", year: "1995" });
    expect(splitPastedDate("hello")).toBeNull();
  });

  it("validates exactly the requested fields and drops everything else", () => {
    const result = validateTravelValues(
      {
        givenNames: "Erika Maria",
        familyNames: "Musterfrau",
        birthDay: "12",
        birthMonth: "8",
        birthYear: "1990",
        documentNumber: "C01X4F7R7",
        nationality: "DE",
      },
      ["legal_name", "birth_date"],
      { today: TODAY, demo: false },
    );
    expect(result).toEqual({
      ok: true,
      values: { givenNames: "Erika Maria", familyNames: "Musterfrau", birthDate: "1990-08-12" },
    });
  });

  it("every requested field is required, with one error code per field", () => {
    const result = validateTravelValues(
      { birthDay: "12", birthMonth: "", birthYear: "1990", documentNumber: "x" },
      [
        "legal_name",
        "birth_date",
        "sex",
        "nationality",
        "document",
        "document_expiry",
        "issuing_country",
      ],
      { today: TODAY, demo: false },
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toEqual({
        givenNames: "givenRequired",
        familyNames: "familyRequired",
        birthDate: "dateIncomplete",
        sex: "sexRequired",
        nationality: "nationalityRequired",
        documentType: "documentTypeRequired",
        documentNumber: "documentNumberInvalid",
        documentExpiry: "expiryIncomplete",
        issuingCountry: "countryRequired",
      });
    }
  });

  it("birth date: not in the future, not older than 120 years", () => {
    const check = (d: string, m: string, y: string) =>
      validateTravelValues(
        { givenNames: "A", familyNames: "B", birthDay: d, birthMonth: m, birthYear: y },
        ["legal_name", "birth_date"],
        { today: TODAY, demo: false },
      );
    expect(check("2", "3", "2027")).toMatchObject({ errors: { birthDate: "dateFuture" } });
    expect(check("1", "1", "1890")).toMatchObject({ errors: { birthDate: "dateYear" } });
    expect(check("31", "2", "1990")).toMatchObject({ errors: { birthDate: "dateInvalid" } });
    expect(check("1", "3", "2027").ok).toBe(true);
  });

  it("demo/preview: document numbers must start with DEMO (server rule, I11-12)", () => {
    const input = {
      givenNames: "A",
      familyNames: "B",
      documentType: "passport",
      documentNumber: "C01X4F7R7",
    };
    expect(
      validateTravelValues(input, ["legal_name", "document"], { today: TODAY, demo: true }),
    ).toMatchObject({ ok: false, errors: { documentNumber: "documentDemo" } });
    expect(
      validateTravelValues({ ...input, documentNumber: "demo 48151" }, ["legal_name", "document"], {
        today: TODAY,
        demo: true,
      }),
    ).toMatchObject({ ok: true, values: { documentNumber: "DEMO48151" } });
    expect(
      validateTravelValues(input, ["legal_name", "document"], { today: TODAY, demo: false }).ok,
    ).toBe(true);
  });

  it("stored records must contain only requested fields", () => {
    expect(parseStoredValues({ givenNames: "A", familyNames: "B" }, ["legal_name"])).toEqual({
      givenNames: "A",
      familyNames: "B",
    });
    expect(parseStoredValues({ givenNames: "A", birthDate: "x" }, ["legal_name"])).toBeNull();
    expect(parseStoredValues("x", ["legal_name"])).toBeNull();
  });

  it("taking over values only fills overlapping fields", () => {
    expect(
      overlappingValues({ givenNames: "A", familyNames: "B", birthDate: "1990-01-01", sex: "F" }, [
        "legal_name",
        "birth_date",
      ]),
    ).toEqual({ givenNames: "A", familyNames: "B", birthDate: "1990-01-01" });
  });
});

describe("masks (server-side, W20 H.7)", () => {
  it("names per word, dates and numbers with fixed shapes", () => {
    expect(maskName("Maria Luisa")).toBe("M••• L•••");
    expect(maskDocumentNumber("C01X4F7R7")).toBe("C••••7");
    expect(maskValue("birth_date", "1990-08-12")).toBe("••.••.••••");
    expect(maskValue("nationality", "DE")).toBe("•••");
    expect(maskValue("sex", "F")).toBe("•••");
    // A mask never contains the value beyond the allowed first/last character.
    expect(maskValue("family_name", "Musterfrau")).not.toContain("uster");
  });
});

describe("lifecycle (Q31)", () => {
  it("deletion date = departure + 7, expired from the day after", () => {
    expect(travelDeleteOn("2027-06-19")).toBe("2027-06-26");
    expect(travelDataExpired("2027-06-19", "2027-06-26")).toBe(false);
    expect(travelDataExpired("2027-06-19", "2027-06-27")).toBe(true);
    expect(travelDataExpired(null, "2027-06-27")).toBe(false);
  });

  it("30 days after «Festlegung aufheben»", () => {
    const at = new Date("2027-03-01T10:00:00Z");
    expect(unfixedTooLong(at, new Date("2027-03-31T09:59:59Z"))).toBe(false);
    expect(unfixedTooLong(at, new Date("2027-03-31T10:00:00Z"))).toBe(true);
    expect(unfixedTooLong(null, new Date())).toBe(false);
  });

  it("new requests until the departure day; expiry hint before the return", () => {
    expect(canRequestOn("2027-06-19", "2027-06-19")).toBe(true);
    expect(canRequestOn("2027-06-19", "2027-06-20")).toBe(false);
    expect(expiresBeforeReturn("2027-06-01", "2027-06-19")).toBe(true);
    expect(expiresBeforeReturn("2027-07-01", "2027-06-19")).toBe(false);
  });

  it("German genitive", () => {
    expect(genitiveDe("Sara")).toBe("Saras");
    expect(genitiveDe("Jonas")).toBe("Jonas’");
    expect(genitiveDe("Max")).toBe("Max’");
  });
});
