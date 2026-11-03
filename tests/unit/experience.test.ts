import { describe, expect, it } from "vitest";
import {
  experienceFrom,
  experienceLevel,
  tailoringSince,
} from "@/lib/experience";

const today = new Date("2026-11-03T10:00:00Z");

describe("experience levels", () => {
  it("matches the scale shown to buyers", () => {
    expect(experienceLevel(0)).toBe("new");
    expect(experienceLevel(11)).toBe("new");
    expect(experienceLevel(12)).toBe("skilled");
    expect(experienceLevel(59)).toBe("skilled");
    expect(experienceLevel(60)).toBe("experienced");
    expect(experienceLevel(119)).toBe("experienced");
    expect(experienceLevel(120)).toBe("master");
  });
});

describe("tailoring start date", () => {
  it("turns years and months into a start date", () => {
    expect(tailoringSince(9, 4, today)).toBe("2017-07-03");
    expect(tailoringSince(0, 0, today)).toBe("2026-11-03");
  });

  it("gives back the same years and months", () => {
    const since = tailoringSince(9, 4, today);
    expect(experienceFrom(since, today)).toEqual({
      years: 9,
      months: 4,
      level: "experienced",
    });
  });

  it("does not count a month that is not finished yet", () => {
    expect(experienceFrom("2026-10-04", today).months).toBe(0);
    expect(experienceFrom("2026-10-03", today).months).toBe(1);
  });

  it("never goes below zero", () => {
    expect(experienceFrom("2027-01-01", today)).toMatchObject({
      years: 0,
      months: 0,
    });
  });
});
