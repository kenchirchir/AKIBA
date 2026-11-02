import "server-only";
import { createClient } from "@supabase/supabase-js";
import { supabaseConfig } from "./config";
import type { Database } from "./database.types";

export function createAdminClient() {
  const { url } = supabaseConfig();
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!secretKey) {
    throw new Error(
      "SUPABASE_SECRET_KEY is missing. Add it to .env.local and to Vercel.",
    );
  }

  return createClient<Database>(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
