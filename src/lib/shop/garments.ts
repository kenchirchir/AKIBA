import "server-only";
import { z } from "zod";
import { createServerSupabase } from "@/lib/supabase/server";

export async function getMyGarments(tailorId: string) {
  const supabase = await createServerSupabase();

  const [garments, views] = await Promise.all([
    supabase
      .from("garments")
      .select("id, name, price_rwf, status, garment_photos(public_id)")
      .eq("tailor_id", tailorId)
      .order("created_at", { ascending: false })
      .order("position", { referencedTable: "garment_photos" })
      .limit(1, { referencedTable: "garment_photos" }),
    supabase.rpc("my_garment_views"),
  ]);

  if (garments.error) {
    throw new Error(`Could not load your garments: ${garments.error.message}`);
  }

  const counts = new Map(
    views.data?.map((row) => [row.garment_id, row.views] as const),
  );

  return garments.data.map(({ garment_photos, ...garment }) => ({
    ...garment,
    cover: garment_photos[0]?.public_id,
    views: counts.get(garment.id) ?? 0,
  }));
}

export type MyGarment = Awaited<ReturnType<typeof getMyGarments>>[number];

export async function getMyGarment(tailorId: string, id: string) {
  if (!z.uuid().safeParse(id).success) return null;

  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("garments")
    .select(
      "id, name, category, subcategory, audience, material, description, story, price_rwf, status, rejection_reason, garment_photos(public_id, width, height)",
    )
    .eq("id", id)
    .eq("tailor_id", tailorId)
    .order("position", { referencedTable: "garment_photos" })
    .maybeSingle();

  if (!data) return null;

  const { garment_photos, ...garment } = data;

  return {
    ...garment,
    photos: garment_photos.map((photo) => ({
      publicId: photo.public_id,
      width: photo.width ?? 0,
      height: photo.height ?? 0,
    })),
  };
}

export type GarmentDetails = NonNullable<
  Awaited<ReturnType<typeof getMyGarment>>
>;
