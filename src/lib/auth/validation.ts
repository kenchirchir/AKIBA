import { z } from "zod";
import { tailoringTypeSlugs } from "@/lib/catalogue";
import { findDistrict, sectorSlug } from "@/lib/kigali";
import { isAuthErrorKey, type AuthErrorKey } from "./errors";
import { normalizeRwandaPhone } from "./phone";

const guessablePins = new Set([
  "01234",
  "12345",
  "23456",
  "34567",
  "45678",
  "56789",
  "98765",
  "87654",
  "76543",
  "65432",
  "54321",
  "43210",
]);

export function isWeakPin(pin: string) {
  return /^(\d)\1{4}$/.test(pin) || guessablePins.has(pin);
}

const phone = z.string().transform((value, context) => {
  const normalized = normalizeRwandaPhone(value);
  if (!normalized) {
    context.addIssue({ code: "custom", message: "phoneInvalid" });
    return z.NEVER;
  }
  return normalized;
});

const pin = z.string().regex(/^\d{5}$/, { error: "pinInvalid" });

const newPin = pin.refine((value) => !isWeakPin(value), { error: "pinWeak" });

const code = z.string().regex(/^\d{6}$/, { error: "codeInvalid" });

const sectorBelongsToDistrict = (district: string, sector: string) =>
  Boolean(
    findDistrict(district)?.sectors.some((name) => sectorSlug(name) === sector),
  );

export const signUpSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, { error: "nameRequired" })
      .max(80, { error: "nameRequired" }),
    phone,
    pin: newPin,
    district: z.string().refine((value) => Boolean(findDistrict(value)), {
      error: "districtRequired",
    }),
    sector: z.string().min(1, { error: "sectorRequired" }),
    tailoringTypes: z
      .array(z.enum(tailoringTypeSlugs, { error: "typesRequired" }))
      .min(1, { error: "typesRequired" }),
    years: z
      .string()
      .regex(/^\d{1,2}$/, { error: "experienceRequired" })
      .transform(Number),
    months: z
      .string()
      .regex(/^(\d|1[01])$/, { error: "experienceRequired" })
      .transform(Number),
    shopAddress: z
      .string()
      .trim()
      .min(2, { error: "locationRequired" })
      .max(120, { error: "locationRequired" }),
    terms: z.literal("on", { error: "termsRequired" }),
  })
  .refine((data) => sectorBelongsToDistrict(data.district, data.sector), {
    error: "sectorRequired",
    path: ["sector"],
  });

export const shopDetailsSchema = z
  .object({
    fullName: z.string().trim().min(2).max(80),
    district: z.string(),
    sector: z.string(),
    shopAddress: z.string().trim().min(2).max(120),
    tailoringTypes: z.array(z.enum(tailoringTypeSlugs)).min(1),
    tailoringSince: z.iso.date(),
  })
  .refine((data) => sectorBelongsToDistrict(data.district, data.sector));

export type ShopDetails = z.infer<typeof shopDetailsSchema>;

export const loginSchema = z.object({ phone, pin });

export const phoneSchema = z.object({ phone });

export const codeSchema = z.object({ code });

export const newPinSchema = z
  .object({ code, pin: newPin, confirm: z.string() })
  .refine((data) => data.pin === data.confirm, {
    error: "pinMismatch",
    path: ["confirm"],
  });

export function fieldErrors(error: z.ZodError) {
  const errors: Partial<Record<string, AuthErrorKey>> = {};

  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? "form");
    errors[field] ??= isAuthErrorKey(issue.message) ? issue.message : "generic";
  }

  return errors;
}
