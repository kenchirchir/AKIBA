import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";

export const getCurrentTailor = cache(async () => {
  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims.sub;

  if (!userId) return null;

  const { data: tailor } = await supabase
    .from("tailors")
    .select(
      "id, owner_name, shop_name, district, sector, status, avatar_public_id",
    )
    .eq("profile_id", userId)
    .maybeSingle();

  if (!tailor) return null;

  const [garments, requests] = await Promise.all([
    supabase
      .from("garments")
      .select("id", { count: "exact", head: true })
      .eq("tailor_id", tailor.id),
    supabase
      .from("requests")
      .select("id", { count: "exact", head: true })
      .eq("tailor_id", tailor.id)
      .eq("status", "new"),
  ]);

  return {
    ...tailor,
    garmentCount: garments.count ?? 0,
    newRequests: requests.count ?? 0,
  };
});

export type CurrentTailor = NonNullable<
  Awaited<ReturnType<typeof getCurrentTailor>>
>;

export function publicPageHref(tailor: CurrentTailor) {
  return tailor.status === "verified"
    ? `/tailors/${tailor.id}`
    : "/shop/preview";
}

export async function requireTailor() {
  const tailor = await getCurrentTailor();
  if (!tailor) redirect("/login");
  return tailor;
}
