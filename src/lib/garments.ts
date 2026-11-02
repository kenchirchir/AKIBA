import type {
  CategorySlug,
  CollectionSlug,
  SubcategorySlug,
} from "@/lib/catalogue";
import { createPublicClient } from "@/lib/supabase/public";

export type FeedFilters = {
  query?: string;
  category?: CategorySlug;
  subcategory?: SubcategorySlug;
  collection?: CollectionSlug;
  district?: string;
  sector?: string;
  limit?: number;
};

const audiencesFor = {
  men: ["men", "unisex"],
  women: ["women", "unisex"],
};

function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, (character) => `\\${character}`);
}

export async function getFeedGarments(filters: FeedFilters = {}) {
  const supabase = createPublicClient();

  let request = supabase
    .from("garments")
    .select(
      "id, name, price_rwf, tailors!inner(id, shop_name, district, sector), garment_photos(public_id)",
    )
    .eq("status", "approved")
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("position", { referencedTable: "garment_photos" })
    .limit(1, { referencedTable: "garment_photos" })
    .limit(filters.limit ?? 24);

  if (filters.query) {
    request = request.ilike("name", `%${escapeLike(filters.query)}%`);
  }
  if (filters.category) {
    request = request.eq("category", filters.category);
  }
  if (filters.subcategory) {
    request = request.eq("subcategory", filters.subcategory);
  }
  if (filters.collection === "men" || filters.collection === "women") {
    request = request.in("audience", audiencesFor[filters.collection]);
  }
  if (filters.district) {
    request = request.eq("tailors.district", filters.district);
  }
  if (filters.sector) {
    request = request.eq("tailors.sector", filters.sector);
  }

  const { data, error } = await request;

  if (error) {
    throw new Error(`Could not load garments: ${error.message}`);
  }

  return data;
}

export type FeedGarment = Awaited<ReturnType<typeof getFeedGarments>>[number];
