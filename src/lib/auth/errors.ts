export const authErrorKeys = [
  "nameRequired",
  "phoneInvalid",
  "pinInvalid",
  "pinWeak",
  "pinMismatch",
  "districtRequired",
  "sectorRequired",
  "typesRequired",
  "experienceRequired",
  "locationRequired",
  "termsRequired",
  "codeInvalid",
  "codeWrong",
  "phoneTaken",
  "wrongPin",
  "locked",
  "tooManyCodes",
  "smsFailed",
  "noAccount",
  "setupFailed",
  "generic",
] as const;

export type AuthErrorKey = (typeof authErrorKeys)[number];

export type AuthFormState = {
  errors?: Partial<Record<string, AuthErrorKey>>;
  minutes?: number;
  sent?: boolean;
};

export function isAuthErrorKey(value: string): value is AuthErrorKey {
  return (authErrorKeys as readonly string[]).includes(value);
}
