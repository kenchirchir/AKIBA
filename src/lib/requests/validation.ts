import { z } from "zod";
import { normalizeRwandaPhone } from "@/lib/auth/phone";
import { fieldErrors } from "@/lib/form-errors";
import { isRequestErrorKey, type RequestErrorKey } from "./errors";
import {
  bestTimes,
  kigaliDate,
  maxNeededByDays,
  maxQuantity,
  requestSizes,
} from "./options";

const phone = z.string().transform((value, context) => {
  const normalized = normalizeRwandaPhone(value);
  if (!normalized) {
    context.addIssue({ code: "custom", message: "phoneInvalid" });
    return z.NEVER;
  }
  return normalized;
});

const neededBy = z.iso
  .date({ error: "neededByInvalid" })
  .refine(
    (value) => value >= kigaliDate() && value <= kigaliDate(maxNeededByDays),
    { error: "neededByInvalid" },
  );

export const requestSchema = z.object({
  garmentId: z.uuid({ error: "unavailable" }),
  name: z
    .string()
    .trim()
    .min(2, { error: "nameRequired" })
    .max(80, { error: "nameRequired" }),
  phone,
  size: z.enum(requestSizes, { error: "sizeRequired" }),
  quantity: z.coerce
    .number({ error: "quantityInvalid" })
    .int({ error: "quantityInvalid" })
    .min(1, { error: "quantityInvalid" })
    .max(maxQuantity, { error: "quantityInvalid" }),
  neededBy,
  bestTime: z.enum(bestTimes, { error: "generic" }),
});

export type RequestDetails = z.infer<typeof requestSchema>;

export function requestFieldErrors(error: z.ZodError) {
  return fieldErrors<RequestErrorKey>(error, isRequestErrorKey, "generic");
}
