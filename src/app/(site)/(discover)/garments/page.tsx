import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/layout/container";
import { FeedHeader } from "@/components/layout/feed-header";
import { LogoBar } from "@/components/layout/logo-bar";
import { SampleGarments } from "@/components/layout/sample-garments";
import { findCategory, findCollection, findSubcategory } from "@/lib/catalogue";
import { findDistrict, findSector } from "@/lib/kigali";

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

  return (
    <main className="flex-1">
      <LogoBar />
      <Container>
        <FeedHeader
          title={t("title")}
          subtitle={subtitle}
          description={t("showcase")}
        />
        <SampleGarments />
      </Container>
    </main>
  );
}
