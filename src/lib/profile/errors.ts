export const profileErrorKeys = [
  "shopNameRequired",
  "fullNameRequired",
  "experienceRequired",
  "districtRequired",
  "sectorRequired",
  "locationRequired",
  "typesRequired",
  "aboutTooLong",
  "photoInvalid",
  "waitForPhotos",
  "pinInvalid",
  "pinWeak",
  "pinMismatch",
  "wrongPin",
  "locked",
  "generic",
] as const;

export type ProfileErrorKey = (typeof profileErrorKeys)[number];

export type ProfileFormState = {
  errors?: Partial<Record<string, ProfileErrorKey>>;
  minutes?: number;
};

export function isProfileErrorKey(value: string): value is ProfileErrorKey {
  return (profileErrorKeys as readonly string[]).includes(value);
}
