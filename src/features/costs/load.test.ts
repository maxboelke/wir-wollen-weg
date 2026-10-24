import { describe, expect, it } from "vitest";
import type { CostsRaw } from "@/server/costs/db";
import type { TripView } from "../trips/load";
import { costsModel } from "./load";

// W19 E.6 (Increment 11a): what leaves the server. Payment details only of the viewer and of
// the people the viewer sends money to (current proposal); «markiert von / am» only for the
// viewer's own settlements and – for the organiser – the rows only they may mark.

const created = new Date("2027-06-01T10:00:00Z");

function view(me: string, organizer = false): TripView {
  const members = [
    { userId: "u-lena", displayName: "Lena", role: "organizer" },
    { userId: "u-kai", displayName: "Kai", role: "member" },
    { userId: "u-max", displayName: "Max", role: "member" },
  ].map((m) => (m.userId === me && organizer ? { ...m, role: "organizer" } : m));
  return {
    trip: {
      publicId: "trip1",
      name: "Lisboa",
      currency: "EUR",
      fixedStart: "2027-06-10",
      fixedEnd: "2027-06-17",
    },
    me: { userId: me },
    isOrganizer: organizer || me === "u-lena",
    members,
    placeholders: [{ id: "ph-mia", displayName: "Mia" }],
    format: { intl: "en-GB", locale: "en", country: "GB" },
    today: "2027-06-12",
  } as unknown as TripView;
}

/** Lena paid 90 for Lena, Kai, Max (30 each); Mia (placeholder) owes a former member 20. */
function raw(settled = false): CostsRaw {
  const expense = (id: string, payer: string, amount: number) => ({
    id,
    title: id,
    note: null,
    amountCents: amount,
    currency: "EUR",
    category: null,
    spentOn: "2027-06-11",
    payerPartyId: payer,
    splitMode: "equal" as const,
    createdBy: null,
    updatedBy: null,
    createdAt: created,
    updatedAt: created,
    version: 1,
    createdByName: null,
    updatedByName: null,
  });
  return {
    parties: [
      {
        id: "p-lena",
        seq: 1,
        userId: "u-lena",
        placeholderId: null,
        formerAt: null,
        formerNo: null,
      },
      { id: "p-kai", seq: 2, userId: "u-kai", placeholderId: null, formerAt: null, formerNo: null },
      { id: "p-max", seq: 3, userId: "u-max", placeholderId: null, formerAt: null, formerNo: null },
      {
        id: "p-mia",
        seq: 4,
        userId: null,
        placeholderId: "ph-mia",
        formerAt: null,
        formerNo: null,
      },
      { id: "p-old", seq: 5, userId: null, placeholderId: null, formerAt: created, formerNo: 1 },
    ],
    expenses: [expense("dinner", "p-lena", 9_000), expense("ferry", "p-old", 2_000)],
    shares: [
      { expenseId: "dinner", partyId: "p-lena", shareCents: 3_000 },
      { expenseId: "dinner", partyId: "p-kai", shareCents: 3_000 },
      { expenseId: "dinner", partyId: "p-max", shareCents: 3_000 },
      { expenseId: "ferry", partyId: "p-mia", shareCents: 2_000 },
    ],
    settlements: settled
      ? [
          {
            id: "s-max",
            from: "p-max",
            to: "p-lena",
            amountCents: 3_000,
            markedBy: "u-max",
            markedByName: "Max",
            markedAt: created,
          },
          {
            id: "s-mia",
            from: "p-mia",
            to: "p-old",
            amountCents: 2_000,
            markedBy: "u-lena",
            markedByName: "Lena",
            markedAt: created,
          },
        ]
      : [],
    payInfos: [
      {
        userId: "u-lena",
        iban: "DE89370400440532013000",
        note: "PayPal: lena",
        updatedAt: created,
      },
      { userId: "u-max", iban: "GB82WEST12345698765432", note: "PayPal: max", updatedAt: created },
      { userId: "u-kai", iban: null, note: "PayPal: kai", updatedAt: created },
    ],
    closed: null,
  };
}

const payOf = (model: ReturnType<typeof costsModel>, key: string) =>
  model.people.find((p) => p.key === key)?.pay ?? null;

describe("costsModel – visibility (W19 E.6)", () => {
  it("Kai pays Lena: Lena's and his own details, never Max's", () => {
    const model = costsModel(view("u-kai"), raw());
    expect(payOf(model, "p-lena")?.iban).toBe("DE89370400440532013000");
    expect(payOf(model, "p-kai")?.note).toBe("PayPal: kai");
    expect(payOf(model, "p-max")).toBeNull();
    expect(JSON.stringify(model)).not.toContain("GB82WEST");
  });

  it("Lena gets money: nobody else's details reach her", () => {
    const model = costsModel(view("u-lena"), raw());
    expect(payOf(model, "p-lena")?.iban).toBe("DE89370400440532013000");
    expect(payOf(model, "p-kai")).toBeNull();
    expect(payOf(model, "p-max")).toBeNull();
  });

  it("other people's settlements: amount and state only – no «markiert von/am»", () => {
    const model = costsModel(view("u-kai"), raw(true));
    const max = model.settlements.find((s) => s.id === "s-max");
    expect(max).toMatchObject({ mine: false, orgaOnly: false, cents: 3_000 });
    expect(max?.markedByName).toBeNull();
    expect(max?.markedOn).toBeNull();
    expect(max?.canUndo).toBe(false);
    const mia = model.settlements.find((s) => s.id === "s-mia");
    expect(mia).toMatchObject({ mine: false, orgaOnly: true, markedByName: null });
  });

  it("own settlements and – for the organiser – the organiser-only rows keep their details", () => {
    const max = costsModel(view("u-max"), raw(true)).settlements.find((s) => s.id === "s-max");
    expect(max).toMatchObject({ mine: true, markedByName: "Max", markedByMe: true });
    expect(max?.markedOn).toBe("2027-06-01");
    const lena = costsModel(view("u-lena"), raw(true));
    expect(lena.settlements.find((s) => s.id === "s-mia")).toMatchObject({
      orgaOnly: true,
      markedByName: "Lena",
      canUndo: true,
    });
  });
});
