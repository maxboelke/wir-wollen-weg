import { describe, expect, it } from "vitest";
import {
  anyoneToRemind,
  remindAllCandidates,
  remindCase,
  remindGroups,
  remindTarget,
  rowTarget,
  whatsappHref,
  type RemindPersonInput,
} from "./remind";

const m = (key: string, done: boolean, organizer = false): RemindPersonInput => ({
  key,
  name: key.charAt(0).toUpperCase() + key.slice(1),
  kind: "member",
  organizer,
  done,
});
const ph = (key: string): RemindPersonInput => ({
  key,
  name: key,
  kind: "placeholder",
  organizer: false,
  done: false,
});

describe("remindGroups (ux-spec §14.2)", () => {
  const members = [m("lena", true, true), m("kai", false), m("kemal", false), m("jonas", true)];

  it("open: members by joining order, then placeholders, the viewer last", () => {
    const groups = remindGroups("collect", members, [ph("mia")], "kai");
    expect(groups.open.map((p) => p.key)).toEqual(["kemal", "mia", "kai"]);
    expect(groups.open.at(-1)?.me).toBe(true);
    expect(groups.done.map((p) => p.key)).toEqual(["lena", "jonas"]);
  });

  it("phase 2 lists members only", () => {
    const groups = remindGroups("vote", members, [ph("mia")], "lena");
    expect(groups.open.map((p) => p.key)).toEqual(["kai", "kemal"]);
  });

  it("«Alle erinnern» only offers open joined members except the viewer", () => {
    const groups = remindGroups("collect", members, [ph("mia")], "kai");
    expect(remindAllCandidates(groups).map((p) => p.key)).toEqual(["kemal"]);
    expect(anyoneToRemind(groups)).toBe(true);
    const alone = remindGroups("collect", [m("lena", true, true), m("kai", false)], [], "kai");
    expect(anyoneToRemind(alone)).toBe(false);
  });
});

describe("remindCase", () => {
  it("placeholder beats everything in phase 1", () => {
    expect(remindCase("collect", { kind: "placeholder" }, 1, true)).toBe("p1Placeholder");
  });
  it("last person, then deadline, then plain", () => {
    expect(remindCase("collect", { kind: "member" }, 1, true)).toBe("p1Last");
    expect(remindCase("collect", { kind: "member" }, 3, true)).toBe("p1Deadline");
    expect(remindCase("collect", { kind: "member" }, 3, false)).toBe("p1");
    expect(remindCase("vote", { kind: "member" }, 1, false)).toBe("p2Last");
    expect(remindCase("vote", { kind: "member" }, 2, true)).toBe("p2Deadline");
    expect(remindCase("vote", { kind: "member" }, 2, false)).toBe("p2");
  });
});

describe("targets", () => {
  const members = [m("lena", true, true), m("kai", true)];

  it("a placeholder row: organiser → personal link, others → tell the organiser", () => {
    const groups = remindGroups("collect", members, [ph("mia")], "kai");
    const mia = groups.open[0];
    expect(mia && rowTarget(mia, true)).toEqual({ step: "single", key: "mia" });
    expect(mia && rowTarget(mia, false)).toEqual({ step: "orga", key: "mia" });
  });

  it("exactly one other open → that person, else the list", () => {
    const one = remindGroups("collect", [...members, m("kemal", false)], [], "kai");
    expect(remindTarget(one, false)).toEqual({ step: "single", key: "kemal" });
    const two = remindGroups("collect", [...members, m("kemal", false)], [ph("mia")], "kai");
    expect(remindTarget(two, false)).toEqual({ step: "status" });
    // The viewer being open does not count as «other».
    const self = remindGroups("collect", [m("lena", false, true), m("kai", false)], [], "kai");
    expect(remindTarget(self, false)).toEqual({ step: "single", key: "lena" });
  });
});

it("whatsappHref encodes the whole text", () => {
  expect(whatsappHref("Hey Kemal & co: https://x.test/a?b=1")).toBe(
    "https://wa.me/?text=Hey%20Kemal%20%26%20co%3A%20https%3A%2F%2Fx.test%2Fa%3Fb%3D1",
  );
});
