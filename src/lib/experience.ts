export const experienceLevels = [
  "new",
  "skilled",
  "experienced",
  "master",
] as const;

export type ExperienceLevel = (typeof experienceLevels)[number];

export function experienceLevel(totalMonths: number): ExperienceLevel {
  if (totalMonths < 12) return "new";
  if (totalMonths < 60) return "skilled";
  if (totalMonths < 120) return "experienced";
  return "master";
}

export function tailoringSince(
  years: number,
  months: number,
  today = new Date(),
) {
  const start = new Date(
    Date.UTC(
      today.getUTCFullYear() - years,
      today.getUTCMonth() - months,
      today.getUTCDate(),
    ),
  );
  return start.toISOString().slice(0, 10);
}

export function experienceFrom(since: string, today = new Date()) {
  const start = new Date(`${since}T00:00:00Z`);
  let totalMonths =
    (today.getUTCFullYear() - start.getUTCFullYear()) * 12 +
    (today.getUTCMonth() - start.getUTCMonth());

  if (today.getUTCDate() < start.getUTCDate()) totalMonths -= 1;
  totalMonths = Math.max(0, totalMonths);

  return {
    years: Math.floor(totalMonths / 12),
    months: totalMonths % 12,
    level: experienceLevel(totalMonths),
  };
}
