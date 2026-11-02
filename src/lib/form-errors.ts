import type { z } from "zod";

export function fieldErrors<Key extends string>(
  error: z.ZodError,
  isKey: (value: string) => value is Key,
  fallback: Key,
) {
  const errors: Partial<Record<string, Key>> = {};

  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? "form");
    errors[field] ??= isKey(issue.message) ? issue.message : fallback;
  }

  return errors;
}
