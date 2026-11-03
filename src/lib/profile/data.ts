import "server-only";
import { createServerSupabase } from "@/lib/supabase/server";

export const profileParts = [
  "avatar",
  "cover",
  "about",
  "shopAddress",
  "tailoringTypes",
] as const;

export async function getMyProfile(tailorId: string) {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("tailors")
    .select(
      "id, owner_name, shop_name, district, sector, shop_address, tailoring_types, tailoring_since, about, avatar_public_id, cover_public_id, sms_alerts, status, profiles(phone)",
    )
    .eq("id", tailorId)
    .single();

  if (error) {
    throw new Error(`Could not load your profile: ${error.message}`);
  }

  const filled = {
    avatar: Boolean(data.avatar_public_id),
    cover: Boolean(data.cover_public_id),
    about: Boolean(data.about),
    shopAddress: Boolean(data.shop_address),
    tailoringTypes: data.tailoring_types.length > 0,
  };
  const done = profileParts.filter((part) => filled[part]).length;

  return {
    ...data,
    phone: data.profiles?.phone ?? null,
    complete: Math.round((done / profileParts.length) * 100),
    missing: profileParts.find((part) => !filled[part]),
  };
}

export type MyProfile = Awaited<ReturnType<typeof getMyProfile>>;
