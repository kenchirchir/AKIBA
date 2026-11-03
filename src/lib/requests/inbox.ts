import "server-only";
import { createServerSupabase } from "@/lib/supabase/server";

const maxShown = 100;

export async function getMyRequests(tailorId: string) {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("requests")
    .select(
      "id, buyer_name, buyer_phone, size, quantity, needed_by, best_time, status, created_at, garments(name)",
    )
    .eq("tailor_id", tailorId)
    .order("created_at", { ascending: false })
    .limit(maxShown);

  if (error) {
    throw new Error(`Could not load your requests: ${error.message}`);
  }

  return data;
}

export type MyRequest = Awaited<ReturnType<typeof getMyRequests>>[number];
