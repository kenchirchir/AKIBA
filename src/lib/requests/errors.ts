export const requestErrorKeys = [
  "nameRequired",
  "phoneInvalid",
  "sizeRequired",
  "quantityInvalid",
  "neededByInvalid",
  "unavailable",
  "tooMany",
  "generic",
] as const;

export type RequestErrorKey = (typeof requestErrorKeys)[number];

export type RequestFormState = {
  errors?: Partial<Record<string, RequestErrorKey>>;
};

export function isRequestErrorKey(value: string): value is RequestErrorKey {
  return (requestErrorKeys as readonly string[]).includes(value);
}
