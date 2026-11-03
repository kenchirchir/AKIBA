import type { useFormatter } from "next-intl";

type Formatter = ReturnType<typeof useFormatter>;

export function dateParts(format: Formatter, date: string) {
  const value = new Date(`${date}T00:00:00Z`);

  return {
    weekday: format.dateTime(value, { weekday: "short", timeZone: "UTC" }),
    day: format.dateTime(value, { day: "numeric", timeZone: "UTC" }),
    month: format.dateTime(value, { month: "short", timeZone: "UTC" }),
  };
}
