export const adminErrorKeys = [
  "emailInvalid",
  "passwordRequired",
  "wrongLogin",
  "notAdmin",
  "associationRequired",
  "officialRequired",
  "visitInvalid",
  "consentRequired",
  "reasonRequired",
  "generic",
] as const;

export type AdminErrorKey = (typeof adminErrorKeys)[number];

export type AdminFormState = {
  errors?: Partial<Record<string, AdminErrorKey>>;
};

export function isAdminErrorKey(value: string): value is AdminErrorKey {
  return (adminErrorKeys as readonly string[]).includes(value);
}
