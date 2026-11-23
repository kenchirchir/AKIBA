import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import english from "../../messages/en.json";
import { defaultLocale, isLocale, localeCookie, type Locale } from "./config";

type Messages = { [key: string]: unknown };

function isObject(value: unknown): value is Messages {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function merge(base: Messages, override: Messages): Messages {
  const result: Messages = { ...base };
  for (const [key, value] of Object.entries(override)) {
    const current = result[key];
    result[key] =
      isObject(value) && isObject(current) ? merge(current, value) : value;
  }
  return result;
}

async function messagesFor(locale: Locale) {
  if (locale === "en") return english;
  const kinyarwanda = (await import("../../messages/rw.json")).default;
  return merge(english, kinyarwanda) as unknown as typeof english;
}

async function requestedLocale(): Promise<Locale> {
  const saved = (await cookies()).get(localeCookie)?.value;
  if (isLocale(saved)) return saved;

  const accepted = (await headers()).get("accept-language") ?? "";
  const first = accepted.split(",")[0]?.trim().toLowerCase() ?? "";
  return first.startsWith("rw") ? "rw" : defaultLocale;
}

export default getRequestConfig(async ({ locale: forced }) => {
  const locale = isLocale(forced) ? forced : await requestedLocale();

  return {
    locale,
    timeZone: "Africa/Kigali",
    messages: await messagesFor(locale),
  };
});
