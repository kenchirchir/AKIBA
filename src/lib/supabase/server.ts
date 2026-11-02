import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseConfig } from "./config";
import { rememberCookie, withRemember } from "./cookies";
import type { Database } from "./database.types";

export async function createServerSupabase(
  options: { remember?: boolean } = {},
) {
  const cookieStore = await cookies();
  const { url, publishableKey } = supabaseConfig();
  const remember =
    options.remember ?? cookieStore.get(rememberCookie)?.value !== "0";

  return createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options: cookieOptions } of cookiesToSet) {
            cookieStore.set(
              name,
              value,
              withRemember(value, cookieOptions, remember),
            );
          }
        } catch {
          return;
        }
      },
    },
  });
}
