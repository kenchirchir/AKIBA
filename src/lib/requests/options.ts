export const requestSizes = [
  "xs",
  "s",
  "m",
  "l",
  "xl",
  "xxl",
  "measure",
] as const;

export const bestTimes = [
  "anytime",
  "morning",
  "afternoon",
  "evening",
] as const;

export const maxQuantity = 20;

export const maxNeededByDays = 365;

export type RequestSize = (typeof requestSizes)[number];
export type BestTime = (typeof bestTimes)[number];

const kigaliOffsetHours = 2;

export function findSize(value: string) {
  return requestSizes.find((size) => size === value);
}

export function findBestTime(value: string | null) {
  return bestTimes.find((time) => time === value) ?? "anytime";
}

export function kigaliDate(daysAhead = 0, now = new Date()) {
  const kigali = new Date(
    now.getTime() + kigaliOffsetHours * 3_600_000 + daysAhead * 86_400_000,
  );
  return kigali.toISOString().slice(0, 10);
}
