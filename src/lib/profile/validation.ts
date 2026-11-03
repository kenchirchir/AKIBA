import { z } from "zod";
import { isWeakPin } from "@/lib/auth/validation";
import { tailoringTypeSlugs } from "@/lib/catalogue";
import { fieldErrors } from "@/lib/form-errors";
import { findDistrict, sectorSlug } from "@/lib/kigali";
import { isProfileErrorKey, type ProfileErrorKey } from "./errors";

const pin = z.string().regex(/^\d{5}$/, { error: "pinInvalid" });

export const profileSchema = z
  .object({
    shopName: z
      .string()
      .trim()
      .min(2, { error: "shopNameRequired" })
      .max(80, { error: "shopNameRequired" }),
    fullName: z
      .string()
      .trim()
      .min(2, { error: "fullNameRequired" })
      .max(80, { error: "fullNameRequired" }),
    years: z
      .string()
      .regex(/^\d{1,2}$/, { error: "experienceRequired" })
      .transform(Number),
    months: z
      .string()
      .regex(/^(\d|1[01])$/, { error: "experienceRequired" })
      .transform(Number),
    district: z.string().refine((value) => Boolean(findDistrict(value)), {
      error: "districtRequired",
    }),
    sector: z.string().min(1, { error: "sectorRequired" }),
    shopAddress: z
      .string()
      .trim()
      .min(2, { error: "locationRequired" })
      .max(120, { error: "locationRequired" }),
    tailoringTypes: z
      .array(z.enum(tailoringTypeSlugs, { error: "typesRequired" }))
      .min(1, { error: "typesRequired" }),
    about: z
      .string()
      .trim()
      .max(2000, { error: "aboutTooLong" })
      .transform((value) => value || null),
    avatar: z.string().transform((value) => value || null),
    cover: z.string().transform((value) => value || null),
  })
  .refine(
    (data) =>
      Boolean(
        findDistrict(data.district)?.sectors.some(
          (name) => sectorSlug(name) === data.sector,
        ),
      ),
    { error: "sectorRequired", path: ["sector"] },
  );

export const changePinSchema = z
  .object({
    current: pin,
    pin: pin.refine((value) => !isWeakPin(value), { error: "pinWeak" }),
    confirm: z.string(),
  })
  .refine((data) => data.pin === data.confirm, {
    error: "pinMismatch",
    path: ["confirm"],
  });

export const confirmPinSchema = z.object({ pin });

export function profileFieldErrors(error: z.ZodError) {
  return fieldErrors<ProfileErrorKey>(error, isProfileErrorKey, "generic");
}
