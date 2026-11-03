import { describe, expect, it } from "vitest";
import { garmentFieldErrors, garmentSchema } from "@/lib/shop/validation";

const valid = {
  photos: JSON.stringify([
    { publicId: "akiba/garments/tailor/photo", width: 1200, height: 1600 },
  ]),
  name: "Kitenge wrap dress",
  category: "tops:blouses",
  material: "kitenge-cotton",
  audience: "women",
  description: "",
  story: "I made this from my mother's last bolt of kitenge.",
  price: "31,500",
  makingDays: "5",
};

describe("garment form", () => {
  it("accepts a complete garment", () => {
    const parsed = garmentSchema.parse(valid);
    expect(parsed.price).toBe(31500);
    expect(parsed.category).toEqual({
      category: "tops",
      subcategory: "blouses",
    });
    expect(parsed.description).toBeNull();
    expect(parsed.makingDays).toBe(5);
  });

  it("allows Made in (days) to be left empty", () => {
    expect(garmentSchema.parse({ ...valid, makingDays: "" }).makingDays).toBe(
      null,
    );
  });

  it("explains each mistake in the right field", () => {
    const parsed = garmentSchema.safeParse({
      ...valid,
      photos: "[]",
      name: "A",
      category: "tops:trousers",
      audience: "",
      story: "Short",
      price: "100",
      makingDays: "200",
    });
    expect(parsed.success).toBe(false);
    expect(garmentFieldErrors(parsed.error!)).toEqual({
      photos: "photosRequired",
      name: "nameRequired",
      category: "categoryRequired",
      audience: "audienceRequired",
      story: "storyRequired",
      price: "priceInvalid",
      makingDays: "makingDaysInvalid",
    });
  });

  it("refuses more than 5 photos", () => {
    const photo = { publicId: "p", width: 1, height: 1 };
    const parsed = garmentSchema.safeParse({
      ...valid,
      photos: JSON.stringify(Array.from({ length: 6 }, () => photo)),
    });
    expect(garmentFieldErrors(parsed.error!).photos).toBe("photosTooMany");
  });
});
