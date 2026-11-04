import { z } from "zod";
import { fieldErrors } from "@/lib/form-errors";
import { kigaliDate } from "@/lib/requests/options";
import { isAdminErrorKey, type AdminErrorKey } from "./errors";
import { rejectReasons } from "./options";

export const verificationSchema = z.object({
  tailorId: z.uuid({ error: "generic" }),
  association: z
    .string()
    .trim()
    .min(2, { error: "associationRequired" })
    .max(120, { error: "associationRequired" }),
  official: z
    .string()
    .trim()
    .min(2, { error: "officialRequired" })
    .max(120, { error: "officialRequired" }),
  visitDate: z.iso
    .date({ error: "visitInvalid" })
    .refine((value) => value <= kigaliDate(), { error: "visitInvalid" }),
  consent: z.literal("on", { error: "consentRequired" }),
  notes: z
    .string()
    .trim()
    .max(1000)
    .transform((value) => value || null),
});

export const rejectionSchema = z
  .object({
    garmentId: z.uuid({ error: "generic" }),
    reason: z.enum(rejectReasons, { error: "reasonRequired" }),
    note: z.string().trim().max(300),
  })
  .refine((data) => data.reason !== "other" || data.note.length > 0, {
    error: "reasonRequired",
    path: ["note"],
  });

export function adminFieldErrors(error: z.ZodError) {
  return fieldErrors<AdminErrorKey>(error, isAdminErrorKey, "generic");
}
