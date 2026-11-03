import { describe, expect, it } from "vitest";
import {
  formatRwandaPhone,
  localRwandaPhone,
  normalizeRwandaPhone,
} from "@/lib/auth/phone";

describe("Rwandan phone numbers", () => {
  it("accepts the ways people type a mobile number", () => {
    expect(normalizeRwandaPhone("0781234567")).toBe("+250781234567");
    expect(normalizeRwandaPhone("781234567")).toBe("+250781234567");
    expect(normalizeRwandaPhone("+250 78 123 4567")).toBe("+250781234567");
    expect(normalizeRwandaPhone("250-781-234-567")).toBe("+250781234567");
  });

  it("accepts every Rwandan mobile network", () => {
    for (const prefix of ["72", "73", "78", "79"]) {
      expect(normalizeRwandaPhone(`0${prefix}1234567`)).toBe(
        `+250${prefix}1234567`,
      );
    }
  });

  it("refuses numbers that are not Rwandan mobiles", () => {
    expect(normalizeRwandaPhone("0751234567")).toBeNull();
    expect(normalizeRwandaPhone("07812345")).toBeNull();
    expect(normalizeRwandaPhone("+254781234567")).toBeNull();
    expect(normalizeRwandaPhone("")).toBeNull();
  });

  it("formats numbers for buyers and tailors", () => {
    expect(formatRwandaPhone("+250781234567")).toBe("+250 781 234 567");
    expect(formatRwandaPhone("250781234567")).toBe("+250 781 234 567");
    expect(localRwandaPhone("+250781234567")).toBe("0781 234 567");
  });
});
