import { z } from "zod";
import {
  audienceSlugs,
  findCategory,
  findSubcategory,
  materialSlugs,
} from "@/lib/catalogue";
import { fieldErrors } from "@/lib/form-errors";
import { maxPhotos } from "@/lib/photos";
import { isGarmentErrorKey, type GarmentErrorKey } from "./errors";

const photo = z.object({
  publicId: z.string().min(1).max(200),
  width: z.number().int().min(0),
  height: z.number().int().min(0),
});

const photos = z
  .string()
  .transform((value, context) => {
    try {
      return JSON.parse(value) as unknown;
    } catch {
      context.addIssue({ code: "custom", message: "photosRequired" });
      return z.NEVER;
    }
  })
  .pipe(
    z
      .array(photo, { error: "photosRequired" })
      .min(1, { error: "photosRequired" })
      .max(maxPhotos, { error: "photosTooMany" }),
  );

const category = z.string().transform((value, context) => {
  const [categorySlug, subcategorySlug] = value.split(":");
  const match = findCategory(categorySlug);
  const subcategory = findSubcategory(match, subcategorySlug);

  if (!match || (subcategorySlug && !subcategory)) {
    context.addIssue({ code: "custom", message: "categoryRequired" });
    return z.NEVER;
  }

  return { category: match.slug, subcategory: subcategory ?? null };
});

const price = z
  .string()
  .transform((value) => Number(value.replace(/\D/g, "") || "0"))
  .pipe(
    z
      .number()
      .int()
      .min(500, { error: "priceInvalid" })
      .max(10_000_000, { error: "priceInvalid" }),
  );

export const garmentSchema = z.object({
  photos,
  name: z
    .string()
    .trim()
    .min(2, { error: "nameRequired" })
    .max(80, { error: "nameTooLong" }),
  category,
  material: z
    .union([z.literal(""), z.enum(materialSlugs)])
    .transform((value) => value || null),
  audience: z.enum(audienceSlugs, { error: "audienceRequired" }),
  description: z
    .string()
    .trim()
    .max(1000, { error: "descriptionTooLong" })
    .transform((value) => value || null),
  story: z
    .string()
    .trim()
    .min(10, { error: "storyRequired" })
    .max(3000, { error: "storyTooLong" }),
  price,
});

export function garmentFieldErrors(error: z.ZodError) {
  return fieldErrors<GarmentErrorKey>(error, isGarmentErrorKey, "generic");
}
