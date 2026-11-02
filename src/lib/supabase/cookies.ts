import type { CookieOptions } from "@supabase/ssr";

export const rememberCookie = "akiba_remember";

export function withRemember(
  value: string,
  options: CookieOptions,
  remember: boolean,
): CookieOptions {
  if (remember || !value) return options;
  return { ...options, maxAge: undefined, expires: undefined };
}
