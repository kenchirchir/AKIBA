import "server-only";
import { z } from "zod";
import { pendingCookie } from "@/lib/auth/pending";
import { createAdminClient } from "@/lib/supabase/admin";

export const sentRequest = pendingCookie<{ id: string }>("akiba_request");

export async function getSentRequest(garmentId: string) {
  const saved = await sentRequest.read();
  if (!saved || !z.uuid().safeParse(garmentId).success) return null;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("requests")
    .select(
      "id, size, quantity, needed_by, best_time, buyer_phone, garments(id, name, garment_photos(public_id)), tailors(owner_name, shop_name, district, sector, profiles(phone))",
    )
    .eq("id", saved.id)
    .eq("garment_id", garmentId)
    .order("position", { referencedTable: "garments.garment_photos" })
    .limit(1, { referencedTable: "garments.garment_photos" })
    .maybeSingle();

  if (error) {
    throw new Error(`Could not load the request: ${error.message}`);
  }

  return data;
}
