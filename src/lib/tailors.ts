import "server-only";
import { cache } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { TailoringTypeSlug } from "@/lib/catalogue";
import {
  experienceYears,
  tailoringSince,
  type ExperienceLevel,
} from "@/lib/experience";
import type { Database } from "@/lib/supabase/database.types";
import { createPublicClient } from "@/lib/supabase/public";
import { createServerSupabase } from "@/lib/supabase/server";

export type TailorFilters = {
  search?: string[];
  district?: string;
  sector?: string;
  tailoringType?: TailoringTypeSlug;
  experience?: ExperienceLevel;
};

type Supabase = SupabaseClient<Database>;

const coversPerCard = 3;

const cardFields =
  "id, shop_name, district, sector, tailoring_types, tailoring_since, avatar_public_id, pieces:garments(count), covers:garments(garment_photos(public_id))";

const profileFields =
  "id, owner_name, shop_name, district, sector, shop_address, tailoring_types, tailoring_since, about, avatar_public_id, cover_public_id, status, garments(id, name, garment_photos(public_id))";

function cardQuery(supabase: Supabase) {
  return supabase
    .from("tailors")
    .select(cardFields)
    .eq("status", "verified")
    .eq("pieces.status", "approved")
    .eq("covers.status", "approved")
    .order("published_at", { referencedTable: "covers", ascending: false })
    .limit(coversPerCard, { referencedTable: "covers" })
    .order("position", { referencedTable: "covers.garment_photos" })
    .limit(1, { referencedTable: "covers.garment_photos" });
}

type CardRow = NonNullable<
  Awaited<ReturnType<typeof cardQuery>>["data"]
>[number];

function toCard({ pieces, covers, ...tailor }: CardRow) {
  return {
    ...tailor,
    pieces: pieces[0]?.count ?? 0,
    covers: covers.flatMap((garment) =>
      garment.garment_photos.map((photo) => photo.public_id),
    ),
  };
}

export type ListedTailor = ReturnType<typeof toCard>;

export async function getTailors(filters: TailorFilters = {}) {
  let request = cardQuery(createPublicClient())
    .order("tailoring_since", { ascending: true, nullsFirst: false })
    .order("shop_name");

  for (const word of filters.search ?? []) {
    request = request.or(
      `shop_name.ilike.%${word}%,owner_name.ilike.%${word}%`,
    );
  }
  if (filters.district) {
    request = request.eq("district", filters.district);
  }
  if (filters.sector) {
    request = request.eq("sector", filters.sector);
  }
  if (filters.tailoringType) {
    request = request.contains("tailoring_types", [filters.tailoringType]);
  }
  if (filters.experience) {
    const [from, to] = experienceYears[filters.experience];
    if (from !== null) {
      request = request.lte("tailoring_since", tailoringSince(from, 0));
    }
    if (to !== null) {
      request = request.gt("tailoring_since", tailoringSince(to, 0));
    }
  }

  const { data, error } = await request;

  if (error) {
    throw new Error(`Could not load tailors: ${error.message}`);
  }

  return data.map(toCard);
}

export async function getTailorsById(ids: string[]) {
  if (ids.length === 0) return [];

  const { data, error } = await cardQuery(createPublicClient()).in("id", ids);

  if (error) {
    throw new Error(`Could not load tailors: ${error.message}`);
  }

  const order = new Map(ids.map((id, index) => [id, index]));
  return data
    .map(toCard)
    .sort(
      (first, second) =>
        (order.get(first.id) ?? 0) - (order.get(second.id) ?? 0),
    );
}

async function loadProfile(supabase: Supabase, id: string) {
  const { data, error } = await supabase
    .from("tailors")
    .select(profileFields)
    .eq("id", id)
    .eq("garments.status", "approved")
    .order("published_at", { referencedTable: "garments", ascending: false })
    .order("position", { referencedTable: "garments.garment_photos" })
    .limit(1, { referencedTable: "garments.garment_photos" })
    .maybeSingle();

  if (error) {
    throw new Error(`Could not load the tailor: ${error.message}`);
  }
  if (!data) return null;

  const { garments, ...tailor } = data;

  return {
    ...tailor,
    garments: garments.map(({ garment_photos, ...garment }) => ({
      ...garment,
      cover: garment_photos[0]?.public_id,
    })),
  };
}

export const getTailorProfile = cache(async (id: string) => {
  if (!z.uuid().safeParse(id).success) return null;

  const profile = await loadProfile(createPublicClient(), id);
  return profile?.status === "verified" ? profile : null;
});

export async function getProfilePreview(tailorId: string) {
  return loadProfile(await createServerSupabase(), tailorId);
}

export type TailorDetails = NonNullable<
  Awaited<ReturnType<typeof getTailorProfile>>
>;
