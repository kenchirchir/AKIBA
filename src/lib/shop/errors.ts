export const garmentErrorKeys = [
  "photosRequired",
  "photosTooMany",
  "nameRequired",
  "nameTooLong",
  "categoryRequired",
  "audienceRequired",
  "descriptionTooLong",
  "storyRequired",
  "storyTooLong",
  "priceInvalid",
  "notFound",
  "generic",
] as const;

export type GarmentErrorKey = (typeof garmentErrorKeys)[number];

export type GarmentFormState = {
  errors?: Partial<Record<string, GarmentErrorKey>>;
};

export function isGarmentErrorKey(value: string): value is GarmentErrorKey {
  return (garmentErrorKeys as readonly string[]).includes(value);
}
