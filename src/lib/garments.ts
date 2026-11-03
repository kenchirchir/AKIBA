import "server-only";
import { cache } from "react";
import { z } from "zod";
import type {
  CategorySlug,
  CollectionSlug,
  MaterialSlug,
  SubcategorySlug,
  TailoringTypeSlug,
} from "@/lib/catalogue";
import type { SearchWord } from "@/lib/discover/search";
import {
  experienceYears,
  tailoringSince,
  type ExperienceLevel,
} from "@/lib/experience";
import type { Photo } from "@/lib/photos";
import { createPublicClient } from "@/lib/supabase/public";

export type FeedFilters = {
  search?: SearchWord[];
  category?: CategorySlug;
  subcategory?: SubcategorySlug;
  collection?: CollectionSlug;
  district?: string;
  sector?: string;
  tailoringType?: TailoringTypeSlug;
  experience?: ExperienceLevel;
  material?: MaterialSlug;
  limit?: number;
};

type Supabase = ReturnType<typeof createPublicClient>;

const cardFields =
  "id, name, price_rwf, tailors!inner(id, shop_name, district, sector), garment_photos(public_id)";

const audiencesFor: Record<CollectionSlug, string[]> = {
  men: ["men", "unisex"],
  women: ["women", "unisex"],
};

async function matchingTailors(supabase: Supabase, words: SearchWord[]) {
  const { data } = await supabase
    .from("tailors")
    .select("id, shop_name, owner_name");

  return words.map((word) =>
    (data ?? [])
      .filter(
        (tailor) =>
          tailor.shop_name.toLowerCase().includes(word.text) ||
          tailor.owner_name.toLowerCase().includes(word.text),
      )
      .map((tailor) => tailor.id),
  );
}

function wordFilter(word: SearchWord, tailorIds: string[]) {
  const pattern = `%${word.text}%`;
  const conditions = [
    `name.ilike.${pattern}`,
    `description.ilike.${pattern}`,
    `story.ilike.${pattern}`,
  ];
  const lists = {
    material: word.materials,
    category: word.categories,
    subcategory: word.subcategories,
    tailor_id: tailorIds,
  };

  for (const [column, values] of Object.entries(lists)) {
    if (values.length > 0)
      conditions.push(`${column}.in.(${values.join(",")})`);
  }

  return conditions.join(",");
}

export async function getFeedGarments(filters: FeedFilters = {}) {
  const supabase = createPublicClient();
  const limit = filters.limit ?? 24;
  const search = filters.search ?? [];

  let request = supabase
    .from("garments")
    .select(cardFields)
    .eq("status", "approved")
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("position", { referencedTable: "garment_photos" })
    .limit(1, { referencedTable: "garment_photos" })
    .limit(limit + 1);

  if (search.length > 0) {
    const tailorIds = await matchingTailors(supabase, search);
    search.forEach((word, index) => {
      request = request.or(wordFilter(word, tailorIds[index]));
    });
  }
  if (filters.category) {
    request = request.eq("category", filters.category);
  }
  if (filters.subcategory) {
    request = request.eq("subcategory", filters.subcategory);
  }
  if (filters.collection) {
    request = request.in("audience", audiencesFor[filters.collection]);
  }
  if (filters.district) {
    request = request.eq("tailors.district", filters.district);
  }
  if (filters.sector) {
    request = request.eq("tailors.sector", filters.sector);
  }
  if (filters.tailoringType) {
    request = request.contains("tailors.tailoring_types", [
      filters.tailoringType,
    ]);
  }
  if (filters.experience) {
    const [from, to] = experienceYears[filters.experience];
    if (from !== null) {
      request = request.lte("tailors.tailoring_since", tailoringSince(from, 0));
    }
    if (to !== null) {
      request = request.gt("tailors.tailoring_since", tailoringSince(to, 0));
    }
  }
  if (filters.material) {
    request = request.eq("material", filters.material);
  }

  const { data, error } = await request;

  if (error) {
    throw new Error(`Could not load garments: ${error.message}`);
  }

  return { garments: data.slice(0, limit), hasMore: data.length > limit };
}

export type FeedGarment = Awaited<
  ReturnType<typeof getFeedGarments>
>["garments"][number];

export async function getGarmentsById(ids: string[]) {
  if (ids.length === 0) return [];

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("garments")
    .select(cardFields)
    .eq("status", "approved")
    .in("id", ids)
    .order("position", { referencedTable: "garment_photos" })
    .limit(1, { referencedTable: "garment_photos" });

  if (error) {
    throw new Error(`Could not load garments: ${error.message}`);
  }

  const order = new Map(ids.map((id, index) => [id, index]));
  return data.sort(
    (first, second) => (order.get(first.id) ?? 0) - (order.get(second.id) ?? 0),
  );
}

export const getGarmentStory = cache(async (id: string) => {
  if (!z.uuid().safeParse(id).success) return null;

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("garments")
    .select(
      "id, name, category, subcategory, material, audience, description, story, price_rwf, making_days, tailors!inner(id, shop_name, owner_name, district, sector, tailoring_since), garment_photos(public_id, width, height)",
    )
    .eq("id", id)
    .eq("status", "approved")
    .order("position", { referencedTable: "garment_photos" })
    .maybeSingle();

  if (error) {
    throw new Error(`Could not load the garment: ${error.message}`);
  }
  if (!data) return null;

  const { garment_photos: rows, ...garment } = data;
  const photos: Photo[] = rows.map((photo) => ({
    publicId: photo.public_id,
    width: photo.width ?? 0,
    height: photo.height ?? 0,
  }));

  return { ...garment, photos };
});

export type GarmentStory = NonNullable<
  Awaited<ReturnType<typeof getGarmentStory>>
>;
