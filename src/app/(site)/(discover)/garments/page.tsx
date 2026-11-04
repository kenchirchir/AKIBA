import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { FeedFilters } from "@/components/garments/feed-filters";
import { GarmentGrid } from "@/components/garments/garment-grid";
import { Container } from "@/components/layout/container";
import { FeedHeader } from "@/components/layout/feed-header";
import { buttonClasses } from "@/components/ui/button";
import {
  findCategory,
  findCollection,
  findSubcategory,
  materialSlugs,
  tailoringTypeSlugs,
} from "@/lib/catalogue";
import { searchWords } from "@/lib/discover/search";
import { experienceLevels } from "@/lib/experience";
import { getFeedGarments } from "@/lib/garments";
import { findDistrict, findSector, sectorSlug } from "@/lib/kigali";

const pageSize = 24;
const maxPages = 10;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Feed");
  return { title: t("title") };
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function GarmentsPage({
  searchParams,
}: PageProps<"/garments">) {
  const params = await searchParams;
  const t = await getTranslations("Feed");
  const common = await getTranslations("Common");
  const catalogue = await getTranslations("Catalogue");

  const query = first(params.q)?.trim();
  const category = findCategory(first(params.category));
  const subcategory = findSubcategory(category, first(params.sub));
  const collection = findCollection(first(params.collection));
  const district = findDistrict(first(params.district));
  const sector = findSector(district, first(params.sector));
  const tailoringType = tailoringTypeSlugs.find(
    (slug) => slug === first(params.type),
  );
  const experience = experienceLevels.find(
    (level) => level === first(params.experience),
  );
  const material = materialSlugs.find(
    (slug) => slug === first(params.material),
  );
  const page = Math.min(
    Math.max(Math.trunc(Number(first(params.page))) || 1, 1),
    maxPages,
  );

  const what = subcategory
    ? catalogue(`subcategories.${subcategory}`)
    : category
      ? catalogue(`categories.${category.slug}`)
      : collection
        ? catalogue(`collections.${collection}`)
        : t("allGarments");
  const where = sector ?? district?.name ?? common("kigali");
  const subtitle = query
    ? `${t("resultsFor", { query })} · ${where}`
    : `${what} · ${where}`;

  const { garments, hasMore } = await getFeedGarments({
    search: query ? await searchWords(query) : [],
    category: category?.slug,
    subcategory,
    collection,
    district: district?.slug,
    sector: sector ? sectorSlug(sector) : undefined,
    tailoringType,
    experience,
    material,
    limit: pageSize * page,
  });

  const next = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    const single = first(value);
    if (single && key !== "page") next.set(key, single);
  }
  next.set("page", String(page + 1));
  const filtered = Object.keys(params).some((key) => key !== "page");

  return (
    <main className="flex-1">
      <Container>
        <FeedHeader
          title={t("title")}
          subtitle={subtitle}
          description={t("showcase")}
        />
        <div className="lg:grid lg:grid-cols-[232px_1fr] lg:items-start lg:gap-10 xl:grid-cols-[260px_1fr]">
          <FeedFilters className="hidden lg:sticky lg:top-28 lg:flex lg:pb-12" />
          <div>
            <p className="hidden pb-5 text-right text-caption text-secondary lg:block">
              {t("guidePrices")}
            </p>
            <GarmentGrid
              garments={garments}
              more={
                hasMore &&
                page < maxPages && (
                  <Link
                    href={`/garments?${next.toString()}`}
                    scroll={false}
                    className={buttonClasses({
                      variant: "secondary",
                      size: "md",
                    })}
                  >
                    {t("showMore")}
                  </Link>
                )
              }
              clearHref={filtered ? "/garments" : undefined}
            />
          </div>
        </div>
      </Container>
    </main>
  );
}
