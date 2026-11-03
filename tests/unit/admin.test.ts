import { describe, expect, it } from "vitest";
import { toCsv } from "@/lib/admin/csv";
import {
  adminFieldErrors,
  rejectionSchema,
  verificationSchema,
} from "@/lib/admin/validation";
import { kigaliDate } from "@/lib/requests/options";

const tailorId = "00000000-0000-4000-8000-000000000105";

describe("tailor verification form", () => {
  it("needs the tailor's consent", () => {
    const parsed = verificationSchema.safeParse({
      tailorId,
      association: "Kimironko Tailors Cooperative",
      official: "Jean Bosco",
      visitDate: kigaliDate(),
      consent: "",
      notes: "",
    });
    expect(adminFieldErrors(parsed.error!)).toEqual({
      consent: "consentRequired",
    });
  });

  it("refuses a visit date in the future", () => {
    const parsed = verificationSchema.safeParse({
      tailorId,
      association: "Kimironko Tailors Cooperative",
      official: "Jean Bosco",
      visitDate: kigaliDate(3),
      consent: "on",
      notes: "",
    });
    expect(adminFieldErrors(parsed.error!)).toEqual({
      visitDate: "visitInvalid",
    });
  });
});

describe("garment rejection form", () => {
  const garmentId = "00000000-0000-4000-8000-000000000209";

  it("accepts a listed reason without a note", () => {
    expect(
      rejectionSchema.safeParse({ garmentId, reason: "photos", note: "" })
        .success,
    ).toBe(true);
  });

  it("needs a note when the reason is Other", () => {
    const parsed = rejectionSchema.safeParse({
      garmentId,
      reason: "other",
      note: " ",
    });
    expect(adminFieldErrors(parsed.error!)).toEqual({
      note: "reasonRequired",
    });
  });
});

describe("CSV export", () => {
  it("writes a header and quotes awkward cells", () => {
    expect(
      toCsv([
        { code: "B01", note: 'Said "great", then left', minutes: 3.5 },
        { code: "B02", note: null, minutes: 0 },
      ]),
    ).toBe('code,note,minutes\nB01,"Said ""great"", then left",3.5\nB02,,0');
  });

  it("is empty when there are no rows", () => {
    expect(toCsv([])).toBe("");
  });
});
