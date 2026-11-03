import { describe, expect, it } from "vitest";
import { kigaliDate } from "@/lib/requests/options";
import { requestFieldErrors, requestSchema } from "@/lib/requests/validation";

const valid = {
  garmentId: "00000000-0000-4000-8000-000000000201",
  name: "Keza Mutoni",
  phone: "0788 000 001",
  size: "m",
  quantity: "2",
  neededBy: kigaliDate(10),
  bestTime: "afternoon",
};

describe("Kigali dates", () => {
  it("uses Kigali time, two hours ahead of UTC", () => {
    expect(kigaliDate(0, new Date("2026-11-03T21:59:00Z"))).toBe("2026-11-03");
    expect(kigaliDate(0, new Date("2026-11-03T22:01:00Z"))).toBe("2026-11-04");
    expect(kigaliDate(1, new Date("2026-11-03T10:00:00Z"))).toBe("2026-11-04");
  });
});

describe("request form", () => {
  it("accepts a complete request", () => {
    expect(requestSchema.parse(valid)).toMatchObject({
      phone: "+250788000001",
      quantity: 2,
      size: "m",
    });
  });

  it("explains each mistake in the right field", () => {
    const parsed = requestSchema.safeParse({
      ...valid,
      name: "",
      phone: "12345",
      size: "huge",
      quantity: "0",
      neededBy: kigaliDate(-1),
    });
    expect(requestFieldErrors(parsed.error!)).toEqual({
      name: "nameRequired",
      phone: "phoneInvalid",
      size: "sizeRequired",
      quantity: "quantityInvalid",
      neededBy: "neededByInvalid",
    });
  });

  it("refuses dates more than a year away and more than 20 pieces", () => {
    const parsed = requestSchema.safeParse({
      ...valid,
      quantity: "21",
      neededBy: kigaliDate(400),
    });
    expect(requestFieldErrors(parsed.error!)).toMatchObject({
      quantity: "quantityInvalid",
      neededBy: "neededByInvalid",
    });
  });
});
