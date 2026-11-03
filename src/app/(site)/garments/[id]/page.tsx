import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { RequestSheet } from "@/components/requests/request-sheet";
import { BackButton } from "@/components/story/back-button";
import { MakerCard } from "@/components/story/maker-card";
import { PhotoCarousel } from "@/components/story/photo-carousel";
import { SaveButton } from "@/components/story/save-button";
import { StoryText } from "@/components/story/story-text";
import { StoryTracker } from "@/components/story/story-tracker";
import {
  audienceSlugs,
  findCategory,
  findSubcategory,
  materialSlugs,
} from "@/lib/catalogue";
import { getGarmentStory } from "@/lib/garments";
import { areaNames } from "@/lib/kigali";
import { photoUrl } from "@/lib/photos";

export const revalidate = 60;

const shareWidth = 1200;

export async function generateStaticParams() {
  return [];
}

function excerpt(text: string, length = 160) {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length > length
    ? `${flat.slice(0, length - 1).trimEnd()}…`
    : flat;
}

export async function generateMetadata({
  params,
}: PageProps<"/garments/[id]">): Promise<Metadata> {
  const { id } = await params;
  const garment = await getGarmentStory(id);
  if (!garment) return {};

  const cover = garment.photos[0];
  const description = excerpt(garment.story);
  const width = cover ? Math.min(shareWidth, cover.width) : 0;

  return {
    title: garment.name,
    description,
    openGraph: {
      type: "article",
      title: garment.name,
      description,
      images:
        cover && width > 0
          ? [
              {
                url: photoUrl(cover.publicId, shareWidth),
                width,
                height: Math.round((width * cover.height) / cover.width),
              },
            ]
          : undefined,
    },
  };
}

export default async function GarmentStoryPage({
  params,
}: PageProps<"/garments/[id]">) {
  const { id } = await params;
  const garment = await getGarmentStory(id);
  if (!garment) notFound();

  const t = await getTranslations("GarmentStory");
  const catalogue = await getTranslations("Catalogue");
  const category = findCategory(garment.category);
  const subcategory = findSubcategory(
    category,
    garment.subcategory ?? undefined,
  );
  const material = materialSlugs.find((slug) => slug === garment.material);
  const audience = audienceSlugs.find((slug) => slug === garment.audience);

  const facts: [string, string][] = [];
  if (material) facts.push([t("material"), catalogue(`materials.${material}`)]);
  if (subcategory) {
    facts.push([t("category"), catalogue(`subcategories.${subcategory}`)]);
  } else if (category) {
    facts.push([t("category"), catalogue(`categories.${category.slug}`)]);
  }
  if (audience) facts.push([t("madeFor"), catalogue(`audiences.${audience}`)]);
  if (garment.making_days) {
    facts.push([t("madeIn"), t("days", { count: garment.making_days })]);
  }

  return (
    <main className="flex-1 md:py-8 lg:py-10">
      <StoryTracker garmentId={garment.id} />
      <div className="md:mx-auto md:grid md:max-w-[1320px] md:grid-cols-2 md:items-start md:gap-8 md:px-8 lg:gap-12 lg:px-10">
        <div className="relative">
          <PhotoCarousel name={garment.name} photos={garment.photos} />
          <BackButton className="absolute top-4 left-4" />
          <SaveButton
            garmentId={garment.id}
            className="absolute top-4 right-4"
          />
        </div>
        <article className="flex flex-col gap-6 px-5 pt-6 pb-12 md:px-0 md:pt-0">
          <header className="flex flex-col gap-3">
            <div>
              <h1 className="text-title lg:text-[36px] lg:leading-tight">
                {garment.name}
              </h1>
              <p className="mt-1 text-[26px] leading-tight font-semibold text-teal">
                {t("price", { price: garment.price_rwf })}
              </p>
            </div>
            {facts.length > 0 && (
              <dl className="flex flex-wrap gap-x-4 gap-y-1 text-caption text-secondary">
                {facts.map(([label, value]) => (
                  <div key={label} className="flex gap-1">
                    <dt>{label}:</dt>
                    <dd className="text-ink">{value}</dd>
                  </div>
                ))}
              </dl>
            )}
            <p className="text-caption text-secondary">{t("guidePrice")}</p>
          </header>
          <MakerCard tailor={garment.tailors} />
          <section className="flex flex-col gap-2">
            <h2 className="text-section">{t("story")}</h2>
            <StoryText text={garment.story} />
          </section>
          {garment.description && (
            <section className="flex flex-col gap-2">
              <h2 className="text-section">{t("description")}</h2>
              <p className="text-body whitespace-pre-line text-ink-soft">
                {garment.description}
              </p>
            </section>
          )}
          <RequestSheet
            garment={{
              id: garment.id,
              name: garment.name,
              price: garment.price_rwf,
              cover: garment.photos[0]?.publicId,
              shop: garment.tailors.shop_name,
              area: areaNames(garment.tailors.district, garment.tailors.sector)
                .sector,
              tailorName: garment.tailors.owner_name.split(/\s+/)[0],
            }}
          />
        </article>
      </div>
    </main>
  );
}
