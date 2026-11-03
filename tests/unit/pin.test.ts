import { describe, expect, it } from "vitest";
import { isWeakPin, newPinSchema } from "@/lib/auth/validation";

describe("PIN rules", () => {
  it("refuses PINs that are easy to guess", () => {
    for (const pin of ["11111", "00000", "12345", "54321", "98765"]) {
      expect(isWeakPin(pin)).toBe(true);
    }
  });

  it("accepts other PINs", () => {
    for (const pin of ["48261", "10293", "55083"]) {
      expect(isWeakPin(pin)).toBe(false);
    }
  });

  it("asks for the new PIN twice", () => {
    const mismatch = newPinSchema.safeParse({
      code: "123456",
      pin: "48261",
      confirm: "48262",
    });
    expect(mismatch.success).toBe(false);
    expect(mismatch.error?.issues[0]).toMatchObject({
      message: "pinMismatch",
      path: ["confirm"],
    });

    expect(
      newPinSchema.safeParse({ code: "123456", pin: "48261", confirm: "48261" })
        .success,
    ).toBe(true);
  });

  it("needs exactly 5 digits", () => {
    const short = newPinSchema.safeParse({
      code: "123456",
      pin: "4826",
      confirm: "4826",
    });
    expect(short.error?.issues[0].message).toBe("pinInvalid");
  });
});
